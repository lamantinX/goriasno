# Plan 014: Remove dead code left by the plan-006 cleanup (and two trivial fix-ups)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 69c19dc..HEAD -- src/App.tsx src/types.ts src/data.ts src/components/Hero.tsx src/components/Modal.tsx src/components/FeedbackSection.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. NOTE: Plans 012 (FeedbackSection
> map image) and 013 (Hero scroll target) also edit two of these files —
> this plan assumes both are DONE. If they aren't, STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: Plan 012 (FeedbackSection.tsx stable), Plan 013 (Hero.tsx stable). Edits `Hero.tsx` and `FeedbackSection.tsx` for minor fix-ups, so must land after those.
- **Category**: tech-debt
- **Planned at**: commit `69c19dc`, 2026-06-17

## Why this matters

Plan 006 removed the `DesignReviewToolbar` and the calculator but left
behind ~50 lines of now-dead scaffolding: an unused `DELIVERY_AREAS` import
in Hero, the entire `INITIAL_DESIGN_NOTES` array + `DesignNote` type (nothing
imports them), the `MockupConfig.showGuides`/`placedNotesEnabled` fields
(always `false`), the `getGuidesClass()` helper, and six
`{config.showGuides && (<div>…label…</div>)}` annotation blocks in App that
can never render. This dead code obscures the live structure of the two
most-edited files (`App.tsx`, `types.ts`) and confuses future agents. This
plan also fixes two trivial drive-by issues found in the same files: an
invalid SPDX license identifier (`Apache-2.5`) in `App.tsx` and the
deprecated `String.prototype.substr` in the two form components.

## Current state

### The repo

React 19 + TS + Tailwind v4 SPA. `npm run lint` = `tsc --noEmit` with a
**lax tsconfig** (no `strict`, no `noUnusedLocals`) — so dead imports/exports
and unused fields pass silently today. (Plan 017 tightens this; this plan
removes the dead code first so 017 doesn't surface a pile of unused-symbol
errors.)

### Dead code (evidence)

`src/components/Hero.tsx:8`:
```ts
import { DELIVERY_AREAS } from "../data";
```
`DELIVERY_AREAS` is never referenced in `Hero.tsx` (grep-confirmed). It IS
exported from `src/data.ts:126` — keep the export (it's business data:
delivery zones + base rates; direction D3 may use it later). Only the
unused import is removed.

`src/data.ts:6` and `src/data.ts:105-124`:
```ts
import { Product, DesignNote } from "./types";
...
export const INITIAL_DESIGN_NOTES: DesignNote[] = [ ... ];
```
`INITIAL_DESIGN_NOTES` and the `DesignNote` type are not imported by any
component (the DesignReviewToolbar that used them was deleted in plan 006).
Remove both.

`src/types.ts:37-46`:
```ts
export interface DesignNote {
  id: string; author: string; text: string;
  xPercent: number; yPercent: number;
  sectionId?: string; timestamp: string; isResolved: boolean;
}
```
Remove entirely (nothing uses it).

`src/types.ts:48-53`:
```ts
export interface MockupConfig {
  theme: "slate-fire" | "cool-slate" | "cozy-wood";
  showGuides: boolean; // Highlights margins and grid layouts to show spacing
  mockupStage: "landing" | "success";
  placedNotesEnabled: boolean; // Enables client pinning feedback comments
}
```
Remove `showGuides` and `placedNotesEnabled` (and their comments). Keep
`theme` and `mockupStage`.

`src/App.tsx:36-41` (config state):
```ts
const [config, setConfig] = useState<MockupConfig>({
  theme: "cozy-wood",
  showGuides: false,
  mockupStage: "landing",
  placedNotesEnabled: false,
});
```
Drop `showGuides` and `placedNotesEnabled`.

`src/App.tsx:117-121` (`getGuidesClass`):
```ts
const getGuidesClass = () => {
  return config.showGuides 
    ? "border border-dashed border-rose-500/50 bg-rose-500/[0.015] relative p-1 transition-all" 
    : "transition-all";
};
```
Remove the function. The six wrapper `<div className={getGuidesClass()}>`
blocks (App.tsx ~137, 152, 162, 173, 181, 193) become `<div className="transition-all">`,
and each wrapper's `{config.showGuides && (<div className="absolute ...">…label…</div>)}` annotation block is removed.

### Trivial fix-ups (evidence)

`src/App.tsx:3`:
```
* SPDX-License-Identifier: Apache-2.5
```
`Apache-2.5` is not a valid SPDX identifier (every other file uses `Apache-2.0`). Fix to `Apache-2.0`.

