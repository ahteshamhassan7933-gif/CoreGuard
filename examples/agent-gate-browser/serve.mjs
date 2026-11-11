#!/usr/bin/env node
/**
 * examples/agent-gate-browser/serve.mjs — the browser demo a judge can run
 *
 *   node examples/agent-gate-browser/serve.mjs        then open the printed URL
 *
 * Why a server: the gate's hashing and Ed25519 receipts use node:crypto, so the
 * engine that DECIDES has to stay in Node. The browser owns exactly one thing —
 * the wallet — which is the whole point: the key never reaches the server.
 *
 * The wallet layer calls the real Freighter surface (`window.freighterApi`,
 * falling back to `window.stellar.freighter`), and when the extension is absent
 * the page says so and offers a labelled local demo signer instead of pretending.
 *
 * Endpoints (JSON):
 *   POST /api/prepare    → decision + unsigned envelope + txHash
 *   POST /api/demo-sign  → signs with an in-memory demo keypair (labelled)
 *   POST /api/tamper     → a signed envelope for a DIFFERENT amount, on purpose
 *   POST /api/complete   → decode → conformance → receipt → independent verify
 *
 * The demo never submits to a network and never claims it did: `execution`
 * status stays SIGNED_NOT_SUBMITTED, and the response carries the ceiling.
 */

import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as Stellar from "@stellar/stellar-sdk";

import {
  evaluate,
  checkConformance,
  issueReceipt,
  verifyReceipt,
  generateOperatorKeyPair,
} from "../../packages/agent-gate/index.mjs";
import {
  buildPaymentEnvelope,
  decodeEnvelope,
  NETWORK_PASSPHRASE,
} from "../../packages/agent-gate/adapters/stellar-xdr.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PAGE = join(HERE, "index.html");
/** Where a REAL extension signature is recorded. Refused signatures write nothing. */
const ATTESTATION = join(HERE, "..", "..", "docs", "evidence", "agent-gate-freighter-extension-signature.json");
const sha256 = (text) => createHash("sha256").update(text, "utf8").digest("hex");
const NETWORK = "testnet";
const CEILING =
  "The gate, conformance and receipt verification are real; the envelope is never submitted here. " +
  "If the extension is missing, the signature came from a local demo keypair — that is recorded, not implied.";

const json = (res, status, body) => {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(payload);
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) reject(new Error("body too large"));
    });
    req.on("end", () => {
      if (!raw.trim()) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(new Error(`body is not JSON: ${e.message}`));
      }
    });
    req.on("error", reject);
  });
}

/**
 * One in-memory session: the mandate, the authorized intent and the keys the
 * demo signs with when the extension is absent. Nothing is written to disk.
 */
