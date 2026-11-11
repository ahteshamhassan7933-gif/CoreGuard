# How to Evaluate CoreGuard | كيف تقيّم CoreGuard

> **AR:** موجه خصيصًا للمُراجع ليقيم المشروع بسرعة وبموضوعية خلال ٥–١٠ دقائق فقط.  
> **EN:** A reviewer-focused guide to evaluate CoreGuard objectively in 5–10 minutes using only local, reproducible checks.

---

## Goal | الهدف

**AR:** إثبات كل ادعاء بنفسك، بدون ثقة، وبدون مفاتيح أو فلوس.  
**EN:** Verify every claim yourself with zero trust, zero keys, and zero money.

---

## Step 1: Get the code | الخطوة ١: الحصول على الكود (30s)

```bash
git clone https://github.com/coreguard-global/CoreGuard.git
cd coreguard
npm ci
```

---

## Step 2: Run the full measured suite | الخطوة ٢: تشغيل مجموعة الاختبارات المقاسة (3–6 min)

```bash
npm test
```

**Expected / المتوقع:**  
`ℹ tests 1511` · `ℹ pass 1511` · `ℹ fail 0`

This enforces the total against [`docs/state-snapshot.json`](state-snapshot.json). Any drift makes it fail.  
هذا المجموع مُقيد آليًا ضد لقطة الحالة المقاسة، وأي انحراف يفشل الاختبار.

---

## Step 3: Verify the honesty layer | الخطوة ٣: التحقق من طبقة الصدق (10–20s)

```bash
npm run claims:audit
npm run boundary:audit
npm run release:gate:independence
node scripts/current-state.mjs --check
```

**Expected / المتوقع:**
- `CLAIM-AUDIT: PASS` (28 claims, 0 violations)
- `BOUNDARY-AUDIT: PASS` (0 violations)
- `GATE_PASS` + `independence PASS` (18/18)
- `BOUNDARY-CURRENT-STATE: CHECK OK`

---

## Step 4: Run the fail-closed demo | الخطوة ٤: تشغيل العرض التجريبي الفاشل-مغلق (5s)

```bash
node demo.mjs
```

**Expected / المتوقع:** Ends with **`UNKNOWN → HELD`**  
يعرض كيف يتصرف النظام عند الغموض: **يُعلّق ولا يدفع ولا يسترد تلقائيًا**.

---

## Step 5: Inspect the full inventory | الخطوة ٥: فحص الحصر الكامل (بسرعة)

| File | Purpose |
|---|---|
| **[ALL-IN-ONE-CATALOG.md](ALL-IN-ONE-CATALOG.md)** | **Every file, package, script, example, template, workflow and surface** with paths and runnable commands. |
| **[PRODUCTS.md](PRODUCTS.md)** / **[PRODUCTS.html](PRODUCTS.html)** | Curated products & services with honest status per item. |
| **[STATUS.md](STATUS.md)** | Single source of truth. Only measured numbers. |
| **[claims-registry.json](claims-registry.json)** | Every claim with its status and evidence path. |
| **[state-snapshot.json](state-snapshot.json)** | Machine-measured snapshot used by CI/tests. |

---

## Quick checklist | قائمة فحص سريعة

- [ ] `npm test` = **1511/1511 PASS**
- [ ] `claims:audit` = **PASS**
- [ ] `boundary:audit` = **PASS**
- [ ] `release:gate:independence` = **GATE_PASS**
- [ ] `current-state --check` = **CHECK OK**
- [ ] `node demo.mjs` shows **`UNKNOWN → HELD`**
- [ ] You can trace **any** claim to a **committed file** in the repo

---

## Notes on scope | ملاحظات

- **No keys required** — all demos run offline with zero credentials.
- **No live payments** — `x402` is a harness; live chain/payment/webhook claims are **not** made.
- **No external integrations claimed** — adapters are `DRY_RUN` unless explicitly proven otherwise.
- **Honest by design** — `UNKNOWN` is never guessed. It is **HELD**.
- **Reproducible** — verify from a clean clone, not from this working tree.

**Start here:** [EXECUTIVE-SUMMARY.md](EXECUTIVE-SUMMARY.md) | **Repo:** [github.com/coreguard-global/CoreGuard](https://github.com/coreguard-global/CoreGuard)
