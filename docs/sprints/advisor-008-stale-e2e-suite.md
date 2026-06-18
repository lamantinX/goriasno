# Sprint: Fix stale E2E selectors and restore verification baseline

> Copy this file to `docs/sprints/<slug>.md`. Scaffold via `bash scripts/sprint-artifacts.sh sprint --slug <slug> --title "Title" --class Standard`. Replace `Result: PENDING` with the real verdict after evaluating.

Branch: advisor/008-stale-e2e-suite · Date: 2026-06-18 · Class: Standard

## Sprint
**Goal:** Fix 2 stale E2E selectors and add `npm test` script to restore the verification baseline.
**Scope:** in — `tests/example.spec.ts`, `package.json`; out — `src/data.ts`, `src/components/*.tsx`, `playwright.config.ts`, `.github/workflows/playwright.yml`
**Risks:** Low — only test assertions and a package.json script change; no source code modified.
**Context budget:** Tiny — 2 files to edit, 1 config file.

## Contract

1. `npx playwright test --project=chromium` exits 0 with all 4 tests passing.
2. `npx playwright test` exits 0 with all 12 test-sessions passing (4 tests × 3 browsers).
3. `npm run lint` exits 0 (no source changes).
4. `npm run build` exits 0 (no source changes).
5. `git diff --stat HEAD~2..HEAD` shows changes only to `tests/example.spec.ts` and `package.json`.
6. A `"test": "playwright test"` script exists in `package.json`.

## Critique
No edge cases — the change is purely selector string corrections. The modal test and header test were already green and untouched.

## Evidence

- `npm run verify` → exit 0 (lint + build both pass)
- Criterion 1: `npm test -- --project=chromium` → 4 passed (20.9s)
- Criterion 2: `npx playwright test` → 12 passed (1.5m)
- Criterion 3: `npm run lint` → exit 0
- Criterion 4: `npm run build` → exit 0
- Criterion 5: `git diff --stat HEAD~2..HEAD` → `package.json | 3 ++-`, `tests/example.spec.ts | 6 +++---`
- Criterion 6: `package.json` contains `"test": "playwright test"`

## Evaluation
All criteria pass. Diff is minimal (3 selector fixes + 1 script addition). No scope violations.

Result: PASS

