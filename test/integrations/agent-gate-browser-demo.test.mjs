/**
 * test/integrations/agent-gate-browser-demo.test.mjs
 *
 * Contract for the browser demo a judge is told to run. Without it the page
 * would be a mock-up with a verified-looking label, which is the failure this
 * repo keeps guarding against.
 *
 * What is bound here:
 *   1. the page really probes `window.freighterApi` / `window.stellar.freighter`
 *      and carries the sentence that says what happens when they are absent;
 *   2. /api/prepare returns an ALLOW decision for its own mandate and a hash
 *      that matches a fresh decode;
 *   3. a signed envelope completes as VERIFIED with a VERIFIED receipt;
 *   4. a one-stroop tamper is refused by name (MISMATCH on `amount`);
 *   5. junk input is REFUSED rather than thrown at the reader.
 *
 * The server runs on an ephemeral loopback port and never submits to a network:
 * the demo's honest ceiling is that nothing reaches a ledger.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import * as Stellar from "@stellar/stellar-sdk";

import { createDemoServer } from "../../examples/agent-gate-browser/serve.mjs";
import { decodeEnvelope } from "../../packages/agent-gate/adapters/stellar-xdr.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const PAGE = join(REPO, "examples", "agent-gate-browser", "index.html");

async function withServer(fn, options = {}) {
  const server = createDemoServer(options);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  try {
    return await fn(base, server);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function post(base, path, body = {}) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: response.status, data: await response.json() };
}

test("the page probes the real wallet surfaces and states their absence", () => {
  const html = readFileSync(PAGE, "utf8");
  assert.match(html, /window\.freighterApi/, "the page must probe window.freighterApi");
  assert.match(html, /window\.stellar\?\.freighter/, "the page must keep the window.stellar.freighter fallback");
  assert.match(html, /Freighter غير مثبت/, "the page must say what a missing extension means, in Arabic");
  assert.match(html, /local demo keypair/, "the page must name the local signer in English too");
  assert.match(html, /لا يُرسل/, "the page must state that nothing is submitted");
  assert.doesNotMatch(html, /TESTNET VERIFIED|PRODUCTION READY|MAINNET VERIFIED/, "no combined verdict label may appear");
});

test("prepare authorizes its own intent and the hash matches a fresh decode", async () => {
  await withServer(async (base) => {
    const { status, data } = await post(base, "/api/prepare", {});
    assert.equal(status, 200);
    assert.equal(data.decision.verdict, "ALLOW", `gate refused its own demo intent: ${data.decision.reasons}`);
    assert.ok(data.xdr, "prepare must return an envelope");
    const decoded = decodeEnvelope({ xdr: data.xdr, network: "testnet" });
    assert.equal(decoded.ok, true, decoded.error);
    assert.equal(decoded.execution.txHash, data.txHash, "the returned hash must be the envelope's own hash");
    assert.equal(decoded.execution.signatureCount, 0, "the prepared envelope must be unsigned");
    assert.equal(data.walletKind, "local-demo-keypair", "without an extension the page must be told it is the demo signer");
  });
});

test("a signed envelope completes as VERIFIED with a VERIFIED receipt", async () => {
  await withServer(async (base) => {
    await post(base, "/api/prepare", {});
    const signed = await post(base, "/api/demo-sign", {});
    assert.equal(signed.data.signer, "local-demo-keypair");
    const { status, data } = await post(base, "/api/complete", { signedXdr: signed.data.signedXdr });
    assert.equal(status, 200);
    assert.equal(data.conformance.verdict, "VERIFIED");
    assert.equal(data.receiptStatus, "VERIFIED");
    assert.ok(data.receiptId.startsWith("sha256:"), "a receipt id is a domain-separated digest");
    assert.equal(data.signatureCount, 1);
    assert.match(data.ceiling, /never submitted/i, "the response must carry its ceiling, not bury it");
  });
});

test("a one-stroop tamper is refused by name", async () => {
  await withServer(async (base) => {
    await post(base, "/api/prepare", {});
    const tampered = await post(base, "/api/tamper", {});
    assert.equal(tampered.data.amount, "0.5000001");
    const { status, data } = await post(base, "/api/complete", { signedXdr: tampered.data.signedXdr });
    assert.equal(status, 422);
    assert.equal(data.state, "MISMATCH");
    const fields = data.conformance.mismatches.map((m) => m.field);
    assert.ok(fields.includes("amount"), `mismatch must name the amount, got ${JSON.stringify(fields)}`);
    assert.equal(data.ok, false);
  });
});

test("junk input is REFUSED instead of thrown", async () => {
  await withServer(async (base) => {
    await post(base, "/api/prepare", {});
    const { status, data } = await post(base, "/api/complete", { signedXdr: "not-an-envelope" });
    assert.equal(status, 422);
    assert.equal(data.state, "REFUSED");
    assert.match(data.error, /decode failed|secret key/i);
  });
});

/* ---- the promotion path: only a REAL key signature may write evidence ---- */

