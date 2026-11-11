# CoreGuard Evidence Matrix — three axes, never one word

> **Why this file changed (2026-11-10).** It used to collapse executed Stellar
> work into one combined verdict label, while `packages/stellar/README.md` said `DRY_RUN / NOT_BUILT`
> and `status()` returned `integrationStatus: NOT_BUILT`. Both were true about
> different questions, and the single label let a reader average them into "the
> integration works". The three axes below cannot be averaged, and
> `test/ci/surface-status.test.js` fails the build if a combined label returns.
> Full record: [`STELLAR-STATUS-UNIFICATION.md`](STELLAR-STATUS-UNIFICATION.md).
> Machine-readable registry: [`surface-status.json`](surface-status.json).

## The three axes

| Axis | The question it answers | Allowed values |
|---|---|---|
| **Code** | Does the surface exist in the committed tree? | `BUILT` · `BUILT_UNVERIFIED` · `PLAN_ONLY` · `NOT_BUILT` |
| **Execution** | Has anything been run, with an artifact proving it? | `EXECUTED` · `REAL_BOOK_EXECUTED` · `POLICY_GATE_EXECUTED` · `TEST_EXECUTED` · `NONE` |
| **Integration** | Can an outside project adopt it today? | `ADOPTED` · `PILOT` · `NOT_BUILT` |

**Rules the machine enforces.** `ADOPTED` and `PILOT` require a named external
party plus committed evidence. `EXECUTED` never implies `ADOPTED`. `NONE` on the
execution axis is a fact, not a failure. Today every surface is
`integration=NOT_BUILT`: **no external project runs CoreGuard, and no customer
has adopted it.**

## Stellar

