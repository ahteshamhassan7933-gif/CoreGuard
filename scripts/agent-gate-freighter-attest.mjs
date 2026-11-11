#!/usr/bin/env node
/**
 * scripts/agent-gate-freighter-attest.mjs — the ONLY path that may promote
 * `agent-gate-freighter` from `BUILT_UNVERIFIED` to `BUILT`.
 *
 * The demo page writes the artifact at
 *   docs/evidence/agent-gate-freighter-extension-signature.json
 * after the server has verified that the declared wallet key really signed the
 * authorized envelope. This script re-derives that claim from the committed
 * bytes; nothing here trusts the page, the artifact, or the promotion.
 *
 *   node scripts/agent-gate-freighter-attest.mjs --verify
 *   node scripts/agent-gate-freighter-attest.mjs --promote     (verify first, then edit the registry)
 *
 * Exit codes: 0 ATTESTED · 1 the artifact does not re-derive · 3 NOT_PERFORMED
 * (no artifact — no extension has signed, so there is nothing to promote).
 *
 * What a passing artifact proves: the key signed this intent. What it cannot
 * prove, and the artifact says so itself: which software held the key, that the
 * envelope was submitted, or that any external project adopted the gate.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as Stellar from "@stellar/stellar-sdk";

import { checkConformance } from "../packages/agent-gate/index.mjs";
import { decodeEnvelope, NETWORK_PASSPHRASE } from "../packages/agent-gate/adapters/stellar-xdr.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_ARTIFACT = join(REPO, "docs", "evidence", "agent-gate-freighter-extension-signature.json");
const REGISTRY = join(REPO, "docs", "surface-status.json");

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const MODE = args.find((a) => a === "--verify" || a === "--promote") ?? "";
const ARTIFACT_PATH = flag("--artifact", DEFAULT_ARTIFACT);
const REGISTRY_PATH = flag("--registry", REGISTRY);

const sha256 = (text) => createHash("sha256").update(text, "utf8").digest("hex");

function verify(artifact) {
  const problems = [];
  if (artifact?.schema !== "CoreGuard-Evidence/1") problems.push("schema must be CoreGuard-Evidence/1");
  if (artifact?.artifact !== "agent-gate-freighter-extension-signature") {
    problems.push("artifact id does not match the extension-signature record");
  }
  if (artifact?.wallet?.declared !== "freighter-extension") {
    problems.push("wallet.declared must be freighter-extension — a local keypair cannot be promoted");
  }
  const wallet = artifact?.wallet?.publicKey ?? "";
  if (!/^G[A-Z2-7]{55}$/.test(wallet)) problems.push("wallet.publicKey is not a Stellar public key");

  const xdr = artifact?.envelope?.signedXdr;
  if (typeof xdr !== "string" || !xdr.trim()) problems.push("envelope.signedXdr is missing");
  else if (sha256(xdr) !== artifact?.envelope?.signedXdrSha256) problems.push("signed XDR does not hash to the recorded digest");

  if (typeof xdr === "string" && xdr.trim()) {
    const decoded = decodeEnvelope({ xdr, network: artifact?.network ?? "testnet" });
    if (!decoded.ok) problems.push(`envelope does not decode: ${decoded.error}`);
    else {
      if (decoded.execution.txHash !== artifact?.envelope?.txHash) problems.push("decoded hash differs from the recorded hash");
      const conformance = checkConformance({ intent: artifact?.intent, execution: decoded.execution });
      if (conformance.verdict !== "VERIFIED") {
        problems.push(`decoded envelope does not conform: ${JSON.stringify(conformance.mismatches)}`);
      }
      if (artifact?.conformance?.verdict !== "VERIFIED") problems.push("artifact does not record VERIFIED conformance");

      try {
        const tx = Stellar.TransactionBuilder.fromXDR(xdr, NETWORK_PASSPHRASE[artifact?.network ?? "testnet"]);
        const keypair = Stellar.Keypair.fromPublicKey(wallet);
        const hint = Buffer.from(keypair.signatureHint());
        // SDK v17 exposes the XDR opaques as { value: Buffer } — not as methods.
        const carried = tx.signatures.find((s) => Buffer.from(s.hint.value).equals(hint));
        const ok = Boolean(carried) && keypair.verify(tx.hash(), Buffer.from(carried.signature.value));
        if (!ok) problems.push("the envelope carries no valid signature by wallet.publicKey");
      } catch (e) {
        problems.push(`signature check failed: ${e && e.message ? e.message : e}`);
      }
    }
  }
  return problems;
}

function main() {
  if (MODE !== "--verify" && MODE !== "--promote") {
    console.log("usage: node scripts/agent-gate-freighter-attest.mjs --verify | --promote");
    process.exitCode = 2;
    return;
  }

  if (!existsSync(ARTIFACT_PATH)) {
    console.log("FREIGHTER-ATTEST: NOT_PERFORMED");
    console.log("  no artifact at docs/evidence/agent-gate-freighter-extension-signature.json");
    console.log("  no extension has signed here, so agent-gate-freighter stays BUILT_UNVERIFIED");
    process.exitCode = 3;
    return;
  }

  const artifact = JSON.parse(readFileSync(ARTIFACT_PATH, "utf8"));
  const problems = verify(artifact);
  if (problems.length > 0) {
    console.error("FREIGHTER-ATTEST: FAIL");
    for (const p of problems) console.error(`  - ${p}`);
    process.exitCode = 1;
    return;
  }

  console.log("FREIGHTER-ATTEST: PASS");
  console.log(`  wallet ${artifact.wallet.publicKey}`);
  console.log(`  envelope ${artifact.envelope.txHash}`);
  console.log("  re-derived: signed XDR digest, decode, conformance, Ed25519 signature by the declared key");
  console.log("  ceiling: this proves the KEY signed the authorized intent — not which software held it");

  if (MODE === "--verify") {
    console.log("  next: node scripts/agent-gate-freighter-attest.mjs --promote");
    return;
  }

  const registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
  const surface = registry.surfaces.find((s) => s.id === "agent-gate-freighter");
  if (!surface) {
    console.error("FREIGHTER-ATTEST: registry has no agent-gate-freighter surface");
    process.exitCode = 1;
    return;
  }
  surface.code = "BUILT";
  surface.evidence = [...new Set([...(surface.evidence ?? []), flag("--artifact", "docs/evidence/agent-gate-freighter-extension-signature.json")])];
  surface.note =
    "A real Freighter extension signed an authorized envelope; the artifact re-derives offline (Ed25519 signature by the declared key, " +
    "conformance VERIFIED). What it does not prove is which software held the key, that the envelope was submitted, or that any external project adopted this.";
  writeFileSync(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  console.log(`  promoted agent-gate-freighter: code BUILT (registry ${REGISTRY_PATH})`);
  console.log("  still to do by hand: the EVIDENCE-MATRIX row and status() in the adapter");
}

main();