function signWith(keypair, xdr) {
  const tx = Stellar.TransactionBuilder.fromXDR(xdr, Stellar.Networks.TESTNET);
  tx.sign(keypair);
  return tx.toXDR();
}

function newArtifactPath() {
  return join(mkdtempSync(join(tmpdir(), "cg-attest-")), "extension-signature.json");
}

test("attestation is refused when the declared key did not sign, and writes nothing", async () => {
  const target = newArtifactPath();
  await withServer(async (base) => {
    await post(base, "/api/prepare", {});
    const signed = await post(base, "/api/demo-sign", {});
    const stranger = Stellar.Keypair.random().publicKey();
    const { status, data } = await post(base, "/api/attest", {
      signedXdr: signed.data.signedXdr,
      walletPublicKey: stranger,
      declaredWallet: "freighter-extension",
    });
    assert.equal(status, 422);
    assert.equal(data.state, "REFUSED");
    assert.match(data.error, /no valid signature by the declared wallet key/);
    assert.throws(() => readFileSync(target, "utf8"), /ENOENT/, "a refused attestation must not write an artifact");
  }, { attestationPath: target });

  // A local keypair may not attest at all, even with a perfectly valid signature.
  await withServer(async (base) => {
    const wallet = Stellar.Keypair.random();
    const prepared = await post(base, "/api/prepare", { source: wallet.publicKey() });
    const { status, data } = await post(base, "/api/attest", {
      signedXdr: signWith(wallet, prepared.data.xdr),
      walletPublicKey: wallet.publicKey(),
      declaredWallet: "local-demo-keypair",
    });
    assert.equal(status, 422);
    assert.match(data.error, /only a Freighter extension signature may be attested/);
  }, { attestationPath: target });
});

test("a signature by the declared key writes an artifact that names its own ceiling", async () => {
  const target = newArtifactPath();
  const wallet = Stellar.Keypair.random();
  await withServer(async (base) => {
    const prepared = await post(base, "/api/prepare", { source: wallet.publicKey() });
    const signedXdr = signWith(wallet, prepared.data.xdr);
    const { status, data } = await post(base, "/api/attest", {
      signedXdr,
      walletPublicKey: wallet.publicKey(),
      declaredWallet: "freighter-extension",
    });
    assert.equal(status, 200);
    assert.equal(data.state, "ATTESTED");

    const artifact = JSON.parse(readFileSync(target, "utf8"));
    assert.equal(artifact.artifact, "agent-gate-freighter-extension-signature");
    assert.equal(artifact.wallet.publicKey, wallet.publicKey());
    assert.equal(artifact.wallet.declared, "freighter-extension");
    assert.match(artifact.wallet.provenance, /not the software that produced it/);
    assert.equal(artifact.conformance.verdict, "VERIFIED");
    assert.equal(artifact.promotion.to, "BUILT");
    assert.match(artifact.ceiling, /does not prove which software held the key/);

    // The verifier re-derives it offline and only then offers the promotion.
    const verified = spawnSync(process.execPath, ["scripts/agent-gate-freighter-attest.mjs", "--verify", "--artifact", target], {
      cwd: REPO,
      encoding: "utf8",
      timeout: 60_000,
    });
    assert.equal(verified.status, 0, `${verified.stdout}\n${verified.stderr}`);
    assert.match(verified.stdout, /FREIGHTER-ATTEST: PASS/);

    // Tampering with the recorded signature must break the re-derivation.
    const broken = { ...artifact, wallet: { ...artifact.wallet, publicKey: Stellar.Keypair.random().publicKey() } };
    const brokenPath = `${target}.broken.json`;
    writeFileSync(brokenPath, JSON.stringify(broken));
    const refused = spawnSync(process.execPath, ["scripts/agent-gate-freighter-attest.mjs", "--verify", "--artifact", brokenPath], {
      cwd: REPO,
      encoding: "utf8",
      timeout: 60_000,
    });
    assert.equal(refused.status, 1, "a swapped wallet key must fail the signature check");
    assert.match(refused.stderr, /no valid signature by wallet.publicKey/);
  }, { attestationPath: target });
});

test("without an artifact the surface stays unpromoted", () => {
  const missing = newArtifactPath();
  const result = spawnSync(process.execPath, ["scripts/agent-gate-freighter-attest.mjs", "--verify", "--artifact", missing], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 60_000,
  });
  assert.equal(result.status, 3);
  assert.match(result.stdout, /FREIGHTER-ATTEST: NOT_PERFORMED/);
  assert.match(result.stdout, /stays BUILT_UNVERIFIED/);
});
