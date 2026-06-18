# Plan 009: Define the missing custom Tailwind color tokens

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 69c19dc..HEAD -- src/index.css`
> If `src/index.css` changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S-M
- **Risk**: LOW-MED
- **Depends on**: none
- **Category**: correctness (silent render breakage) / tech-debt
- **Planned at**: commit `69c19dc`, 2026-06-17

## Why this matters

The UI uses Tailwind color utilities that Tailwind v4 does NOT generate,
because they are not in the default palette AND are not defined in the
project's `@theme`. Concretely: `slate-350`, `slate-450`, `slate-850`,
`slate-855`, `slate-405` are used ~40 times across ACTIVE code (borders, body
text, hover backgrounds), and `orange-550`, `sky-450`, `sky-550` are used in
the (currently dead) `slate-fire`/`cool-slate` theme branches. Tailwind v4
silently drops unknown utilities — no build error, no style emitted. The
build output confirmed it: **0 generated CSS rules** for any of these tokens.
The result is that borders render with fallback colors, intended text grays
inherit from parents, and hover states are missing — the design intent is
not what's actually rendered. Defining these tokens in `@theme` restores the
intent and is a prerequisite to trusting any visual work on top of it.

## Current state

### The repo

React 19 + Vite 6 + Tailwind v4 (via `@tailwindcss/vite`). All styling is
Tailwind utilities in className strings; the only custom CSS is
`src/index.css` (font `@font-face` blocks + a small `@theme` + scrollbar +
one keyframe). `@theme` is the Tailwind v4 extension point for custom design
tokens — anything you put there as `--color-<name>-<shade>` becomes usable as
`text-<name>-<shade>`, `bg-<name>-<shade>`, `border-<name>-<shade>`, etc.

### The broken `@theme`

`src/index.css:472-476` — the ENTIRE `@theme` block:

```css
@theme {
  --font-display: "Rubik", sans-serif;
  --font-sans: "Outfit", sans-serif;
  --font-serif: "Playfair Display", serif;
}
```

No `--color-*` tokens. So every non-default color utility is a no-op.

### The tokens that are used but undefined

Confirmed by grepping `src/` and by building and grepping the output CSS
(`dist/assets/index-*.css` → 0 rules for each):

| Token | Active usages | Where (examples) |
|---|---|---|
| `slate-855` | 14 | `Header.tsx:116` `border-slate-855`; `HowWeWork.tsx:65`; `SuccessState.tsx:199`; `FeedbackSection.tsx:257` |
| `slate-850` | 10 | `Header.tsx:195,230` `border-slate-850`/`hover:bg-slate-850`; `FeedbackSection.tsx` |
| `slate-450` | 10 | `Hero.tsx:150,183`; `HowWeWork.tsx:77`; `FeedbackSection.tsx:134` `text-slate-450` |
| `slate-350` | 5 | `Header.tsx:59` `text-slate-350`; `Hero.tsx:100,104,108` |
| `slate-405` | 1 | `SuccessState.tsx:169` `text-slate-405` |
| `orange-550` | 4 | default/slate-fire theme branches (currently dead — theme fixed to cozy-wood) |
| `sky-450` | 4 | cool-slate theme branches (dead) |
| `sky-550` | 2 | cool-slate theme branches (dead) |

Standard shades like `slate-900`, `slate-800`, `slate-500`, `slate-400`,
`slate-300`, `orange-500`, `amber-500`, `green-500`, `red-500`, `sky-500`
DO generate (they're in Tailwind's default palette) — do not touch those.

### The design intent (from the agreed mockup spec)

`docs/stitch_design_spec.md:25-30` defines the palette the tokens should map
to:

- Background graphite/anthracite: `#121214` (угольный черный), `#1a1a1e`
  (темно-серый для карточек).
- Accent fiery: `#f97316` (акцентный оранжевый), `#eab308` (желтый).
- Text: `#ffffff` (headings), `#9ca3af` / `#d1d5db` (body grays).

These hex values are the source of truth for the custom shades.

### Repo conventions