`src/components/Modal.tsx:75` and `src/components/FeedbackSection.tsx:80`:
```ts
id: "sub-" + Math.random().toString(36).substr(2, 9),
```
`substr` is deprecated. Replace with `.slice(2, 11)` (same result: 9 chars starting at index 2).

### Repo conventions

- Keep the active 3-way `theme` system (`getTheme*Class()` in components) —
  it is by-design per plan 006 ("cozy-wood как единственная" but the
  branching was deliberately kept). Do NOT remove the theme branches.
- `App.tsx` uses `useState<MockupConfig>` for `config` and passes
  `config.theme`/`config.mockupStage` to children — preserve that.
- Excerpts: `Header.tsx:35-41` `scrollToSection` is the exemplar for "no
  dead code" style; match the clean conditional style.

## Commands you will need

| Purpose | Command | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `npm run lint` | exit 0 |
| Build | `npm run build` | exit 0 |
| E2E smoke | `npx playwright test --project=chromium` | all pass |
| Dead-symbol grep | see Step 5 | 0 matches for each removed symbol |

## Scope

**In scope**:
- `src/App.tsx` (remove `getGuidesClass` + 6 guide-label blocks + simplify 6 wrapper classNames + simplify config state + fix SPDX header)
- `src/types.ts` (remove `DesignNote` interface; remove `showGuides`/`placedNotesEnabled` from `MockupConfig`)
- `src/data.ts` (remove `DesignNote` from the import; remove `INITIAL_DESIGN_NOTES`)
- `src/components/Hero.tsx` (remove the unused `DELIVERY_AREAS` import)
- `src/components/Modal.tsx` (`.substr(2, 9)` → `.slice(2, 11)`)
- `src/components/FeedbackSection.tsx` (`.substr(2, 9)` → `.slice(2, 11)`)

**Out of scope** (do NOT touch):
- `DELIVERY_AREAS` export in `data.ts` — KEEP it (business data, may be productized by direction D3).
- The 3-way `theme` system and every `getTheme*Class()` function in the components — by-design per plan 006.
- Any `localStorage` logic, the `submissions` state, or the form submission flow.
- Do not remove the wrapper `<div>`s around each section in App — only their className and the guide-label children change.

## Git workflow

- Branch: `advisor/014-dead-code-cleanup`
- Commit message style: `chore: remove dead design-review scaffolding + fix SPDX header and deprecated substr`

## Steps

### Step 1: Fix the SPDX header in App.tsx

`src/App.tsx:3`: change `SPDX-License-Identifier: Apache-2.5` to `SPDX-License-Identifier: Apache-2.0`.

**Verify**: `grep -n "Apache-2.5" src/App.tsx` → no matches.

### Step 2: Remove `DesignNote` and `INITIAL_DESIGN_NOTES`

- `src/types.ts`: delete the entire `DesignNote` interface (lines ~37-46).
- `src/data.ts:6`: change `import { Product, DesignNote } from "./types";` to `import { Product } from "./types";`.
- `src/data.ts`: delete the entire `INITIAL_DESIGN_NOTES` export (lines ~105-124), including the trailing blank line before `DELIVERY_AREAS`.

**Verify**: `npm run lint` exits 0. `grep -rn "DesignNote\|INITIAL_DESIGN_NOTES" src` → no matches.

### Step 3: Remove `MockupConfig.showGuides`/`placedNotesEnabled`

`src/types.ts`: reduce `MockupConfig` to:
```ts
export interface MockupConfig {
  theme: "slate-fire" | "cool-slate" | "cozy-wood";
  mockupStage: "landing" | "success";
}
```

`src/App.tsx:36-41`: reduce the config state to:
```ts
const [config, setConfig] = useState<MockupConfig>({
  theme: "cozy-wood",
  mockupStage: "landing",
});
```

**Verify**: `npm run lint` exits 0. `grep -n "showGuides\|placedNotesEnabled" src` → no matches.

### Step 4: Remove `getGuidesClass` and the six guide-label annotation blocks in App.tsx

- Delete the `getGuidesClass` function (App.tsx ~117-121).
- For each of the six section wrappers (Header ~137, Hero ~152, Catalog ~162, HowWeWork ~173, FeedbackSection ~181, SuccessState ~193):
  - Change the wrapper `<div className={getGuidesClass()}>` to `<div className="transition-all">`.
  - Delete the immediately-following `{config.showGuides && (<div className="absolute top-... ">…label…</div>)}` block inside that wrapper.

Example transformation for the Header wrapper (apply the same shape to all six):

Before:
```tsx
<div className={getGuidesClass()}>
  {config.showGuides && (
    <div className="absolute top-1 left-2 bg-rose-500 text-white text-[9px] px-1 rounded z-20 font-bold uppercase tracking-wider">Шапка (NavBar) Container</div>
  )}
  <Header ... />
</div>
```

