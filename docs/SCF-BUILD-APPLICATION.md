# Stellar Community Fund — Build Award Application

> **SUPERSEDED 2026-11-10** by [`SCF-BUILD-APPLICATION-V2.md`](SCF-BUILD-APPLICATION-V2.md).
> Kept as the record of the earlier $50k draft. Do not submit this version: it
> uses the retired one-word status labels and budgets four months of broad
> work instead of the flagship's tranche gates.

## Track: Integration Track

## Project: CoreGuard Global — Verifiable Execution Truth Layer for Stellar

---

### 1. Project Overview

CoreGuard is a verifiable execution truth layer. It produces independently verifiable evidence of whether execution conformed to what was authorized — not just whether it looked safe.

**What we're building on Stellar:**
- Intent-to-execution conformance verification
- Soroban commitment anchor (MAINNET deployed — `CCKA2GYVILX7YZVSXGVIHOPNLTRBBF2SSWKBTQBIE7M67N5N2QMMXPSP` — and the first anchor CALL EXECUTED/INVOKED, owner-authorized, 2026-11-06)
- Freighter wallet integration
- Soroban DEX gating (swap/path payment/liquidity verification)
- AI agent payment gates
- Cross-border payment verification

**Current status (honest):**
- Soroban commitment anchor: MAINNET deployed (`CCKA2GYVILX7YZVSXGVIHOPNLTRBBF2SSWKBTQBIE7M67N5N2QMMXPSP`) + first anchor CALL EXECUTED — owner-authorized `commit(proofId, commitment)` INVOKED (tx `69044807410f65027c1227f4e525ad83f23a6cb1a2bb79790d82849c5dbc9fec`, ledger 65,337,373; on-chain read-back `{hash, seq}` exact; artifact `docs/evidence/stellar-soroban-commit-executed.json`)
- Mainnet: 1 test transaction executed (0.1 XLM → SDF)
- DEX gating: Built and tested (9 tests passing)
- AI agent payments: Built (plan only, not executed)
- Freighter: Wrapper built, not tested end-to-end

---

### 2. Ecosystem Value

**Problem**: Stellar has 8M+ accounts and processes billions in cross-border payments, but there is NO tool that verifies whether execution conformed to authorization. Payment failures are hard to diagnose. Compliance teams trust, not verify.

**Solution**: CoreGuard on Stellar provides:
1. **Pre-execution verification** — verify before you submit
2. **Execution conformance** — compare authorized intent vs actual execution
3. **Deterministic replay** — independently replay after submission
4. **Fail-closed** — UNKNOWN → HELD (never silently pass)
5. **AI agent gates** — verify AI agent payments before execution
6. **DEX gating** — verify swaps, path payments, liquidity provision

**Unique value**: No other project on Stellar provides verifiable execution-conformance evidence. We are the only tool that produces independently replayable proof of conformance.

---

### 3. Technical Feasibility

**Already built and tested:**
- ✅ 1511 tests passing (machine-pinned)
- ✅ 1052 files, 0 boundary violations
- ✅ 10,000-run benchmark: 0 false accept, 0 false reject
- ✅ Soroban commitment anchor deployed on Stellar MAINNET (`CCKA2GYVILX7YZVSXGVIHOPNLTRBBF2SSWKBTQBIE7M67N5N2QMMXPSP`)
- ✅ First mainnet commitment-anchor CALL executed — owner-authorized `commit(proofId, commitment)` **INVOKED** (tx `69044807410f65027c1227f4e525ad83f23a6cb1a2bb79790d82849c5dbc9fec`, ledger 65,337,373; on-chain read-back `{hash, seq}` exact)
- ✅ First SIGNED funded mainnet swap executed — DEX-GATE/1 preflight VERIFIED, `pathPaymentStrictSend` owner-signed and CONFIRMED (swap tx `ac2a7990b3387aab96b197c0c921d57756bd25d65ad0e75b93561ded640b9097`, ledger 65,338,112; trustline tx `09243337fd04d7ead8e369a8a5d5ef48648179db84608b262d5379f34fa72d76`, ledger 65,338,111; `4.0598146 XLM → 0.6306239 USDC`, wire read-back to the stroop)
- ✅ 11/11 Soroban integration tests passing
- ✅ 9 DEX gating tests passing
- ✅ Freighter wallet wrapper
- ✅ Mainnet wallet created and funded
- ✅ First mainnet transaction executed (0.1 XLM → SDF)
- ✅ Independent verification proof (docs/INTENT-TO-EXECUTION-PROOF.md)

**Tech stack:**
- Stellar SDK (@stellar/stellar-sdk)
- Soroban (Rust contract: cg-commitment-anchor, soroban-sdk 23)
- Freighter wallet integration
- Node.js 22+
- Rust (soroban-sdk 23)

---

### 4. Roadmap & Milestones