export function createDemoSession({ now = () => new Date(), attestationPath = null } = {}) {
  const signer = Stellar.Keypair.random();
  const recipient = Stellar.Keypair.random();
  const operator = generateOperatorKeyPair();
  const state = { built: null, intent: null, policy: null, decision: null };

  function prepare(body = {}) {
    const at = now();
    const amount = typeof body.amount === "string" ? body.amount : "0.5000000";
    const memo = typeof body.memo === "string" ? body.memo : "cg-browser-demo";
    const sequence = typeof body.sequence === "string" ? body.sequence : "1";
    const source = typeof body.source === "string" && body.source.startsWith("G") ? body.source : signer.publicKey();

    const intent = {
      agentId: "agent://coreguard/browser-demo",
      source,
      destination: recipient.publicKey(),
      amount,
      asset: "XLM",
      network: NETWORK,
      memo,
      createdAt: at.toISOString(),
      expiresAt: new Date(at.getTime() + 10 * 60_000).toISOString(),
      nonce: 1,
    };
    const policy = {
      version: "AGENT-POLICY/1",
      network: NETWORK,
      assets: ["XLM"],
      recipients: [intent.destination],
      agents: [intent.agentId],
      perTxMax: "1",
      windowMax: "10",
      windowSpent: "0",
      windowId: `demo-${at.toISOString().slice(0, 10)}`,
      requireMemo: true,
    };

    const decision = evaluate({ intent, policy, now: at.toISOString() });
    state.intent = intent;
    state.policy = policy;
    state.decision = decision;
    state.built = null;

    if (decision.verdict !== "ALLOW") {
      return { decision, intent, policy, xdr: null, txHash: null, walletKind: "none" };
    }

    const built = buildPaymentEnvelope({
      source: intent.source,
      sequence,
      destination: intent.destination,
      amount: intent.amount,
      asset: intent.asset,
      memo: intent.memo,
      network: NETWORK,
      fee: "100",
    });
    if (!built.ok) throw new Error(`envelope build failed: ${built.error}`);
    state.built = { ...built, sequence };
    return {
      decision,
      intent,
      policy,
      xdr: built.xdr,
      txHash: built.txHash,
      walletKind: body.extensionPresent ? "freighter-extension" : "local-demo-keypair",
    };
  }

  function sign(xdr) {
    if (typeof xdr !== "string" || !xdr.trim()) throw new Error("xdr required");
    const tx = Stellar.TransactionBuilder.fromXDR(xdr, NETWORK_PASSPHRASE[NETWORK]);
    tx.sign(signer);
    return tx.toXDR();
  }

  function demoSign() {
    if (!state.built) throw new Error("prepare first");
    return { signedXdr: sign(state.built.xdr), signer: "local-demo-keypair", txHash: state.built.txHash };
  }

  /** A deliberately wrong envelope: same recipient, one stroop more. */
  function tamper() {
    if (!state.built) throw new Error("prepare first");
    const wrong = buildPaymentEnvelope({
      source: state.intent.source,
      sequence: state.built.sequence,
      destination: state.intent.destination,
      amount: "0.5000001",
      asset: state.intent.asset,
      memo: state.intent.memo,
      network: NETWORK,
      fee: "100",
    });
    if (!wrong.ok) throw new Error(`tamper build failed: ${wrong.error}`);
    return { signedXdr: sign(wrong.xdr), amount: "0.5000001", note: "one stroop above the authorized amount" };
  }

  function complete(body = {}) {
    if (!state.intent) throw new Error("prepare first");
    const decoded = decodeEnvelope({ xdr: body.signedXdr, network: NETWORK });
    if (!decoded.ok) return { ok: false, state: "REFUSED", error: decoded.error };

    const execution = { ...decoded.execution, status: "SIGNED_NOT_SUBMITTED" };
    const conformance = checkConformance({ intent: state.intent, execution });
    const receipt = issueReceipt({
      intent: state.intent,
      policy: state.policy,
      execution,
      decision: state.decision,
      now: new Date().toISOString(),
      privateKeyPem: operator.privateKeyPem,
    });
    const verified = verifyReceipt({ receipt, publicKeyPem: operator.publicKeyPem });

    return {
      ok: conformance.verdict === "VERIFIED",
      state: conformance.verdict,
      conformance,
      gateVerdict: state.decision.verdict,
      signatureCount: execution.signatureCount,
      txHash: execution.txHash,
      receiptId: receipt.receiptId,
      receiptStatus: verified.status,
      perOp: execution.operations.map((op) => ({ destination: op.destination, amount: op.amount, asset: op.asset })),
      ceiling: CEILING,
    };
  }

  /**
   * Record an EXTENSION signature as evidence — the one thing that may promote
   * `agent-gate-freighter` from BUILT_UNVERIFIED to BUILT.
   *
   * Three gates before a byte is written, because the whole surface is worthless
   * if this path can be talked into a file:
   *   1. the caller must declare the extension (a local keypair may not attest);
   *   2. the envelope must conform to the authorized intent;
   *   3. the envelope must carry a VALID signature by the declared public key —
   *      verified here with Ed25519, not taken on the page's word.
   *
   * What the artifact still cannot prove is written into it: the server verified
   * the signature, not the software that produced it.
   */
  function attest(body = {}) {
    if (!state.intent) throw new Error("prepare first");
    if (body.declaredWallet !== "freighter-extension") {
      return { ok: false, state: "REFUSED", error: "only a Freighter extension signature may be attested; a local keypair may not" };
    }
    const decoded = decodeEnvelope({ xdr: body.signedXdr, network: NETWORK });
    if (!decoded.ok) return { ok: false, state: "REFUSED", error: decoded.error };

    const execution = { ...decoded.execution, status: "SIGNED_NOT_SUBMITTED" };
    const conformance = checkConformance({ intent: state.intent, execution });
    if (conformance.verdict !== "VERIFIED") {
      return { ok: false, state: "MISMATCH", conformance, error: "the envelope does not match the authorized intent" };
    }

    const wallet = typeof body.walletPublicKey === "string" ? body.walletPublicKey.trim() : "";
    if (!/^G[A-Z2-7]{55}$/.test(wallet)) {
      return { ok: false, state: "REFUSED", error: "walletPublicKey must be a Stellar public key" };
    }

    let signatureOk = false;
    try {
      const tx = Stellar.TransactionBuilder.fromXDR(body.signedXdr, NETWORK_PASSPHRASE[NETWORK]);
      const keypair = Stellar.Keypair.fromPublicKey(wallet);
      const hint = Buffer.from(keypair.signatureHint());
      // SDK v17 exposes the XDR opaques as { value: Buffer } — not as methods.
      const carried = tx.signatures.find((s) => Buffer.from(s.hint.value).equals(hint));
      signatureOk = Boolean(carried) && keypair.verify(tx.hash(), Buffer.from(carried.signature.value));
    } catch {
      signatureOk = false;
    }
    if (!signatureOk) {
      return { ok: false, state: "REFUSED", error: "the envelope carries no valid signature by the declared wallet key" };
    }

    const artifact = {
      schema: "CoreGuard-Evidence/1",
      artifact: "agent-gate-freighter-extension-signature",
      version: "FREIGHTER-ADAPTER/1",
      network: NETWORK,
      attestedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
      wallet: {
        publicKey: wallet,
        declared: "freighter-extension",
        provenance:
          "declared by the page; the attestation verified the Ed25519 signature, not the software that produced it",
      },
      intent: state.intent,
      policy: state.policy,
      gate: { verdict: state.decision.verdict, reasons: state.decision.reasons },
      envelope: { signedXdr: body.signedXdr, signedXdrSha256: sha256(body.signedXdr), txHash: execution.txHash },
      conformance: { verdict: conformance.verdict, mismatches: conformance.mismatches },
      promotion: {
        surface: "agent-gate-freighter",
        from: "BUILT_UNVERIFIED",
        to: "BUILT",
        command: "node scripts/agent-gate-freighter-attest.mjs --verify",
      },
      ceiling:
        "An extension signature over an authorized envelope, verified by Ed25519. The artifact proves the KEY signed this intent; " +
        "it does not prove which software held the key, that the demo was submitted, or that any external project adopted the gate.",
    };
    const target = attestationPath;
    if (target) {
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
    }
    return { ok: true, state: "ATTESTED", path: target, artifact };
  }

  return { prepare, demoSign, tamper, complete, attest, keys: { signer: signer.publicKey(), recipient: recipient.publicKey() } };
}

