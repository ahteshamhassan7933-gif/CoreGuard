# AGENT-GATE/1 — Stellar agent payment gate (offline prototype)

**Honest status: `OFFLINE_PROTOTYPE` · `chainSubmission: NOT_PERFORMED` · `integrationStatus: NOT_BUILT`.**
No wallet signing integration, no Horizon/Soroban call, no funds movement, no external adoption.

## What this surface is

A gate that a financial AI agent must pass before anything is signed, plus a
signed evidence receipt that a third party verifies without trusting CoreGuard.

| Step | Function | Refusal mode |
|---|---|---|
| Mandate is readable | `validatePolicy()` | unreadable mandate ⇒ `HOLD`, never "no limits" |
| Intent is decidable | `evaluate()` | unknown field / bad schema ⇒ `DENY`; undecidable fact ⇒ `HOLD` |
| Intent is bound | `intentDigest()` | domain-separated canonical hash |
| Envelope conforms | `checkConformance()` | extra op, other recipient, other amount ⇒ `MISMATCH` |
| Decision is evidenced | `issueReceipt()` | Ed25519, hash-chained, carries raw intent + mandate + envelope |
| Evidence is checkable | `verifyReceipt()` / `verifyChain()` | re-derives decision and conformance from bytes |

The property the surface exists to demonstrate: **the gate does not stop at
checking the proposal — it refuses an envelope that diverges from the intent it
authorized**, including a batch that buries a second payment.

## What it does not do

- **No signer.** Keys stay with the wallet; this module never accepts one.
  The `adapters/freighter.mjs` interface has carried a real testnet signature
  (see below), but a real Freighter **extension** has never signed here: it was
  probed in the available browser and is not installed (`window.freighter` is
  undefined). Extension support is `NOT_BUILT`.
- **No submission.** There is no network call anywhere in the package. A
  separate runner, `scripts/agent-gate-testnet-sign.mjs`, builds → signs →
  submits → re-decodes and writes the artifact; the package itself stays offline.
- **No chain claim.** `VERIFIED` from `verifyReceipt()` means "these bytes
  recompute consistently". It is not a ledger read and not an audit.

## The signed envelope is the unit

`adapters/stellar-xdr.mjs` builds unsigned envelopes and decodes signed ones;
`adapters/freighter.mjs` asks the wallet to sign and refuses a wallet that
returns different bytes; `verify-cli.mjs` recomputes everything later.

| Refusal | Where |
|---|---|
| wallet returns another transaction | `REFUSED` (transaction hash compared) |
| wallet returns nothing / unsigned | `REFUSED` |
| envelope adds a second payment | `MISMATCH` / `MULTI_OP_DIVERGENCE` |
| fee-bump envelope | refused by name |
| on-disk envelope is not the receipt's | `TAMPERED` / `ENVELOPE_NOT_THE_ONE_IN_THE_RECEIPT` |

An envelope carries no network: the passphrase enters the transaction hash, so
testnet bytes cannot be replayed as mainnet — and the caller must be right about
the network it asks for.

## What actually reached a ledger

On 2026-11-10 an envelope built here was signed through the Freighter interface
and included on Stellar **testnet**: tx
`7f863dd2512a82d1d10d6d221d311260698fc018c233113d5e5971fb9741b757` at ledger
5,665,413, with the gate's `ALLOW`, conformance `VERIFIED`, and an Ed25519
receipt that re-verifies from its bytes. The signer was a **local keypair behind
the Freighter interface**, not the extension.

`node scripts/agent-gate-testnet-sign.mjs --verify` re-derives that artifact
offline (envelope hash, operations, conformance, receipt signature). Read it as:
the signing path is real and chain-accepted; the wallet is still missing.

When a real extension *does* sign, the demo's fifth button records it. The server
refuses a local keypair, a non-conforming envelope and a missing signature, and
only a valid Ed25519 signature by the declared wallet key writes
`docs/evidence/agent-gate-freighter-extension-signature.json`. Then
`node scripts/agent-gate-freighter-attest.mjs --verify` re-derives the artifact
and `--promote` moves the registry to `code: BUILT`. Until that file exists the
verifier exits `3` and says the surface stays `BUILT_UNVERIFIED`.

## Run it

```bash
node packages/agent-gate/demo.mjs
```

Fourteen fixed cases (allow · per-tx cap · recipient · memo · expiry · window ·
unknown field · honest envelope · drifted envelope · batched envelope · receipt
tamper · chain break). Exit 1 if the verdict matrix drifts, so the demo doubles
as a self-check.

The browser loop lives in `examples/agent-gate-browser/`:
`node examples/agent-gate-browser/serve.mjs`, then open the printed URL. The page
prepares an authorized envelope, signs it through `window.freighterApi` when the
extension is present and with a labelled local keypair when it is not, then
shows conformance `VERIFIED` and a one-stroop tamper refused by name. Nothing is
submitted, and the page prints that ceiling next to the result.

```bash
node packages/agent-gate/demo/cli-flow.mjs
```

The full offline loop: gate → build → wallet signs → decode → conformance →
receipt → verify, including the drift, batch and wallet-swap refusals. The wallet
is a local keypair in a Freighter-shaped object; the output states that a real
extension is not exercised.

## Verify a receipt yourself

```js
import { verifyReceipt } from "./packages/agent-gate/index.mjs";

const result = verifyReceipt({ receipt, publicKeyPem });
// VERIFIED · MISMATCH · TAMPERED · UNKNOWN — never a boolean
```

Verification needs only the receipt JSON and the operator's public key. No
CoreGuard server, database or API is consulted.

## Status provenance

The gate inherits the repo-wide two-axis status model in
[`docs/STELLAR-STATUS-UNIFICATION.md`](../../docs/STELLAR-STATUS-UNIFICATION.md):
*execution* (what has been run and evidenced) is separate from *integration*
(what an external project can adopt). This package is executed-by-test and
NOT integration-ready, and both facts are stated rather than averaged.

## Standards

`AGENT-GATE/1` (decision envelope) · `AGENT-RECEIPT/1` (evidence receipt) ·
`AGENT-POLICY/1` (agent mandate).