| Surface | Code | Execution | Integration | Evidence |
|---|---|---|---|---|
| `stellar-adapter` — read / build / submit gate | BUILT | NONE (no live call by design) | NOT_BUILT — no external consumer | `packages/stellar/index.mjs`; `status()` returns `DRY_RUN` / `NOT_BUILT` |
| `stellar-soroban-anchor` — commitment anchor contract | BUILT (soroban-sdk 23) | EXECUTED — deploy + first `commit(proofId, commitment)` INVOKED, owner-authorized; contract `CCKA2GYVILX7YZVSXGVIHOPNLTRBBF2SSWKBTQBIE7M67N5N2QMMXPSP`; tx `69044807410f65027c1227f4e525ad83f23a6cb1a2bb79790d82849c5dbc9fec`, ledger 65,337,373 | NOT_BUILT — the caller is CoreGuard's own script | `docs/evidence/stellar-soroban-commit-executed.json`; `node scripts/stellar-soroban-commit-executed.mjs --verify` |
| `stellar-dex-gate` — DEX-GATE/1 preflight | BUILT | REAL_BOOK_EXECUTED — five verdicts against the live XLM/USDC book; returns `PLAN_ONLY`, never sends | NOT_BUILT — no wallet or DApp embeds it | `docs/evidence/stellar-dex-gate-executed.json`; `node scripts/stellar-dex-gate-real.mjs --verify` |
| `stellar-agent-gate` — STELLAR-AGENT/1 policy matrix | BUILT | POLICY_GATE_EXECUTED — VERIFIED / REJECTED / HELD executed offline; `submit: NOT_PERFORMED` | NOT_BUILT — no agent deployment uses it | `docs/evidence/stellar-agent-gate-executed.json`; `node scripts/stellar-agent-gate-executed.mjs --verify` |
| `agent-gate` — AGENT-GATE/1 gate, receipts, independent verifier | BUILT | TEST_EXECUTED — 14-case walkthrough; receipt tamper and chain-break refusals | NOT_BUILT — prototype, no signer, no submission | `packages/agent-gate/index.mjs`; `test/integrations/agent-payment-gate.test.mjs` |
| `agent-gate-xdr` — builds unsigned, decodes signed envelopes | BUILT | EXECUTED — an envelope built here was signed and included on Stellar **testnet**, tx `7f863dd2512a82d1d10d6d221d311260698fc018c233113d5e5971fb9741b757` at ledger 5,665,413, then re-decoded offline; secret key, fee-bump and junk refused | NOT_BUILT — no external embedder | `docs/evidence/agent-gate-testnet-signature.json`; `node scripts/agent-gate-testnet-sign.mjs --verify` |
| `agent-gate-freighter` — wallet signing adapter | BUILT_UNVERIFIED — a real Freighter extension has still never signed here; it was probed in the available browser and is not installed (`window.freighter` undefined) | TEST_EXECUTED — signed / empty / unsigned / swapped-bytes cases against an injected wallet, plus a chain-accepted signature carried through this adapter by a local keypair behind its interface | NOT_BUILT | `packages/agent-gate/adapters/freighter.mjs`; `docs/evidence/agent-gate-testnet-signature.json`; promotion after a real extension signs: `node scripts/agent-gate-freighter-attest.mjs --verify` |
| `agent-gate-verify-cli` — third-party verifier | BUILT | TEST_EXECUTED — exit 0/2/3/4 proven, including a receipt paired with a foreign envelope | NOT_BUILT — zero external users | `packages/agent-gate/verify-cli.mjs` |
| `agent-gate-bench` — in-process timing | BUILT | TEST_EXECUTED — 2000 samples, p50/p95 recorded; offline ceiling stated | NOT_BUILT | `docs/evidence/agent-gate-bench.json` |
| `agent-gate-browser-demo` — runnable page: gate → wallet → conformance → receipt | BUILT | TEST_EXECUTED — prepare / sign / verify driven over HTTP in the contract, a one-stroop tamper refused by name, junk REFUSED | NOT_BUILT — nothing is submitted, and the page states that a missing extension means a local keypair signed | `test/integrations/agent-gate-browser-demo.test.mjs`; `node examples/agent-gate-browser/serve.mjs` |
| `stellar-freighter` — Freighter wallet wrapper | BUILT_UNVERIFIED — no end-to-end test | NONE — credential-gated, never exercised | NOT_BUILT | `packages/stellar/freighter.mjs` |
| `stellar-mainnet-executor` — payment / invoke / anchor plans | PLAN_ONLY — returns `PLAN_OK` plus sample code | NONE | NOT_BUILT | `packages/stellar/mainnet-executor.mjs` |
| Signed funded DEX swap (owner wallet, 2026-11-06) | BUILT (runner script) | EXECUTED — `pathPaymentStrictSend` CONFIRMED, tx `ac2a7990b3387aab96b197c0c921d57756bd25d65ad0e75b93561ded640b9097`, ledger 65,338,112; 4.0598146 XLM to 0.6306239 USDC, wire read-back equals `fee_charged` to the stroop | NOT_BUILT — a one-off owner execution, not a product path | `docs/evidence/stellar-dex-swap-executed.json`; `node scripts/stellar-dex-swap-executed.mjs --verify` |
| Mainnet wallet and first payment | BUILT | EXECUTED — 0.1 XLM to SDF, ledger 65,308,317 | NOT_BUILT | `.stellar-tx-1.json` |

**One sentence for the Stellar block:** the *execution* record is real and
re-derivable; the *integration* record is empty. A judge can verify the former
today and cannot adopt the latter today.

## Core DAO (chainId 1116)

