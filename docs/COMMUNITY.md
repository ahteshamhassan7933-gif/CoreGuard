# Community Outreach — Core Developer Channels

The purpose of this document is **not** to ask for funds. It is a request for the
*correct* path to obtain a small amount of tCORE2 (Testnet2) so CoreGuard can
complete its final v0.1 milestone: a live on-chain anchor on Core Testnet2.

## Why this is legitimate to post

- We are not a concept. The public repo is: `github.com/coreguard-global/CoreGuard`
- CI-green on Node 22/24 (supported LTS; Node 18/20 retired at EOL — 2025-04 / 2026-04) + Foundry + demos.
- Staged, funding-gated Core Testnet2 validation campaign (contract + proof anchoring once tCORE2 is available).
- The sole blocker is the official faucet returning 401 / CAPTCHA failures.

## Evidence the faucet issue is not local

The Core Testnet2 Faucet **wallet is funded** on-chain (~991k tCORE2, 8,000+
claims), so this is not depletion. Independent evidence from the core developer
community shows **CAPTCHA failures reported by other users** (a Testnet2
developer report dated 2026-07-31 → 2026-08-08, where a user attempting to get
an explorer API key hit persistent CAPTCHA errors and a moderator's retry
suggestion did not resolve it). This points to an **access/protection layer
issue on the faucet**, not to our environment alone. (Confirmed by probing:
`GET/POST /api/faucet*` returns 401 regardless of headers/body.)

## The message (copy-paste to the Core dev community)

> Hey Core devs 👋
>
> I'm building **CoreGuard**, an open-source, Core-native execution-verification
> layer. The v0.1 implementation is public and CI-green:
>
> • 1511/1511 tests
> • 73/73 adversarial benchmarks
> • a staged, funding-gated Core Testnet2 validation campaign
> • deterministic trace normalization
> • intent → policy → execution comparison
> • state delta + evidence bundle
> • portable execution receipt
> • offline independent verification (no RPC, no trust)
> • tamper detection
> • transfer / swap / multistep runnable demos
> • local EvidenceRegistry anchoring proven on a Testnet2 fork
>
> GitHub: https://github.com/coreguard-global/CoreGuard
>
> The only thing left for the final v0.1 milestone is the **real Testnet2
> EvidenceRegistry broadcast**.
>
> The official faucet (`scan.test2.btcs.network/faucet`) is returning
> **401 / CAPTCHA failures**. I also found an earlier Testnet2 developer report
> in the community describing persistent CAPTCHA failures, so this looks like an
> access-side issue rather than a depleted faucet.
>
> If anyone from the Core dev/community team can point me to the correct way to
> get a small amount of tCORE2 for a Testnet2 deployment, I'll complete the
> anchor and publish the deployment TX + block + proof ID publicly.
>
> No mainnet funds or production access needed — strictly Testnet2. 🙏

## Safety rules (non-negotiable)

- **Only ever share the public wallet address:** `0x6cB4796D54ED72105ec617c8850C91972a0d9469`
- **NEVER share:** private key, seed phrase, `.env`, RPC credentials, or any
  signed message.
- If anyone asks for the private key to "fund it" → refuse immediately.
- Do not respond to DMs claiming to be official support unless they are in a
  public, verifiable channel.

## Recommended channels (verified)

| Channel | Where | Status |
|---|---|---|
| Core official Discord | `https://discord.com/invite/coredaoofficial` | invite valid (title "CoreDao.org") |
| Core dev Telegram | `https://t.me/CoreDAOTelegram` | referenced in official docs |

Use the server search for "faucet" and check Developers/Builders/Testnet
categories; some servers require a `#verify` role before writing.

## Larger tCORE2 request (more than the daily 1)

The public faucet gives up to **1 tCORE2/day**. Core also has a
**developer request form** for larger amounts (a baseline grant is ~10 tCORE2,
with a justification field when you need more than 10). The official docs only
publicize the faucet + Discord, so the form URL is distributed by Core's team
— ask for it in the Discord/Telegram builder channels (pinned messages or a
moderator). Fill-ready answers (adjust to whatever the form actually asks):

| Form field | Answer |
|---|---|
| Wallet address (tCORE2) | `0x6cB4796D54ED72105ec617c8850C91972a0d9469` |
| GitHub / project URL | `https://github.com/coreguard-global/CoreGuard` |
| Reason (technical, no marketing) | I am developing CoreGuard, an open-source verification infrastructure project for Core-native Bitcoin DeFi. I need Testnet2 tCORE2 to deploy and test the EvidenceRegistry contract and perform on-chain proof anchoring. The project already has a public GitHub repository, 1511/1511 tests and 73/73 benchmarks, a deterministic trace/evidence pipeline, local fork-based anchoring, and a reproducible CI pipeline. The remaining integration step is a real Testnet2 deployment and on-chain anchorProof transaction, pending testnet funding. I need additional testnet funds to repeatedly deploy, test, and verify the contract under realistic conditions, including failed/tampered proof cases and independent verification. |
| How many tokens do you need? | 20–50 tCORE2 — deploy EvidenceRegistry once, then repeated integration + adversarial (tampered/failed proof) anchoring and independent on-chain verification. |

Verifiable on request: the repo, CI, benchmarks, and the local fork anchor
transcript are all public. **Never** paste a private key / `.env` / seed — only
the public address above.

## Post-funding sequence (no code changes until it completes)

```
Balance → Deploy → Deployment TX → Anchor → Anchor TX → Event →
On-chain verification → README LIVE CORE TESTNET2 ANCHOR → v0.1 freeze
```

The deployment uses `script/Deploy.s.sol` (`--legacy`, chain 1114) and the
deployment/anchor is validated by `scripts/verify-anchor.ps1` (three proofs).

## What "done" means — three independent proofs

When any tCORE2 lands on the deployer and the broadcast succeeds, we must show
**three separately checkable artifacts**, not just "a contract exists":

| # | Proof | How verified |
|---|---|---|
| A | **Deployment evidence** → registry exists on Testnet2 | Fetch the deployment tx receipt by hash; assert status = success and `contractAddress` = registry |
| B | **Registry commitment verification** → anchor recorded | Read `verifyCommitment(proofId, commitment)` from the chain (RPC) → `true`; with the anchor tx, also match `ProofAnchored[proofId, commitment, result]` |
| C | **Independent recomputation** → offline == on-chain | Recompute `receiptId` + `commitment` + `proofId` **off-chain** from the receipt/evidence (`proofId = H("CGEP/1:ANCHOR", {chainId, receiptId, commitment})`) and compare to what the chain returns |

A+B+C = **VERIFIED ANCHOR INTEGRITY** — not execution truth. The execution claim
is supported by the independently verifiable evidence/replay bound to that
commitment.

Run: `scripts/verify-anchor.ps1` (or `scripts/anchor-local.sh`) after the live
broadcast to produce this report automatically.

When A + B + C pass, we tag `v0.1`, publish the transcript in the README as
**LIVE CORE TESTNET2 ANCHOR**, and stop — no Firewall / ZK / Passport / Risk
Score until the on-chain proof semantics review is done.