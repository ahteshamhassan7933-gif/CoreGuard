# Architecture: agreed → executed → proven

CoreGuard enforces a strict mechanical split. **Proof over promise.**

## Flow

```text
┌─────────┐   ┌───────────┐   ┌─────────┐
│  AGREED │ → │  EXECUTED │ → │  PROVEN  │
└─────────┘   └───────────┘   └─────────┘
     │              │              │
   Job+ceiling   Reserve before  Evidence evaluated
   Hold at pub   sign (x402)     mechanically
```

## Budget & Reservation

- **Agent never holds payer key.** Only a job-scoped authority token.
- **Reserve before sign.** Every cost is atomically reserved against the job or a carved sub-agent share before any signature.
- **Race-safe.** Two sub-agents cannot both take the "last dollar". Refused at reservation time.
- **Per-job, not global cap.** Knows exactly what each run/sub-agent is allowed to spend.

## Acceptance & Disposition

| Verdict | Disposition | Meaning |
| --- | --- | --- |
| **ACCEPTED** | `RELEASED` | Evidence matches machine-checkable criteria → funds released. |
| **REJECTED** | `REFUNDED` | Evidence fails a required mechanical check → funds refunded. |
| **UNKNOWN** | **`HELD`** | Needs judgment or can't be determined mechanically → **funds stay LOCKED**. Never auto-pay. Never auto-refund. |

## The "UNKNOWN stays HELD" Rule

For non-deterministic work, there is **no universal mechanical oracle**. 

- Auto-refund punishes workers for questions the system cannot answer.
- Auto-pay launders "payment" into "done" without proof.
- **Holding is the honest third answer.**

Publisher/human judgment can feed in as input, but the **hold is enforced by the ledger mechanically** regardless of who the oracle is.

## Proof

- **Playground (live):** [https://eslam-x.github.io/coreguard/PLAYGROUND.html](https://eslam-x.github.io/coreguard/PLAYGROUND.html)
- **Demo:** `node demo.mjs`
- **Tests:** 1511/1511 passing • Boundary audit PASS · Release gate GATE_PASS
- **One-Pager:** [ONE-PAGER.md](ONE-PAGER.md)