| Month | Milestone | Deliverable | Tranche |
|---|---|---|---|
| 1 | Soroban testnet verification | DEX gating + conformance tests | Tranche 0 (10%) |
| 2 | Freighter integration | Wallet verification live | Tranche 1 (20%) |
| 3 | AI agent gates | Agent payment verification on Stellar | Tranche 2 (30%) |
| 4 | Mainnet deployment & anchor call | ~~Soroban contract on mainnet~~ **DELIVERED BEFORE AWARD:** contract deployed (2026-11-04) + first owner-authorized commitment-anchor CALL executed/INVOKED (tx `69044807410f65027c1227f4e525ad83f23a6cb1a2bb79790d82849c5dbc9fec`, ledger 65,337,373; artifact `docs/evidence/stellar-soroban-commit-executed.json`) | Tranche 3 (40%) |

---

### 5. Budget ($50,000)

| Category | Amount | Justification |
|---|---|---|
| Engineering & security | $25,000 | Soroban contract, SDK integration, testing |
| Stellar integrations | $10,000 | Freighter, DEX, cross-border |
| Independent security review | $5,000 | Third-party audit |
| Infrastructure & testing | $5,000 | RPC nodes, hosting, monitoring |
| Developer adoption & docs | $5,000 | Documentation, examples, tutorials |
| **Total** | **$50,000** | Within Integration Track |

---

### 6. Team

- **Founder**: EslaM-X (CoreGuard Global)
- **GitHub**: https://github.com/coreguard-global/CoreGuard
- **LinkedIn**: https://www.linkedin.com/company/coreguard-global
- **Twitter**: https://x.com/CoreGuardGlobal

**Experience:**
- Built CoreGuard from scratch (1511 tests, 1052 files)
- Deployed 2 contracts on Core DAO mainnet
- Deployed Soroban commitment anchor on Stellar MAINNET (`CCKA2GYVILX7YZVSXGVIHOPNLTRBBF2SSWKBTQBIE7M67N5N2QMMXPSP`) and executed the first owner-authorized anchor CALL (INVOKED, tx `69044807410f65027c1227f4e525ad83f23a6cb1a2bb79790d82849c5dbc9fec`, ledger 65,337,373)
- Executed the first SIGNED funded mainnet swap (DEX-GATE/1 gated, CONFIRMED, tx `ac2a7990b3387aab96b197c0c921d57756bd25d65ad0e75b93561ded640b9097`, ledger 65,338,112)
- Executed first mainnet transaction on Stellar
- 10,000-run benchmark: 0 false accepts, 0 false rejects

**Team plan**: Solo founder + 1 Soroban engineer (post-funding) + 1 security reviewer (contract)

---

### 7. Traction (on Stellar)

- ✅ Soroban commitment anchor deployed on Stellar MAINNET (`CCKA2GYVILX7YZVSXGVIHOPNLTRBBF2SSWKBTQBIE7M67N5N2QMMXPSP`)
- ✅ First mainnet commitment-anchor CALL executed — owner-authorized `commit(proofId, commitment)` **INVOKED** (tx `69044807410f65027c1227f4e525ad83f23a6cb1a2bb79790d82849c5dbc9fec`, ledger 65,337,373; on-chain read-back `{hash, seq}` exact)
- ✅ First SIGNED funded mainnet swap (DEX-GATE/1 preflight VERIFIED, CONFIRMED — tx `ac2a7990b3387aab96b197c0c921d57756bd25d65ad0e75b93561ded640b9097`, ledger 65,338,112; `4.0598146 XLM → 0.6306239 USDC`)
- ✅ 11/11 Soroban integration tests passing
- ✅ 9 DEX gating tests passing
- ✅ Stellar agent payment verifier (STELLAR-AGENT/1)
- ✅ Freighter wallet wrapper
- ✅ Mainnet wallet created and funded
- ✅ First mainnet transaction executed
- ✅ Intent-to-execution conformance proof (docs/INTENT-TO-EXECUTION-PROOF.md)

### Traction (on other chains)

- ✅ Core DAO mainnet: 2 contracts deployed & verified
- ✅ 1511 tests passing
- ✅ 10,000-run benchmark: 0 false accept, 0 false reject
- ✅ 1,000/1,000 mutants refused
- ✅ 18/18 release gate legs pass

---

### 8. Why Integration Track?

We are incorporating existing Stellar building blocks:
- **Soroban** — commitment anchor contract
- **Freighter** — wallet signing
- **Stellar SDK** — transaction building
- **Horizon** — account management
- **Soroban RPC** — contract invocation

We have existing significant traction on Core DAO and are ready to build fast on Stellar.

---

### 9. Links

- **Repo**: https://github.com/coreguard-global/CoreGuard
- **Website**: https://coreguard.app
- **Docs**: https://eslam-x.github.io/coreguard/
- **LinkedIn**: https://www.linkedin.com/company/coreguard-global
- **Twitter**: https://x.com/CoreGuardGlobal
- **Org Profile**: https://github.com/coreguard-global
- **Intent-to-Execution Proof**: docs/INTENT-TO-EXECUTION-PROOF.md

---

### 10. Contact

- **Email**: coreguard@proton.me (or inquire@coredao.org)
- **GitHub**: https://github.com/coreguard-global
- **LinkedIn**: https://www.linkedin.com/company/coreguard-global

---

### SCF Referral

We are seeking an SCF referrer. If you are a Stellar community member, SDF employee, or partner, please reach out.