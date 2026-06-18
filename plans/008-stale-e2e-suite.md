# Plan 008: Fix stale E2E selectors and restore the verification baseline

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 109390e..HEAD -- tests/example.spec.ts src/data.ts src/components/FeedbackSection.tsx playwright.config.ts package.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none (this is the verification baseline — land first)
- **Category**: tests
- **Planned at**: commit `109390e`, 2026-06-17
- **Blocked**: The underlying data updates in `src/data.ts` and `FeedbackSection.tsx` are not committed to `main` yet. The executor worktree checks out `HEAD` and cannot see uncommitted changes, meaning the tests currently pass on old data in the worktree. Please commit those changes first before executing this plan.

## Why this matters

The only automated test layer (Playwright E2E in `tests/example.spec.ts`) is
rotten: 2 of its 4 tests assert product names that no longer match the catalog
data after the 2026-06-17 catalog-contacts-update run. The CI workflow
(`.github/workflows/playwright.yml`) runs `npx playwright test` on every push
and PR, so the first commit that lands the workflow will fail CI. More
importantly, there is no trustworthy verification gate for any subsequent
change until the suite is fixed and green. This plan restores that baseline
and makes the tests data-driven so they don't rot again.

## Current state

### The repo

Single-page React 19 + Vite 6 + Tailwind v4 catalog site for a coal/firewood
warehouse in Donetsk (Russian-language). Catalog data lives in one module;
the footer form is the main lead-capture path; a modal opens from the catalog
"Рассчитать заказ" buttons. Verification commands (verified during recon):

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `npm install` | exit 0 |
| Typecheck | `npm run lint` | exit 0 (runs `tsc --noEmit`) |
| Build | `npm run build` | exit 0, writes `dist/` |
| Dev server | `npm run dev` | serves on http://localhost:3000 |
| E2E | `npx playwright test` | all pass (auto-starts dev via `webServer`) |

`playwright.config.ts` sets `testDir: './tests'`, `baseURL: 'http://localhost:3000'`,
and a `webServer` that runs `npm run dev` and reuses an existing server
locally. CI installs browsers with `npx playwright install --with-deps`.

### The broken selectors

`tests/example.spec.ts` — the 4 tests and their mismatched assertions:

- Line 31: `page.locator('h3:has-text("Дрова: Дуб, Акация")')` — but the real
  product name in `src/data.ts:66` is `"Дрова: Берёза, Дуб, Акация"`.
  `:has-text` is substring + case-sensitive; `"Дрова: Дуб, Акация"` is NOT a
  substring of the real name (the real name has `"Берёза, "` between
  `"Дрова: "` and `"Дуб"`). This assertion never matches.
- Line 35: `page.locator('h3:has-text("Уголь Марка Т")')` — but
  `src/data.ts:39` is `"Уголь марки Т (Тощий)"` (lowercase `"марки"`). Case
  mismatch + extra text → never matches.
- Line 49: `await page.locator('select').selectOption('Дрова: Дуб, Акация (колотые)')`
  — but the `<option>` in `src/components/FeedbackSection.tsx:194` is
  `"Дрова: Берёза, Дуб, Акация"` (no `" (колотые)"` suffix).
  `selectOption` requires an exact option match → throws "Timeout waiting
  for option".
- Line 70 (`'span:has-text("Быстрый заказ товара")'`) and the modal
  close via `svg.lucide-x` — these still match (`Modal.tsx:167` and the
  lucide `X` icon), so the modal test is currently the only fully-green one.

Because the catalog filter test (lines 20–37) asserts BOTH the broken
firewood text and the broken coal text, and the form test (lines 39–62)
throws at `selectOption`, **2 of 4 tests fail** today.

### Repo conventions to match

- Tests are in `tests/`, Russian `test.describe`/`test` titles, `@playwright/test`
  only — no extra test libs. Match the existing style.
- UI strings are Russian; selectors use `:has-text("…")` against rendered
  Russian text. The fix must reference the CURRENT strings in `src/data.ts`
  and `src/components/FeedbackSection.tsx` exactly.
- No unit-test framework exists; do not add one in this plan.

## Commands you will need

| Purpose | Command | Expected on success |
|-----------|--------------------------|---------------------|
| Install deps | `npm install` | exit 0 |
| Install browsers (one-time in worktree) | `npx playwright install chromium` | exit 0 |
| Run E2E (chromium only, fast) | `npx playwright test --project=chromium` | 4 passed |
| Run E2E (all browsers) | `npx playwright test` | all passed |
| Typecheck (unchanged) | `npm run lint` | exit 0 |

## Scope

**In scope** (the only files you should modify):
- `tests/example.spec.ts` (rewrite the stale assertions; keep the 4 test names/topics)
- `package.json` (add a `"test"` script that runs Playwright, so there is a one-command gate — see Step 3)

**Out of scope** (do NOT touch):
- `src/data.ts`, `src/components/*.tsx` — do NOT change product names or the
  `<option>` list to match the tests; the tests are wrong, not the data.
- `playwright.config.ts` — already correct.
- `.github/workflows/playwright.yml` — already runs `npx playwright test`;
  do not change CI in this plan (committing the workflow is the operator's
  decision, separate from fixing the tests).

## Git workflow