| Surface | Code | Execution | Integration | Evidence |
|---|---|---|---|---|
| Anchor contract V1 | BUILT | EXECUTED — `0x037dF08F2d43c5D03759279Fe35664f6AFf9EA6E`, proof tx `0xe67c61fd...a9b8`, block 38712625 | NOT_BUILT — no external consumer | `scripts/verify-live.json` |
| EvidenceRegistryV2 | BUILT | EXECUTED — `0x66268a47e81b8f657798d7b5bbedc956df7b13fd`; commitIntent `0x0cd2a8c0...715c`; anchorProof `0x5b9e7d68...78d2` | NOT_BUILT | `scripts/verify-live.json` |
| EvidenceRegistryV3 (fee) | BUILT — `forge test` green | NONE — not deployed (owner-only decision) | NOT_BUILT | `contracts/EvidenceRegistryV3.sol` |
| Cross-RPC independent read-back | BUILT | EXECUTED — coredao + ankr, 66/66 legs | NOT_BUILT | `evidence/gate-4.1-independent-verify.json` |
| Gate 4.1 identity anchor | BUILT | EXECUTED — commitIntent `0x68d9fb...c567`, block 38827925, status `0x1`; governance signature still pending | NOT_BUILT | `evidence/gate-4.1-live-reconfirmation-2026-09-19.json` |

## Engine and verification surfaces

| Surface | Code | Execution | Integration | Evidence |
|---|---|---|---|---|
| `independent-verifier` — offline receipt verifier | BUILT | TEST_EXECUTED | NOT_BUILT — zero third-party runs | `packages/independent-verifier`; `test/independent-verifier/` |
| C verifier (frozen reference) | BUILT | TEST_EXECUTED | NOT_BUILT | `test/verifier-c/` |
| Universal DApp Shield (ARM model) | BUILT | POLICY_GATE_EXECUTED — 2 ALLOW, 2 REQUIRE_REVIEW, 1 DENY, 1 REFUSED | NOT_BUILT | `docs/evidence/universal-dapp-shield-executed.json` |
| Claim registry CG-CL/1 | BUILT | TEST_EXECUTED — 28 claims, 16 VERIFIED, 0 violations | NOT_BUILT | `docs/claims-registry.json`; `npm run claims:audit` |
| Release gate CG-RG/1 | BUILT | TEST_EXECUTED — 18/18 legs, self-audit in CI | NOT_BUILT | `docs/release-gate.json`; `npm run release:gate` |
| Conformance report CG-CR/1 | BUILT | TEST_EXECUTED — `badgeIssuerCount 0`, revenue 0 | NOT_BUILT | `docs/conformance-report.json` |

## Pi Network

| Surface | Code | Execution | Integration | Evidence |
|---|---|---|---|---|
| Pi payment flow (approve then complete) | BUILT | TEST_EXECUTED — fail-closed `503 payments_not_configured` without the server-side key | NOT_BUILT — no live payment, no developer-portal approval | `WEB-coreguard/src/routes/api/pi-approve.ts` |
| Pi Sign-In (implicit flow) | BUILT | TEST_EXECUTED — `/api/pi-me` rejects an invalid bearer with 401 | NOT_BUILT — domain verification pending | `WEB-coreguard/src/routes/api/pi-me.ts` |
| Pi packages | BUILT_UNVERIFIED | NONE | NOT_BUILT | `packages/pi-network`, `packages/pi-killer` |

## Totals

Suite total: **1511 / 1511 pass**, machine-pinned in
`docs/state-snapshot.json` (the only authoritative count in the repo).
Boundary audit: **0 violations**; file count lives in the same snapshot.

| Integration status | Count |
|---|---|
| ADOPTED | **0** |
| PILOT | **0** |
| NOT_BUILT | **all surfaces** |

| Execution status | Count |
|---|---|
| EXECUTED (on-chain artifacts) | 6 |
| REAL_BOOK_EXECUTED / POLICY_GATE_EXECUTED | 3 |
| TEST_EXECUTED | 9 |
| NONE / not exercised | 5 |

**The sentence this matrix exists to make impossible:** "CoreGuard is a verified
Stellar integration." The supported sentences are: "CoreGuard has verifiable
execution evidence on Stellar mainnet" (true, checkable) and "CoreGuard has no
external Stellar adopter yet" (true, and it is the gap the roadmap closes).
