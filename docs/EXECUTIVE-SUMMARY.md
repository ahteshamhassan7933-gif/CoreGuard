# CoreGuard — Executive Summary | ملخص تنفيذي

> **AR:** صفحة واحدة تجمع كل حاجة عن CoreGuard: ما هو؟ كيف أثبته؟ وأين أبدأ؟  
> **EN:** One page to understand CoreGuard, verify it yourself, and know where to start.

---

## 1) What is CoreGuard? | ما هو CoreGuard؟

**AR:**  
CoreGuard هو طبقة إثبات تنفيذ (Execution-Truth) لعمليات الوكلاء الذكيين. كل قرار دفع، قبول، أو إفراج عن أموال لا يحدث إلا بعد إثبات حتمي وقابل لإعادة التحقق من قبل أي طرف مستقل، بدون الثقة في مُصدر واحد.

**EN:**  
CoreGuard is a fail-closed execution-truth layer for agent-to-agent jobs. Money never moves without verifiable evidence. Every verdict is reproducible from the committed tree by any independent reviewer.

**Core rule / القاعدة الأساسية:**  
`INTENT → POLICY → EXECUTION EVIDENCE → INDEPENDENT VERIFICATION → RECEIPT/DECISION`  
`UNKNOWN → HELD` — **never auto-pay, never auto-refund. Reserve before sign.**

---

## 2) Proof in numbers | دليل بالأرقام المقاسة

كل الأرقام أدناه **مقاسة آليًا** من الشجرة الملتزمة، وليست تقديرية.

| Item / العنصر | Value / القيمة | Source / المصدر |
|---|---|---|
| **Test suite / مجموعة الاختبارات** | **1511 / 1511 PASS (measured)** | [`npm test`](../package.json) · [`state-snapshot.json`](state-snapshot.json) |
| **Boundary audit / تدقيق الحدود** | **1052 files · 0 violations** | [`npm run boundary:audit`](../package.json) |
| **Claims audit / تدقيق الادعاءات** | **28 claims · VERIFIED 16 · 0 violations** | [`npm run claims:audit`](../package.json) · [`claims-registry.json`](claims-registry.json) |
| **Docs-node contract / عقود التوثيق القابلة للتنفيذ** | **124 executed · 79 skip-listed · 27 docs covered** | [`../test/ci/docs-node-contract.test.js`](../test/ci/docs-node-contract.test.js) |
| **Release gate / بوابة الإصدار** | **18/18 legs · GATE_PASS · independence PASS** | [`npm run release:gate:independence`](../package.json) · [`release-gate.json`](release-gate.json) |
| **Measured state check / فحص الحالة المقاسة** | **CHECK OK** | `node scripts/current-state.mjs --check` |

---

## 3) What exists (real inventory) | ما الموجود فعليًا

| Surface / السطح | Status / الحالة | Link / رابط |
|---|---|---|
| **Full inventory (every file/package/script/surface)** | **COMPLETE** | **[ALL-IN-ONE-CATALOG.md](ALL-IN-ONE-CATALOG.md)** |
| **Complete products & services catalog** | **COMPLETE** | **[PRODUCTS.md](PRODUCTS.md)** · **[PRODUCTS.html](PRODUCTS.html)** |
| **Live job-economy playground** | **LIVE** | **[docs/PLAYGROUND.html](PLAYGROUND.html)** |
| **AIE-1 incident review** | **LIVE** | **[docs/AIE-1-REVIEW.html](AIE-1-REVIEW.html)** |
| **DDE API/SDK references** | **LIVE** | **[docs/DDE-API-REFERENCE.html](DDE-API-REFERENCE.html)** · **[docs/DDE-SDK-REFERENCE.html](DDE-SDK-REFERENCE.html)** |
| **Single source of truth** | **LIVE** | **[docs/STATUS.md](STATUS.md)** |

**Packages:** `22` | **npm scripts:** `69` | **Workflows:** `6` | **Examples:** `12` | **Templates:** `2` | **Total files (measured):** `964` (see [`state-snapshot.json`](state-snapshot.json))

---

## 4) Verify in 60 seconds | تحقق خلال ٦٠ ثانية

**AR:** كل أمر أدناه يعمل محليًا بدون مفاتيح، بدون شبكة، وبدون فلوس.  
**EN:** Run these locally with zero keys, zero network dependency for the demos, and zero money.

```bash
# 1) Install
npm ci

# 2) Run the full measured test suite
npm test

# 3) Run the fail-closed agent-economy demo
node demo.mjs
```

**Expected / المتوقع:**
- `npm test` → **1511/1511 pass, fail 0**
- `node demo.mjs` → shows **`UNKNOWN → HELD`**
- `npm run claims:audit` → **CLAIM-AUDIT: PASS**
- `npm run release:gate:independence` → **GATE_PASS**

---

## 5) Where to start | من أين تبدأ؟

| Audience / الجهة | Go to / اذهب إلى | Why / لماذا |
|---|---|---|
| **First time / أول زيارة** | **[README.md](../README.md)** | نظرة سريعة + Proof-first + روابط مباشرة |
| **Want EVERYTHING listed / عايز كل حاجة** | **[ALL-IN-ONE-CATALOG.md](ALL-IN-ONE-CATALOG.md)** | كل باكدج، سكريبت، مثال، قالب، سطح، ملف ومساره |
| **Reviewing / للمراجعة** | **[HOW-TO-EVALUATE.md](HOW-TO-EVALUATE.md)** | تقييم سريع وخطوات واضحة للمدقق |
| **Want the full product view / عايز عرض المنتجات** | **[PRODUCTS.html](PRODUCTS.html)** | عرض ثنائي اللغة واضح جدًا |
| **Need facts only / حقائق فقط** | **[STATUS.md](STATUS.md)** | الأرقام المقاسة، لا تقديرات |

---

## 6) Honesty statement | بيان الصدق

**AR:**  
لا يوجد ادعاء بإيراد، عملاء، شراكات، تمويل، أسعار منشورة، تكامل خارجي حي، إصدار شارات، تسوية/ضمان/حفظ، أو تدقيق أمني من طرف ثالث. أي شيء من دول إما `UNKNOWN` أو `GATED` أو غير موجود. كل ما هو `SHIPPED`/`LIVE` موجود فعلاً في الشجرة الملتزمة وقابل للتشغيل أو الفحص.

**EN:**  
No revenue, customers, partnerships, funding, published pricing, live external integration, badge issuance, settlement/escrow/custody, or third-party security audit is claimed. Anything in those categories is `UNKNOWN`, `GATED`, or does **not** exist. Everything marked `SHIPPED`/`LIVE` is present in the committed tree and verifiable by running the commands above.

**Repo:** [github.com/coreguard-global/CoreGuard](https://github.com/coreguard-global/CoreGuard)  
**Pages:** [eslam-x.github.io/coreguard](https://eslam-x.github.io/coreguard/)