- One CSS file: `src/index.css`. The `@theme` block is the only place to
  add tokens. Do not create a second CSS file or a `tailwind.config` (the
  project uses Tailwind v4's CSS-first config — there is no JS config).
- Match the existing `@theme` formatting (2-space indent, `--token: value;`).

## Commands you will need

| Purpose | Command | Expected on success |
|-----------|--------------------------|---------------------|
| Build | `npm run build` | exit 0; `dist/assets/index-*.css` written |
| Typecheck | `npm run lint` | exit 0 (CSS change doesn't affect tsc, but confirm no regression) |
| E2E smoke | `npx playwright test --project=chromium` | all pass (visual change shouldn't break selectors) |

## Scope

**In scope**:
- `src/index.css` (extend the `@theme` block with `--color-*` tokens only)

**Out of scope** (do NOT touch):
- Any `.tsx` component file — do not rewrite the class strings. The point of
  this plan is to make the EXISTING classes render, not to migrate them.
  (Remapping tokens to standard shades would be a bigger, riskier refactor
  and is explicitly deferred.)
- The font `@font-face` blocks and the `--font-*` tokens — those are
  Plan 010's scope.
- The dead `slate-fire`/`cool-slate` theme tokens (`orange-550`, `sky-450`,
  `sky-550`): define them too (they're cheap, and they make the dead branches
  render correctly if the theme system is ever re-enabled), but do not
  otherwise touch the theme system.

## Git workflow

- Branch: `advisor/009-undefined-tailwind-color-tokens`
- Commit message style: `fix(css): define custom slate/orange/sky shades in @theme`

## Steps

### Step 1: Add the missing color tokens to `@theme`

In `src/index.css`, extend the existing `@theme` block (currently lines
472–476) to define the missing shades. Use the hex values from
`docs/stitch_design_spec.md`, interpolating the intermediate shades sensibly
between the nearest standard Tailwind slate steps (slate-800 = `#1f2937`,
slate-900 = `#111827`, slate-950 = `#020617` in the default palette; the
project's graphite is darker/warmer). Proposed values:

```css
@theme {
  --font-display: "Rubik", sans-serif;
  --font-sans: "Outfit", sans-serif;
  --font-serif: "Playfair Display", serif;

  /* Custom slate grays — graphite/anthracite per docs/stitch_design_spec.md */
  --color-slate-350: #94a3b8;   /* between slate-300 (#cbd5e1) and slate-400 (#94a3b8) */
  --color-slate-405: #8b98a8;   /* slightly lighter than slate-400 body text */
  --color-slate-450: #7b8794;   /* between slate-400 (#94a3b8) and slate-500 (#64748b) */
  --color-slate-850: #1a1a1e;   /* card graphite per design spec */
  --color-slate-855: #15151a;   /* slightly darker than slate-850, matches existing card bg literals */

  /* Fiery accent shades (slate-fire theme; currently fixed to cozy-wood but kept for completeness) */
  --color-orange-550: #f97316;  /* design spec accent orange */

  /* Cool-slate theme accent shades (currently dead, kept for completeness) */
  --color-sky-450: #38bdf8;     /* between sky-400 (#38bdf8) and sky-500 (#0ea5e9) */
  --color-sky-550: #0284c7;     /* between sky-500 (#0ea5e9) and sky-600 (#0284c7) */
}
```

Notes for the executor:
- `#94a3b8` IS Tailwind's default slate-400; using it for slate-350 makes
  slate-350 render as slate-400. That's acceptable (the intent was "a body
  gray lighter than slate-400") and avoids inventing an off-palette color.
  If you prefer a distinct value, use `#a8b3c1` (a manual interpolation).
  Either is fine — pick one and use it consistently.
- `#1a1a1e` and `#15151a` match the literal hex already used in component
  className strings (e.g. `bg-[#15151a]` in `Catalog.tsx:116`,
  `bg-[#1a1a1e]`-adjacent). Matching them keeps the token-based borders
  consistent with the literal backgrounds.
- Do NOT redefine any standard shade (slate-300/400/500/800/900/950,
  orange-500, sky-500, etc.) — that would change existing rendered styles.

**Verify**: `npm run build` → exit 0; the build succeeds and
`dist/assets/index-*.css` is regenerated.

### Step 2: Confirm the tokens now generate CSS rules

**Verify**: after the build, grep the output CSS for each token and confirm
non-zero hits. Run:

```
for tok in slate-350 slate-405 slate-450 slate-850 slate-855 orange-550 sky-450 sky-550; do
  printf '%s: ' "$tok"; grep -roE "\.text-$tok\b|\.bg-$tok\b|\.border-$tok\b|hover\\:bg-$tok|hover\\:border-$tok" dist/assets/*.css | wc -l
done
```

Expected: every token shows ≥1 hit (was 0 before). If any token still shows
0, that token's `--color-*` line is missing or mistyped in `@theme` — fix
and rebuild.

### Step 3: Visual smoke check

Run the dev server and load the page; confirm the borders/text that were
silently missing now render. You don't have a screenshot baseline, so check
the specific high-impact spots:

- `Header.tsx:116` mobile phone icon container `border-slate-855` → border
  now visible.
- `HowWeWork.tsx:65` step bubble `border-slate-855` → border now visible.
- `Header.tsx:59` desktop nav `text-slate-350` → nav link gray renders
  (was inheriting).
- `Hero.tsx:150` "Гарантия качества" `text-slate-450` → renders gray.

**Verify**: `npm run dev` starts; open http://localhost:3000; the header
nav links and the catalog card borders are visibly styled. Then `npm run
build` still exits 0.

### Step 4: Regression check

**Verify**: `npm run lint` exits 0 and `npx playwright test --project=chromium`
passes all 4 tests (Plan 008 must be landed first for this to be meaningful;
if 008 is not yet done, run `npx playwright test --project=chromium` anyway
and confirm you introduced no NEW failures beyond the pre-existing stale-selector
ones).

## Test plan

- No new automated tests (this is a CSS-token change; the E2E suite is the
  regression gate and should stay green / not regress further).
- The grep check in Step 2 is the machine-checkable proof that the tokens
  now generate rules.

## Done criteria

ALL must hold:

- [ ] `npm run build` exits 0
- [ ] The Step 2 grep shows ≥1 generated rule for each of: `slate-350`,
      `slate-405`, `slate-450`, `slate-850`, `slate-855`, `orange-550`,
      `sky-450`, `sky-550` (was 0 for all before)
- [ ] `npm run lint` exits 0
- [ ] `npx playwright test --project=chromium` has no NEW failures vs. the
      pre-plan baseline (ideally all pass if 008 landed first)
- [ ] `git status` shows changes ONLY to `src/index.css`
- [ ] No standard Tailwind shade was redefined
- [ ] `plans/README.md` status row for 009 updated

## STOP conditions

- The `@theme` block at `src/index.css:472` doesn't match the excerpt
  (different font tokens, or someone already added color tokens) — reconcile
  before proceeding.
- A token you add causes a build error (Tailwind v4 rejecting a `--color-*`
  value). Most likely cause: a typo in the custom-property name. Fix and
  rebuild; do not remove the token.
- You discover one of the "active" tokens (e.g. `slate-855`) is actually
  only used in dead code (re-verify with `grep -rn slate-855 src`); if so,
  still define it (cheap, future-proof) but note it in your report.
- Do NOT remap class strings in `.tsx` files to standard shades — that is
  out of scope and would balloon this plan.

## Maintenance notes

- The custom shades now live in `@theme`; future components can use them
  freely. If the design system is ever formalized (a `DESIGN.md`), these
  tokens should be documented there with their hex values and intent.
- If the maintainer later decides to REMOVE the dead 3-way theme system
  (slate-fire/cool-slate branches), the `orange-550`/`sky-450`/`sky-550`
  tokens can be removed at the same time. Today they're kept so the dead
  branches don't silently break further.
- The literal hex values in className strings (e.g. `bg-[#15151a]`,
  `bg-[#0a0a0c]`) are NOT affected by this plan and remain as-is; a future
  cleanup could migrate them to the new tokens for consistency.
