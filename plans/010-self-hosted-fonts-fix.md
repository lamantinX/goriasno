# Plan 010: Fix self-hosted fonts (Cyrillic body, real bold headings, drop unused Playfair)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 69c19dc..HEAD -- src/index.css src/main.tsx public/sw.js package.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: Plan 009 (so the `@theme` block is the settled version before fonts are reworked) — coordinate if both touch `src/index.css`; this plan edits the `@font-face` area and `@theme`'s `--font-*` tokens, Plan 009 edits only the `--color-*` tokens, so they don't overlap.
- **Category**: perf / correctness (visual)
- **Planned at**: commit `69c19dc`, 2026-06-17

## Why this matters

The self-hosted font setup is broken for a Russian site in three ways. (1)
**Outfit** is the `font-sans` body font (51 usages) but its `@font-face`
blocks declare only Latin/Latin-ext unicode-ranges — **no Cyrillic** — so
every Russian body-text node falls back to the system sans-serif, and the
10 Outfit woff2 files are wasted payload. (2) **Rubik** is the `font-display`
heading font (91 usages, always with `font-bold`/`font-extrabold`/`font-black`)
but only weight-400 woff2 files are shipped — every bold/black heading is
**faux-bold** (browser-synthesized from 400). (3) **Playfair Display**
(`font-serif`) is used 0 times in any component, yet ships 12 woff2 files
(~23% of the 52-file Service Worker precache). The stated #1 project goal
(`plans/README.md:26-30`) is ultra-optimization for slow RF 3G with
self-hosted fonts and no external CDNs — this plan makes that real.

The fix adopts `@fontsource` packages: npm-installable, self-hosted woff2
bundled by Vite from `node_modules` (same-origin, no CDN, hashed cache-busted
filenames in `dist/assets`), with per-weight/per-subset imports so we ship
only what's used.

## Current state

### The repo

React 19 + Vite 6 + Tailwind v4. Fonts are currently hand-rolled: 52
`@font-face` blocks in `src/index.css` (lines 1–468) referencing 52 woff2 in
`public/fonts/`. `src/main.tsx:4` imports `./index.css`. The Service Worker
`public/sw.js` precaches all 52 font files by static URL (`/fonts/*.woff2`).
The `@theme` block (`src/index.css:472-476`) maps `--font-display: "Rubik"`,
`--font-sans: "Outfit"`, `--font-serif: "Playfair Display"`.

### The three problems (evidence)

- Outfit `@font-face`: `src/index.css:1-90` — only `/* latin-ext */` and
  `/* latin */` blocks. No cyrillic. And every weight (400/500/600/700) points
  at `Outfit-300-normal-N.woff2` (the `-300-` is a numbering artifact; only
  weight-300 glyphs actually exist). `public/fonts/` contains only
  `Outfit-300-normal-1..10.woff2`.
- Rubik `@font-face`: `src/index.css:263-278` has cyrillic (good) but only
  weight 400. `public/fonts/` has only `Rubik-400-normal-*.woff2` and
  `Rubik-400-italic-*.woff2`. No 500/600/700/800/900.
- Playfair: `src/index.css:91-198` defines 12 `@font-face` blocks;
  `public/fonts/PlayfairDisplay-*.woff2` (12 files). `font-serif` is used
  **0 times** in `src/components/*` (grep-confirmed: `font-display` 91,
  `font-sans` 51, `font-serif` 0).

### Font-weight usage (grep `src/`)

`font-display` (Rubik) is paired with `font-medium` (500), `font-bold` (700),
`font-extrabold` (800), `font-black` (900). `font-sans` (Outfit) is mostly
weight 400, occasionally `font-medium`/`font-semibold`/`font-bold`. So we
need: Rubik cyrillic 400/500/700/800/900; Outfit cyrillic 400/500/600/700.

### Repo conventions

- One CSS entry: `src/index.css`. JS-imported CSS (`import "…css"` in
  `main.tsx`) is supported by Vite and is the robust way to load @fontsource
  (avoids CSS `@import` ordering pitfalls vs `@import "tailwindcss"`).
- Russian UI; the cyrillic subset is mandatory, latin is needed for digits,
  `#`, `₽`-adjacent glyphs. cyrillic-ext is NOT needed for Russian.
- Match the existing `@theme` formatting.

## Commands you will need

| Purpose | Command | Expected on success |
|-----------|--------------------------|---------------------|
| Install deps (incl. new font packages) | `npm install` | exit 0 |
| Build | `npm run build` | exit 0; `dist/assets/*.woff2` present (hashed) |
| Typecheck | `npm run lint` | exit 0 |
| E2E smoke | `npx playwright test --project=chromium` | all pass |
| SW syntax check | `node --check public/sw.js` | exit 0 |

## Scope