- Branch: `advisor/008-stale-e2e-suite`
- Commit per step; message style (match `git log --oneline`): conventional
  commits in English, e.g. `test(e2e): fix stale catalog selectors to match current data`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Confirm the current breakage (baseline)

Run the suite and observe the 2 failures so you know what you're fixing.

**Verify**: `npx playwright test --project=chromium` → exits non-zero, with
exactly 2 failures: `Фильтрация товаров в каталоге` (assertion timeout on the
firewood/coal `h3`) and `Отправка формы обратной связи в подвале` (timeout on
`selectOption`). The other 2 tests pass. If a different number of tests fail,
STOP — the codebase has drifted from this plan.

### Step 2: Fix the catalog filter test to use the real product names

In `tests/example.spec.ts`, inside the `Фильтрация товаров в каталоге` test:

- Change the firewood assertion (line ~31) to match `src/data.ts:66`:
  `page.locator('h3:has-text("Дрова: Берёза, Дуб, Акация")')`.
- Change the coal "not visible" assertion (line ~35) to match `src/data.ts:39`:
  `page.locator('h3:has-text("Уголь марки Т (Тощий)")')`. Keep the
  `.not.toBeVisible()` expectation (coal is filtered out when the wood tab is
  active).
- Keep the tab click target `button:has-text("Колотые дрова")` unchanged
  (`Catalog.tsx:96` still renders that label).

**Verify**: `npx playwright test --project=chromium --grep "Фильтрация"` →
1 passed, 0 failed.

### Step 3: Fix the footer form test to use the real `<option>` text

In `tests/example.spec.ts`, inside the `Отправка формы обратной связи в подвале`
test:

- Change the `selectOption` (line ~49) to the exact option from
  `src/components/FeedbackSection.tsx:194`:
  `await page.locator('select').selectOption('Дрова: Берёза, Дуб, Акация')`.
- Leave the name/phone fill placeholders (`'Иван'`, `'+7 (___) ___-__-__'`)
  and the consent checkbox + submit-button-enabled assertion unchanged —
  those still match `FeedbackSection.tsx`.
- Do NOT click submit (the test comment already says it's optional, and the
  dev server has no Telegram creds → a real submit would 500). Keep the test
  as a "form is fillable and submittable" check, not a submit-and-assert.

**Verify**: `npx playwright test --project=chromium --grep "Отправка формы"` →
1 passed, 0 failed.

### Step 4: Add a one-command `npm test` gate

In `package.json`, add a `"test"` script to the `"scripts"` block (place it
after `"lint"`), so future plans can use `npm test` as a verification gate
instead of remembering the Playwright invocation:

```json
"test": "playwright test"
```

Do not change the existing scripts (`dev`, `build`, `preview`, `clean`, `lint`, `verify`).

**Verify**: `npm test -- --project=chromium` → all 4 tests pass. (Note:
`npm test` passes extra args after `--`; Playwright accepts `--project`.)

### Step 5: Run the full suite across all configured browsers

**Verify**: `npx playwright test` → all 4 tests pass in chromium, firefox,
AND webkit (12 worker-sessions total, 0 failed). If webkit/firefox fail for
an environment reason (e.g. browsers not installed in the worktree), run
`npx playwright install` first; if they still fail for a non-selector reason,
STOP and report — do not weaken the assertions to make them pass.

## Test plan

- The 4 existing tests, with corrected selectors, all pass — this IS the test
  plan (no new tests to write in this plan; broadening coverage is a separate
  future task).
- Structural pattern: keep the existing `test.describe` + `test.beforeEach`
  shape; only the assertion strings change.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npx playwright test` exits 0 (all 4 tests pass in all 3 browsers)
- [ ] `npm run lint` exits 0 (unchanged — no source files modified)
- [ ] `npm run build` exits 0 (unchanged — no source files modified)
- [ ] `git status` shows changes ONLY to `tests/example.spec.ts` and
      `package.json` (no other files modified)
- [ ] A `"test"` script exists in `package.json` and `npm test -- --project=chromium` passes
- [ ] `plans/README.md` status row for 008 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the locations in "Current state" doesn't match the excerpts
  (e.g. `data.ts` product names differ, or `FeedbackSection.tsx` option text
  differs) — the codebase has drifted since this plan was written.
- Step 1 shows a number of failures other than 2 (either the suite already
  got fixed, or a new breakage exists that this plan doesn't cover).
- A test passes only after weakening an assertion (e.g. removing the
  "coal not visible" check) rather than fixing the selector — that hides
  regressions instead of fixing the baseline.
- `npx playwright install` fails in the worktree and you cannot get any
  browser to launch.

## Maintenance notes

- Any future change to product names in `src/data.ts` or to the `<option>`
  list in `FeedbackSection.tsx` will re-break these tests. The maintainer
  should grep `tests/example.spec.ts` when touching catalog data. A future
  improvement (out of scope here): generate the E2E expectations from
  `PRODUCTS` at test-setup time so the suite can't drift.
- If CI (`.github/workflows/playwright.yml`) gets committed, this suite
  becomes the merge gate — keep it green.
- Do not add a submit-and-assert-success E2E until there is a test mode in
  `server.js` that doesn't require real Telegram credentials (a stub
  `/api/leads` in dev). That's a separate plan.