After:
```tsx
<div className="transition-all">
  <Header ... />
</div>
```

**Verify**: `npm run lint` exits 0. `grep -n "getGuidesClass\|config.showGuides" src/App.tsx` → no matches. The file should be visibly shorter (~50 lines removed).

### Step 5: Remove the unused `DELIVERY_AREAS` import in Hero.tsx

`src/components/Hero.tsx:8`: delete the line `import { DELIVERY_AREAS } from "../data";`.

Do NOT touch the `DELIVERY_AREAS` export in `data.ts` (kept as business data).

**Verify**: `npm run lint` exits 0. `grep -n "DELIVERY_AREAS" src/components/Hero.tsx` → no matches. `grep -n "DELIVERY_AREAS" src/data.ts` → still 1 match (the export, preserved).

### Step 6: Replace deprecated `substr` in the two form components

- `src/components/Modal.tsx:75`: `Math.random().toString(36).substr(2, 9)` → `Math.random().toString(36).slice(2, 11)`.
- `src/components/FeedbackSection.tsx:80`: same change (`substr(2, 9)` → `slice(2, 11)`).

**Verify**: `grep -rn "\.substr(" src` → no matches. `npm run lint` exits 0.

### Step 7: Regression gate

**Verify**:
- `npm run build` exits 0
- `npm run lint` exits 0
- `npx playwright test --project=chromium` → all 4 tests pass (no DOM structure change that tests assert on; the wrapper `<div>`s remain, only their className + removed annotation children change)
- `grep -rn "showGuides\|placedNotesEnabled\|getGuidesClass\|INITIAL_DESIGN_NOTES\|DesignNote\|Apache-2.5\|\.substr(" src` → no matches

## Test plan

- No new tests. The dead-symbol grep in Step 7 is the machine-checkable proof of removal. The existing E2E is the regression gate (the wrapper divs remain, so DOM structure tests pass).

## Done criteria

ALL must hold:

- [ ] `grep -rn "showGuides\|placedNotesEnabled\|getGuidesClass\|INITIAL_DESIGN_NOTES\|DesignNote\|Apache-2.5\|\.substr(" src` returns no matches
- [ ] `grep -n "DELIVERY_AREAS" src/data.ts` returns 1 match (export preserved); `grep -n "DELIVERY_AREAS" src/components/Hero.tsx` returns no matches (import removed)
- [ ] `MockupConfig` in `src/types.ts` has only `theme` and `mockupStage` fields
- [ ] `src/App.tsx` has no `{config.showGuides && …}` blocks and no `getGuidesClass` function; the six section wrappers use `className="transition-all"`
- [ ] `npm run build` exits 0; `npm run lint` exits 0
- [ ] `npx playwright test --project=chromium` passes all 4
- [ ] `git status` shows changes only to in-scope files
- [ ] `plans/README.md` status row for 014 updated

## STOP conditions

- `src/App.tsx` / `src/types.ts` / `src/data.ts` don't match the excerpts (someone changed the config shape or re-added a guide toggle since this plan was written).
- Removing `INITIAL_DESIGN_NOTES`/`DesignNote` causes a compile error referencing them — that means something DOES still import them (re-verify with `grep -rn "DesignNote\|INITIAL_DESIGN_NOTES" src`); if a real consumer exists, STOP and report (do not delete a used type).
- A Playwright test fails after Step 4 — likely you accidentally removed a wrapper `<div>` instead of just its annotation child. Restore the wrapper and only remove the `{config.showGuides && …}` block.
- Do NOT remove the `theme` field, the `getTheme*Class()` functions, or any theme branch — those are by-design (plan 006).
- Do NOT remove the `DELIVERY_AREAS` export from `data.ts` — only the unused import in Hero.

## Maintenance notes

- After this plan, `App.tsx` is ~50 lines shorter and the `config` object is just `{ theme, mockupStage }`. Future changes to `config` should keep it minimal.
- The `DELIVERY_AREAS` data is intentionally kept in `data.ts`. If direction D3 (delivery-zone rate display) is ever planned, it consumes that export; do not delete it as "unused" in a future cleanup without confirming D3 is rejected.
- Plan 017 (strict typecheck + `noUnusedLocals`) will now find a clean codebase — this plan is a prerequisite for 017 landing without a large error-fix burden.
- If the design-review toolbar / guide overlays are ever needed again (e.g. for a redesign), re-introduce them as a proper feature, not by reverting this plan — the old scaffolding was never wired to a toggle in the UI anyway.
