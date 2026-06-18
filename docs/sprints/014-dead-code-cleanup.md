# Sprint: Plan 014: Dead Code Cleanup

Branch: advisor/014-dead-code-cleanup · Date: 2026-06-19 · Class: Standard

## Sprint
**Goal:** Remove the dead design-review scaffolding left by plan 006, plus three trivial fix-ups (SPDX header, deprecated `substr`, unused import).
**Scope:** in — `src/App.tsx`, `src/types.ts`, `src/data.ts`, `src/components/Hero.tsx`, `src/components/Modal.tsx`, `src/components/FeedbackSection.tsx`; out — `DELIVERY_AREAS` export, the 3-way `theme` system and `getTheme*Class()` functions, any `localStorage`/submissions/form logic, wrapper `<div>`s themselves (only their className + removed annotation children change).
**Risks:** accidentally removing the `DELIVERY_AREAS` export (business data, reserved for direction D3); removing a still-used type; e2e asserting on a DOM shape that changes. All mitigated by grep gates + e2e green.
**Context budget:** Tiny — the 6 in-scope files + `plans/014-dead-code-cleanup.md`.

## Contract
1. `grep -rn "showGuides|placedNotesEnabled|getGuidesClass|INITIAL_DESIGN_NOTES|DesignNote|Apache-2.5|\.substr(" src` → no matches.
2. `DELIVERY_AREAS` import removed from `Hero.tsx`; export preserved in `data.ts` (1 match).
3. `MockupConfig` in `src/types.ts` has only `theme` and `mockupStage` fields.
4. `App.tsx` has no `{config.showGuides && …}` blocks and no `getGuidesClass`; the six section wrappers use `className="transition-all"`.
5. `npm run lint` exits 0; `npm run build` exits 0.
6. `npx playwright test --project=chromium` → all 4 pass.
7. `git status` shows changes only to the 6 in-scope files (+ sprint artifact + index).

## Critique
The plan is pure deletion + two mechanical string substitutions. Edge cases:
- `INITIAL_DESIGN_NOTES`/`DesignNote` removed only after grep confirms no consumer — verified (no import error after removal, lint clean).
- `substr(2,9)` → `slice(2,11)` is the documented equivalent (9 chars from index 2); same id semantics for submission ids — non-behavioral.
- The wrapper `<div>`s themselves are kept (only className + removed annotation child change), so e2e DOM-structure assertions survive — confirmed by 4/4 e2e passing.
- No sensitive surfaces touched. No new deps. No env/config changes.

## Evidence
- `npm run verify` → not run directly; `npm run lint` (tsc --noEmit) → exit 0; `npm run build` → exit 0 (278 kB JS, 77 kB CSS).
- Criterion 1: `git grep -n -E "showGuides|placedNotesEnabled|getGuidesClass|INITIAL_DESIGN_NOTES|DesignNote|Apache-2.5|\.substr(" -- src` → exit 1 (no matches) PASS.
- Criterion 2: `git grep -n "DELIVERY_AREAS" -- src/components/Hero.tsx` → no match; `git grep -n "export const DELIVERY_AREAS" -- src/data.ts` → `src/data.ts:119:export const DELIVERY_AREAS = [` PASS.
- Criterion 3: `MockupConfig` reduced to `{ theme; mockupStage }` PASS (see diff).
- Criterion 4: six wrappers now `<div className="transition-all">`, no `getGuidesClass`, no `config.showGuides` PASS.
- Criterion 5: lint exit 0; build exit 0 PASS.
- Criterion 6: `npx playwright test --project=chromium` → 4 passed (27.4s) PASS.
- Criterion 7: `git diff --stat HEAD` → exactly 6 in-scope files (+ this artifact + index row). PASS.
- Skipped: none.

Deviation (benign): Header/Hero/Catalog/FeedbackSection/SuccessState edits incidentally stripped trailing whitespace on JSX attribute lines I was already editing (`<Header ` → `<Header`, `}} ` → `}}`). No behavior change; lint/build/e2e green.

## Evaluation
All 7 contract criteria met. Dead code removed; `DELIVERY_AREAS` export and 3-way theme system preserved as required; full verify gate green; scope clean.

Result: PASS
