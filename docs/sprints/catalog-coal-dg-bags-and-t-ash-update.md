# Sprint: Catalog — add bagged ДГ (50kg) + lower Т ash to 12%

Branch: main · Date: 2026-06-18 · Class: Standard

## Sprint
**Goal:** Add a bagged ДГ (Длиннопламенный, Луганск) product in 50 kg bags at ash ≤10% / from 600 RUB/bag, and lower the existing Т (Тощий) ash from 15% to 12%, per client (Денис) request.
**Scope:** in — `src/data.ts`, `src/components/FeedbackSection.tsx`; out — everything else (images, pricing engine, delivery areas).
**Risks:** none sensitive; landing-page structure is a critical area — keep new product shape identical to existing entries so catalog grid stays consistent.
**Context budget:** Tiny — `src/data.ts`, `src/components/FeedbackSection.tsx`, `src/types.ts`.

## Contract
1. `src/data.ts` contains a new product `coal-dg-bags` with `ashValue: "до 10%"`, `priceEstimate: "от 600"`, `unit: "мешок"`, and description mentioning 50 кг bags and Луганск.
2. `src/data.ts` `coal-t` product `ashValue` equals `"до 12%"` (was `"до 15%"`).
3. `src/components/FeedbackSection.tsx` product-type `<select>` includes an `Уголь ДГ (Длиннопламенный) в мешках` option.
4. `npm run verify` exits 0.

## Critique
- Bag size: client explicitly said "мешки не по 40, а по 50 кг" — the new ДГ bagged product must say 50 кг, NOT copy the 40 кг from the anthracite-bags description. Verified in description text.
- Ash: the bulk ДГ (`coal-dg`) keeps `до 20%` — client said "добавить" (add), not change the bulk one. The new bagged ДГ is a separate higher-grade product at `до 10%`. Left bulk ДГ untouched.
- Т ash: `до 15%` → `до 12%` is a strict per-client correction ("15 это много"). Only the `ashValue` field changes; description/price/fraction unchanged.
- New product image: no dedicated bagged-ДГ photo exists; reused `/images/products/coal-dg.jpg` (same as bulk ДГ). Low risk — image swap is a later trivial task if a real photo arrives.
- Dropdown: placed the new bagged ДГ option directly after the bulk ДГ option so both ДГ variants are adjacent in the form.
- No new fields added to the `Product` type — new product reuses the existing schema, so no type/build risk.

## Evidence
- `npm run verify` → PASS (tsc --noEmit clean; vite build ✓ built in 8.25s, 0 errors)
- Criterion 1: new `coal-dg-bags` entry present in `src/data.ts` with `ashValue: "до 10%"`, `priceEstimate: "от 600"`, `unit: "мешок"`, description contains "50 кг" and "Луганск" → PASS
- Criterion 2: `coal-t` `ashValue` is `"до 12%"` → PASS
- Criterion 3: `FeedbackSection.tsx` `<select>` contains `Уголь ДГ (Длиннопламенный) в мешках` → PASS
- Criterion 4: `npm run verify` exit 0 → PASS
- Skipped: Playwright/visual smoke — e2e suite pending Plan 007 — remaining risk: LOW (data-only change, grid renders existing shape, build proves JSX/TS valid)

## Evaluation
All four Contract criteria met. No unrelated changes. `npm run verify` green. Change is data-only and reuses the existing `Product` schema, so catalog grid + feedback form render with no structural risk.

Result: PASS (Self-Evaluated)
