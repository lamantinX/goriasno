# AI Run: Catalog — add bagged ДГ (50kg) + lower Т ash to 12%

## Meta
- **Date:** 2026-06-18
- **Task Class:** Standard
- **Trigger:** Client (Денис) request via Дмитрий: "Нужно добавить уголь марки Дг(Длинопламенный) г.Луганск с золой до 10%, мешки не по 40, а по 50 кг фасовка. И марка Т до 12% зольности, 15 это много. И продажа мешками от 600 руб/меш." → user said "продолжай".
- **Status:** SUCCESS
- **Tags:** none

## Scope
- **Goal:** Add a bagged ДГ product (50 kg, ash ≤10%, от 600 RUB/мешок, Луганск) and correct the Т (Тощий) ash from 15% to 12%.
- **Files in (modified):** `src/data.ts`, `src/components/FeedbackSection.tsx`
- **Files out (read only):** `src/types.ts`, `.claude/rules/task-routing.md`, `docs/ai-runs/_TEMPLATE.md`, `docs/sprints/_TEMPLATE.md`, prior sprint/run examples.
- **Sensitive surfaces touched:** none

## Plan reference
- **Sprint artifact:** `docs/sprints/catalog-coal-dg-bags-and-t-ash-update.md`
- **Approved plan:** N/A (Standard tier)

## Changes
- Added new product `coal-dg-bags` to `src/data.ts` PRODUCTS array (placed after bulk `coal-dg`): name "Уголь ДГ (Длиннопламенный) в мешках", badge "В МЕШКАХ", subBadge "ЛУГАНСК", ashValue "до 10%", heatValue "5500-6200 ккал/кг", fraction "25-50 мм", priceEstimate "от 600", unit "мешок", description mentions 50 кг bags + Луганск, image `/images/products/coal-dg.jpg`. → Contract criterion 1.
- Updated `coal-t` `ashValue` from `"до 15%"` to `"до 12%"` in `src/data.ts`. → Contract criterion 2.
- Added `<option>Уголь ДГ (Длиннопламенный) в мешках</option>` to the product-type `<select>` in `src/components/FeedbackSection.tsx`, directly after the bulk ДГ option. → Contract criterion 3.
- No unrelated changes.

## Evidence
- `npm run verify` → PASS (tsc --noEmit clean; vite v6.4.3 ✓ built in 8.25s, 0 errors, 1693 modules transformed)
- Criterion 1: new `coal-dg-bags` entry present with required fields → PASS
- Criterion 2: `coal-t` ashValue is `"до 12%"` → PASS
- Criterion 3: FeedbackSection `<select>` contains the bagged ДГ option → PASS
- Criterion 4: `npm run verify` exit 0 → PASS
- Skipped: Playwright visual smoke — e2e pending Plan 007 — remaining risk: LOW (data-only change, reuses existing Product schema, build proves TS/JSX valid)

## Failures / Rework
None. Single-pass implementation.

## Workflow notes
None.

## Outcome
Catalog now offers a bagged ДГ (Луганск, ≤10% ash, 50 kg bags, от 600 RUB/мешок) alongside the bulk ДГ, and the Т (Тощий) ash is corrected to ≤12%. Next step: none unless client supplies a dedicated bagged-ДГ photo (current reuse of coal-dg.jpg is acceptable).
