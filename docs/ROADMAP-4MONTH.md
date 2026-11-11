# CoreGuard Stellar — 4-Month Roadmap

## Overview

Focused roadmap for SCF Build Award. 4 months, 3 core functions, verifiable deliverables.

---

## Month 1: Soroban Contract + Testnet Deployment

### Deliverables
1. Soroban commitment anchor contract deployed on testnet ✅ (done)
2. Intent-to-execution conformance tests (9 tests) ✅ (done)
3. Deterministic replay proof ✅ (done)
4. Independent verification demo ✅ (done)

### Acceptance Criteria
- [ ] Contract deployed on testnet (done)
- [ ] 9 conformance tests passing (done)
- [ ] Independent verifier can replay (done)
- [ ] Documentation updated (done)

### Verification
- `npm test` passes (1511 tests)
- `node scripts/current-state.mjs --check` passes
- Contract ID verifiable on Stellar Expert

---

## Month 2: Freighter + Soroban + Hostile Transaction Tests

### Deliverables
1. Freighter wallet integration tested end-to-end
2. Soroban contract invocation tested on testnet
3. Hostile transaction tests (tampered, replayed, etc.)
4. DEX gating tested with real Soroban DEX

### Acceptance Criteria
- [ ] Freighter sign + submit tested
- [ ] Soroban invoke tested
- [ ] 10+ hostile transaction tests
- [ ] DEX gating prevents bad swaps (proven)

### Verification
- E2E test on testnet
- Hostile transaction test results
- DEX gating proof

---

## Month 3: DEX + AI Agent + External Developer Demo

### Deliverables
1. DEX gating integrated with real Soroban DEX
2. AI agent payment gate tested on testnet
3. External developer demo (one developer uses CoreGuard)
4. Documentation and examples

### Acceptance Criteria
- [ ] Real DEX swap gated
- [ ] Real AI agent payment verified
- [ ] External developer demo recorded
- [ ] Developer documentation complete

### Verification
- DEX gating proof
- AI agent payment proof
- Developer demo video

---

## Month 4: Independent Verifier + Security Review + Mainnet Release

### Deliverables
1. Independent verifier (no CoreGuard dependency)
2. Security review (third-party)
3. Mainnet Soroban contract deployment
4. Production release

### Acceptance Criteria
- [ ] Independent verifier passes
- [ ] Security review complete
- [ ] Mainnet contract deployed
- [ ] Production release published

### Verification
- Independent verifier test results
- Security review report
- Mainnet contract ID
- Production release

---

## Budget ($50,000)

| Category | Amount | Justification |
|---|---|---|
| Engineering & security | $25,000 | Soroban contract, SDK integration, testing |
| Stellar integrations | $10,000 | Freighter, DEX, cross-border |
| Independent security review | $5,000 | Third-party audit |
| Infrastructure & testing | $5,000 | RPC nodes, hosting, monitoring |
| Developer adoption & docs | $5,000 | Documentation, examples, tutorials |
| **Total** | **$50,000** | Within Integration Track |

---

## Team

- **Founder**: EslaM-X (CoreGuard Global)
- **Post-funding**: 1 Soroban engineer (contract), 1 security reviewer (contract)
- **Current**: Solo founder

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Soroban mainnet fees high | Test on testnet first, optimize WASM |
| No external users | Focus on 1 DApp integration |
| Team size | Solo founder + contractors |
| Competition | Focus on unique value (conformance) |

---

## Links

- **Repo**: https://github.com/coreguard-global/CoreGuard
- **Evidence Matrix**: docs/EVIDENCE-MATRIX.md
- **Intent-to-Execution Proof**: docs/INTENT-TO-EXECUTION-PROOF.md
- **SCF Application**: docs/SCF-BUILD-APPLICATION.md