**In scope**:
- `package.json` (add `@fontsource/outfit` and `@fontsource/rubik` to dependencies)
- `src/main.tsx` (add @fontsource CSS imports)
- `src/index.css` (delete all `@font-face` blocks; remove `--font-serif` from `@theme`; keep `--font-display`, `--font-sans`, the `@import "tailwindcss"`, scrollbar, keyframes)
- `public/fonts/*.woff2` (delete all 52 files)
- `public/sw.js` (PRUNE the `ASSETS` array to `['/', '/index.html']` only — remove every `/fonts/*.woff2` entry — so the SW still installs after the font files are gone; Plan 011 does the full SW overhaul)

**Out of scope** (do NOT touch):
- Any `.tsx` component — do not change `font-display`/`font-sans`/`font-serif` class strings. (`font-serif` will become a dead utility after removing `--font-serif`; a future cleanup can remove those 0 usages — there are none today.)
- The Tailwind `@theme` `--color-*` tokens (Plan 009's scope).
- A full Service Worker rewrite (Plan 011's scope) — here only prune the font URLs from `ASSETS`.

## Git workflow

- Branch: `advisor/010-self-hosted-fonts-fix`
- Commit message style: `perf(fonts): self-host Cyrillic Outfit + bold Rubik via @fontsource, drop unused Playfair`

## Steps

### Step 1: Install the @fontsource packages

**Run**: `npm install @fontsource/outfit @fontsource/rubik`

**Verify**: `npm install` exits 0; `node -e "require.resolve('@fontsource/outfit/cyrillic-400.css'); require.resolve('@fontsource/rubik/cyrillic-700.css')"` exits 0 (proves the per-subset files exist). If either path does not resolve, STOP — see STOP conditions.

### Step 2: Import the needed font CSS from `src/main.tsx`

In `src/main.tsx`, after the existing `import './index.css';` (line 4), add
imports for each weight/subset. Use this exact set (cyrillic + latin for
each weight; cyrillic is the primary, latin covers digits/punctuation):

```ts
// Outfit = font-sans (body). Weights actually used: 400, 500, 600, 700.
import '@fontsource/outfit/cyrillic-400.css';
import '@fontsource/outfit/latin-400.css';
import '@fontsource/outfit/cyrillic-500.css';
import '@fontsource/outfit/latin-500.css';
import '@fontsource/outfit/cyrillic-600.css';
import '@fontsource/outfit/latin-600.css';
import '@fontsource/outfit/cyrillic-700.css';
import '@fontsource/outfit/latin-700.css';

// Rubik = font-display (headings). Weights actually used: 400, 500, 700, 800, 900.
import '@fontsource/rubik/cyrillic-400.css';
import '@fontsource/rubik/latin-400.css';
import '@fontsource/rubik/cyrillic-500.css';
import '@fontsource/rubik/latin-500.css';
import '@fontsource/rubik/cyrillic-700.css';
import '@fontsource/rubik/latin-700.css';
import '@fontsource/rubik/cyrillic-800.css';
import '@fontsource/rubik/latin-800.css';
import '@fontsource/rubik/cyrillic-900.css';
import '@fontsource/rubik/latin-900.css';
```

Do not import italic, cyrillic-ext, greek, vietnamese, or latin-ext subsets (not needed for Russian; keeps the bundle small for 3G).

**Verify**: `npm run build` exits 0; `dist/assets/` contains woff2 files (hashed names) — confirm with `ls dist/assets/*.woff2 | head` (should list several). If the build errors on an import path, that subset file doesn't exist — see STOP conditions.

### Step 3: Remove the hand-rolled `@font-face` blocks and the `--font-serif` token

In `src/index.css`:

- DELETE every `@font-face { ... }` block (the entire run from line 1 through line 468 — all 52 Outfit/Playfair/Rubik `@font-face` declarations). @fontsource now provides these.
- In the `@theme` block (was lines 472–476), REMOVE the `--font-serif: "Playfair Display", serif;` line. Keep `--font-display: "Rubik", sans-serif;` and `--font-sans: "Outfit", sans-serif;`.
- Keep `@import "tailwindcss";`, the `::-webkit-scrollbar*` rules, and the `@keyframes pulse-glow` / `.animate-pulse-glow` rule unchanged.

The resulting top of `index.css` should be:

```css
@import "tailwindcss";

@theme {
  --font-display: "Rubik", sans-serif;
  --font-sans: "Outfit", sans-serif;
}

/* Custom glow and scrollbar utilities */
::-webkit-scrollbar { ... }   /* unchanged */
...
```

**Verify**: `npm run build` exits 0; `npm run lint` exits 0.

### Step 4: Delete the old static font files

Delete all woff2 from `public/fonts/` (all 52 files: `Outfit-300-normal-*.woff2`, `PlayfairDisplay-*.woff2`, `Rubik-400-*.woff2`). The directory becomes empty (git stops tracking it).

**Verify**: `git status` shows the 52 deletions under `public/fonts/`; `Test-Path public/fonts` (PowerShell) / `ls public/fonts` returns empty or "No such file". `npm run build` still exits 0 (fonts now come from @fontsource in `dist/assets`).

### Step 5: Prune the Service Worker precache so it still installs

`public/sw.js:2-57` lists 54 `ASSETS` entries, 52 of which are `/fonts/*.woff2` that no longer exist. `cache.addAll` is all-or-nothing, so even ONE 404 aborts SW install. Replace the `ASSETS` array with just the app shell:

```js
const ASSETS = [
  '/',
  '/index.html',
];
```

Leave the rest of `public/sw.js` (install/fetch handlers) unchanged — Plan 011 does the full SW overhaul. This step only prevents SW install breakage from the deleted fonts.

**Verify**: `node --check public/sw.js` exits 0 (syntax OK). `npm run build` exits 0.

### Step 6: Visual smoke check

**Verify**: `npm run dev` → open http://localhost:3000 → confirm:
- Body text (e.g. Hero paragraph, Catalog descriptions) renders in Outfit (not system sans) for Russian text. (You can verify in DevTools → Computed Fonts on a Russian paragraph: should list "Outfit".)
- A `font-black` heading (e.g. Hero `<h1>`, Header `#ГориЯсно#`) renders in real Rubik bold, not faux-bold. (DevTools → Computed Fonts: should list "Rubik"; the glyphs look heavier/crisper than before.)
- No Playfair anywhere (it was unused, so nothing should change visually from its removal).

Then `npx playwright test --project=chromium` → all 4 tests still pass (no selector changes).

## Test plan

- No new automated tests (font loading is a visual/build concern). The regression gate is the existing E2E suite staying green and the build emitting woff2 into `dist/assets`.
- Manual DevTools font check in Step 6 is the proof that cyrillic + real bold now render.

## Done criteria

ALL must hold:

- [ ] `npm install` exits 0 and `@fontsource/outfit`, `@fontsource/rubik` are in `package.json` dependencies
- [ ] `npm run build` exits 0 and `dist/assets/*.woff2` exist (hashed @fontsource outputs)
- [ ] `npm run lint` exits 0
- [ ] `src/index.css` contains NO `@font-face` blocks and `@theme` has NO `--font-serif` token (only `--font-display`, `--font-sans`)
- [ ] `public/fonts/` is empty / gone (52 files deleted)
- [ ] `public/sw.js` `ASSETS` is `['/', '/index.html']` (no `/fonts/*` entries); `node --check public/sw.js` exits 0
- [ ] `npx playwright test --project=chromium` passes all 4
- [ ] `git status` shows changes only to in-scope files
- [ ] `plans/README.md` status row for 010 updated

## STOP conditions

- `require.resolve('@fontsource/outfit/cyrillic-400.css')` fails — the installed @fontsource/outfit version does not ship a cyrillic subset. Fallback (requires reviewer approval): set `--font-sans: "Rubik", sans-serif;` (single-font system using Rubik, which has cyrillic) and import only Rubik weights. Do NOT proceed without approval — this changes the design.
- A `@fontsource/<pkg>/<subset>-<weight>.css` import path errors at build time — that subset/weight combo doesn't exist. Drop that one import and rebuild; if a *needed* weight (e.g. Rubik 900) is missing, STOP and report (faux-bold for that weight is the fallback, but the reviewer should decide).
- The `@theme` block or `@font-face` region in `src/index.css` doesn't match the excerpts (someone changed the font setup since this plan was written).
- `npm run build` fails after Step 3 with a CSS error mentioning `@import` order — move the `@import "tailwindcss";` to be the very first line of `index.css` (it already should be after deleting @font-face) and rebuild; if it still fails, STOP.
- Do NOT touch `src/components/*.tsx` to change font class strings — that is out of scope.

## Maintenance notes

- Fonts now ship as hashed `dist/assets/*.woff2` via @fontsource. The Service Worker (after Plan 011) should runtime-cache these via the fetch handler (cache-first for same-origin `*/assets/*` GETs) rather than precache them by URL — hashed filenames are cache-busting by nature.
- To change which weights/subsets are shipped, edit the imports in `src/main.tsx`. Removing an import removes that woff2 from the bundle. Keep cyrillic for any font used on Russian text.
- `--font-serif` / Playfair is gone. If a serif font is ever needed, add a @fontsource package and a `--font-serif` token back; do not restore the old `public/fonts/PlayfairDisplay-*.woff2`.
- The `public/fonts/` directory is intentionally empty after this plan; do not recreate it.
- If the maintainer later adopts `vite-plugin-pwa` (direction D1), the @fontsource hashed assets are handled automatically by Workbox's asset precaching — this plan is compatible with that.
