# SCF Build — application v2 (supersedes the $50k draft)

**Project:** CoreGuard — verifiable execution control for AI-driven payments on Stellar
**Track:** Integration Track
**Ask:** up to $150,000 in XLM-equivalent, released across four tranches against
deliverables a reviewer can run
**Round status:** SCF #46 closed on 2026-11-09. **No current round is assumed**;
this document is preparation for the next invitation and must be confirmed with
the SCF team before submission. Nothing here should be read as an application
already accepted by a live round.

> Replaces `docs/SCF-BUILD-APPLICATION.md` ($50k, four-month, milestone-lite).
> The difference is not the amount: it is that every tranche now releases only
> on an artifact a reviewer can execute, and the pre-award state is stated on
> three axes instead of one.

---

## 1. What exists today (pre-award, on three axes)

Per `docs/surface-status.json` and `docs/EVIDENCE-MATRIX.md`:

| Piece | Code | Execution | Integration |
|---|---|---|---|
| Soroban commitment anchor, Stellar mainnet `CCKA2GYVILX7YZVSXGVIHOPNLTRBBF2SSWKBTQBIE7M67N5N2QMMXPSP` | BUILT | EXECUTED — first `commit(proofId, commitment)` INVOKED, ledger 65,337,373 | NOT_BUILT |
| Signed funded DEX swap through DEX-GATE/1 preflight | BUILT | EXECUTED — `pathPaymentStrictSend` CONFIRMED, ledger 65,338,112 | NOT_BUILT |
| Agent payment gate (**AGENT-GATE/1**) with receipt + independent verifier | BUILT | TEST_EXECUTED — 14-case walkthrough, drift and batched-op refusals | NOT_BUILT |
| DEX gating against the live order book | BUILT | REAL_BOOK_EXECUTED | NOT_BUILT |
| Freighter signing path | BUILT_UNVERIFIED | NONE | NOT_BUILT |
| External adopter | — | — | **0** |

Suite total: **1511 / 1511 pass**, pinned in
`docs/state-snapshot.json`. Boundary audit: 0 violations. Claim registry: no
`VERIFIED` claim without a committed artifact.

**The honest sentence for a reviewer:** the execution record on Stellar is real
and re-derivable offline; the integration record is empty, and this application
is the plan to fill it — not a claim that it is filled.

## 2. The problem, scoped to Stellar

AI agents are beginning to hold payment authority. Stellar already has the
primitives for authorization (`require_auth`, `require_auth_for_args`) and for
atomic settlement, but nothing that answers: **did the envelope that got signed
do what the principal authorized, and can a third party prove it later?**

Soroban authorization answers "did the right signer sign". It does not answer
"did the transaction do what was authorized", and it cannot see an extra payment
batched into the same envelope.

Who needs that answer: wallets exposing agent permissions, Soroban DeFi apps
with automated execution, payment platforms with compliance obligations, and
enterprises granting spend authority to agents.

## 3. The product

**AGENT-GATE/1**, specified in `docs/AGENT-PAYMENT-GATE.md`:

1. mandate (signed policy: per-tx cap, window cap, recipients, assets, expiry)
2. gate decision `ALLOW` / `DENY` / `HOLD` with named reason codes, fail-closed
3. intent digest bound to the authorized action
4. envelope conformance — refusal on drift, including a hidden second operation
5. Ed25519 evidence receipt, hash-chained
6. independent offline verification; no trust in a CoreGuard server
7. optional on-chain anchor of the receipt root in the existing Soroban contract

## 4. Deliverables by tranche

Each row states the artifact a reviewer receives. "Done" means the reviewer can
run it, not that we say it works.

### Tranche 0 — 10% ($15,000): the gate, adoptable as a library

| Deliverable | Artifact the reviewer runs |
|---|---|
| Published `@coreguard/agent-gate` package with typed API | `npm pack` + a 20-line integration example that runs offline |
| Mandate schema v1 frozen and versioned | JSON Schema + conformance fixtures |
| Envelope conformance extended to path payments and Soroban invocations | test matrix covering single, batched, drifted and malformed envelopes |
| Reference integration doc for a wallet | `INTEGRATION.md` with the three calls a wallet makes |

**Exit gate:** an outside developer follows the doc and gets ALLOW + MISMATCH on
their machine without contacting us.

### Tranche 1 — 20% ($30,000): the signer path (Freighter)