export function createDemoServer(options = {}) {
  const session = options.session ?? createDemoSession({
    attestationPath: options.attestationPath === undefined ? ATTESTATION : options.attestationPath,
  });
  const page = () => readFileSync(PAGE);

  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
        res.end(page());
        return;
      }
      if (req.method === "POST") {
        const body = await readBody(req);
        if (url.pathname === "/api/prepare") return json(res, 200, { ok: true, ...session.prepare(body), ceiling: CEILING });
        if (url.pathname === "/api/demo-sign") return json(res, 200, { ok: true, ...session.demoSign(), ceiling: CEILING });
        if (url.pathname === "/api/tamper") return json(res, 200, { ok: true, ...session.tamper(), ceiling: CEILING });
        if (url.pathname === "/api/complete") {
          const result = session.complete(body);
          return json(res, result.ok ? 200 : 422, result);
        }
        if (url.pathname === "/api/attest") {
          const result = session.attest(body);
          return json(res, result.ok ? 200 : 422, result);
        }
      }
      json(res, 404, { ok: false, error: `no route for ${req.method} ${url.pathname}` });
    } catch (e) {
      json(res, 400, { ok: false, error: e && e.message ? e.message : String(e) });
    }
  });

  server.session = session;
  return server;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const server = createDemoServer();
  const port = Number(process.env.PORT ?? 8788);
  server.listen(port, "127.0.0.1", () => {
    console.log(`AGENT-GATE browser demo: http://127.0.0.1:${port}`);
    console.log("  the envelope is never submitted; the ceiling is printed on the page");
    console.log("  a Freighter extension is used when present, and its absence is stated when it is not");
  });
}