| Deliverable | Artifact the reviewer runs |
|---|---|
| Freighter signing path in a browser demo | public demo URL; ALLOW and MISMATCH in one session, keys never leaving the wallet |
| Signed receipt produced from a real wallet signature | receipt JSON + public key + verifier command |
| Testnet end-to-end: agent proposal → gate → wallet sign → submit → receipt anchored | testnet tx hash and an anchored receipt root |
| Failure drills: rejected signature, wrong network, expired mandate | recorded drill outputs, each fail-closed |

**Exit gate:** a reviewer connects their own Freighter on testnet and completes
the loop; no CoreGuard key exists anywhere in the flow.

### Tranche 2 — 30% ($45,000): independence and audit

| Deliverable | Artifact the reviewer runs |
|---|---|
| Independent verifier packaged for third-party use (CLI + library) | `npx coreguard-verify receipt.json --key op.pub` |
| External security review of the gate, receipt format and Soroban contract | reviewer's signed findings, published in full |
| Every finding fixed or explicitly left open with a written rationale | finding-by-finding resolution table |
| Adversarial suite published: tamper, replay, forged decision, chain break, batched divergence | reproducible harness + expected outputs |

**Exit gate:** the audit report exists and is public, including the bad parts.

### Tranche 3 — 40% ($60,000): one real external pilot + measured performance

| Deliverable | Artifact the reviewer runs |
|---|---|
| One named Stellar project integrates the gate in its own flow | committed pilot record: repo, integration point, dates, what broke |
| Measured gate performance | p50/p95 latency, cost per verification, machine spec, harness |
| Published integration case study, honest about failures | document naming what the pilot could not do |
| Maintenance plan for the pilot partner | support terms, upgrade path, deprecation policy |

**Exit gate:** the pilot partner confirms the integration in writing, and the
numbers are reproducible from the published harness.

## 5. Budget ($150,000)

| Category | Amount | Why this number |
|---|---|---|
| Engineering — gate, signer path, SDK | $58,000 | ~7 engineer-months at a documented rate; see the rate card in the application form |
| Independent security review | $22,000 | one qualified reviewer, gate + receipts + contract, findings published |
| Pilot integration support | $18,000 | integration engineering with the partner, not marketing |
| Adversarial testing and performance measurement | $14,000 | harnesses, load runs, published measurements |
| Developer documentation and examples | $10,000 | integration guide, reference demo, three runnable examples |
| Infrastructure (RPC, CI, hosting for the demo) | $8,000 | testnet/mainnet RPC, CI minutes, demo hosting |
| Contingency (10%) | $20,000 | released only with written justification in the tranche report |
| **Total** | **$150,000** | |

No line item is for marketing, token activity, or "community growth".

## 6. Why Stellar, and why now

- Soroban gives atomic settlement and explicit authorization, so a gate can sit
  between the agent and the wallet without inventing new trust assumptions.
- Stellar's fee and finality profile makes per-transaction verification
  economically plausible; the gate's cost target is stated per verification.
- The agent-payments category is arriving now, and the missing layer is
  execution conformance, not another wallet or another DEX.
- The anchor contract is already deployed on Stellar mainnet and has executed a
  real commitment, so the on-chain half is not speculative.

## 7. Risks, stated before a reviewer states them

| Risk | Mitigation |
|---|---|
| Pilot partner not found in 90 days | the search starts in Tranche 0, not Tranche 3; an unsuccessful search is published as a finding |
| Freighter API changes | pin versions, isolate the adapter, keep the gate wallet-agnostic |
| Audit findings are severe | that is the point of the tranche; fixes are budgeted, and unresolved findings stay public |
| Gate adds latency a wallet will not accept | measured in Tranche 1, published before Tranche 3 |
| Scope creep back to the wide portfolio | `docs/PRODUCT-FOCUS.md` parks everything else; the budget funds only the gate |

## 8. Team

Founder/engineer (EslaM-X) — the repository's execution evidence, the Soroban
mainnet deploy and the gate prototype are his work. Post-award: one Soroban
engineer (Tranche 0–1), one independent reviewer (Tranche 2), one integration
engineer shared with the pilot (Tranche 3). No advisor or team member is claimed
that does not exist today.

## 9. Links

- Repository: https://github.com/coreguard-global/CoreGuard
- Flagship spec: `docs/AGENT-PAYMENT-GATE.md`
- Status registry: `docs/surface-status.json` · `docs/EVIDENCE-MATRIX.md`
- Review record: `docs/EXECUTIVE-REVIEW-2026-11-10.md`
- Roadmap: `docs/ROADMAP-90-DAYS-2026-11.md`
