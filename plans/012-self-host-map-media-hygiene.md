# Plan 012: Self-host the map placeholder image + media/iframe hygiene

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 69c19dc..HEAD -- src/components/FeedbackSection.tsx src/components/SuccessState.tsx public/images`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf / a11y / correctness (RF-reliability)
- **Planned at**: commit `69c19dc`, 2026-06-17

## Why this matters

The map placeholder in two places loads an image from `images.unsplash.com`
— an external CDN that is slow or blocked in RF (the project's explicit
audience, per `plans/README.md:26-28` which mandates "отказ от внешних
CDNs"). When it fails, the map card shows a broken/empty background. The
Yandex map `<iframe>` has no `title` (screen-reader gap), no
`loading="lazy"` (the iframe + its JS bundle loads eagerly even before the
user clicks "показать карту"), and uses the deprecated `frameBorder` prop.
This plan self-hosts a tiny on-brand SVG placeholder (no network, no
licensing concern, works offline once the SW caches it) and fixes the iframe
hygiene. It directly serves the stated RF-3G-reliability goal.

## Current state

### The repo

Product images are already self-hosted under `public/images/products/*.jpg`
and referenced as `/images/products/<file>.jpg` with `loading="lazy"` (see
`src/components/Catalog.tsx:138-144` as the exemplar pattern). The map
placeholder should follow the same convention under `public/images/`.

### The external Unsplash dependency (evidence)

`src/components/FeedbackSection.tsx:315-319` — the map placeholder backing
image:

```tsx
<img 
  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800" 
  alt="Карта проезда к складу"
  className="w-full h-full object-cover grayscale opacity-30 contrast-125 select-none"
/>
```

`src/components/SuccessState.tsx:236-240` — the success-page map box backing
image:

```tsx
<img 
  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600" 
  alt="Donetsk Map Direction"
  className="w-full h-full object-cover grayscale opacity-30 contrast-125 select-none"
/>
```

Both load from `images.unsplash.com` with no `loading="lazy"`.

### The Yandex iframe (evidence)

`src/components/FeedbackSection.tsx:304-310`:

```tsx
<iframe 
  src="https://yandex.ru/map-widget/v1/?ll=37.80285%2C48.015884&z=16&text=Донецк%20Углегорская%201" 
  width="100%" 
  height="100%" 
  frameBorder="0" 
  className="rounded-2xl absolute inset-0 z-20"
></iframe>
```

No `title` (a11y — screen readers announce "iframe" with no label), no
`loading="lazy"` (the heavy Yandex widget loads eagerly even though it only
shows after the user clicks the placeholder overlay), and `frameBorder` is a
deprecated React prop (use `style`/CSS border or omit).

### Repo conventions

- Self-hosted images live in `public/images/` and are referenced by absolute
  path `/images/...`. Match `Catalog.tsx`'s `loading="lazy"` + `decoding="async"` pattern.
- Inline SVG is fine in `public/` (served as-is). Keep the SVG small and
  on-brand (dark `#0d0d10` background, faint slate grid, orange route/pin —
  matches the existing `bg-[#0d0d10]` placeholder and orange accent).

## Commands you will need

| Purpose | Command | Expected on success |
|-----------|--------------------------|---------------------|
| Build | `npm run build` | exit 0; `dist/images/map-placeholder.svg` present |
| Typecheck | `npm run lint` | exit 0 |
| E2E smoke | `npx playwright test --project=chromium` | all pass |

## Scope

**In scope**:
- `public/images/map-placeholder.svg` (create — a small on-brand SVG)
- `src/components/FeedbackSection.tsx` (swap the Unsplash `src` → `/images/map-placeholder.svg`, add `loading="lazy"` + `decoding="async"`; fix the iframe: add `title`, add `loading="lazy"`, remove `frameBorder`)
- `src/components/SuccessState.tsx` (swap the Unsplash `src` → `/images/map-placeholder.svg`, add `loading="lazy"` + `decoding="async"`)

**Out of scope** (do NOT touch):
- The Yandex map `src` URL itself (coordinates/address are correct).
- The click-to-load-map interaction logic (`loadMap` state in FeedbackSection) — it works; only the placeholder backing image and the iframe attributes change.
- Any other component, the catalog product images, or the Service Worker.

## Git workflow

- Branch: `advisor/012-self-host-map-media-hygiene`
- Commit message style: `perf(media): self-host map placeholder, add iframe title + lazy loading`

## Steps

### Step 1: Create the self-hosted SVG map placeholder

Create `public/images/map-placeholder.svg` with this content (a dark
map-like grid with a faint route line and an orange pin — on-brand, ~1KB,
scales to any size via `object-cover`):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Схема проезда к складу">
  <rect width="800" height="600" fill="#0d0d10"/>
  <g stroke="#1f2937" stroke-width="2" opacity="0.6">
    <path d="M0 120 H800 M0 300 H800 M0 480 H800 M120 0 V600 M320 0 V600 M520 0 V600 M680 0 V600"/>
  </g>
  <g stroke="#374151" stroke-width="6" opacity="0.5" fill="none">
    <path d="M40 540 Q200 460 320 360 T620 180 L760 80"/>
  </g>
  <g>
    <circle cx="620" cy="180" r="14" fill="#f97316" opacity="0.25"/>
    <circle cx="620" cy="180" r="7" fill="#f97316"/>
    <path d="M620 187 l0 28" stroke="#f97316" stroke-width="3"/>
  </g>
</svg>
```

**Verify**: `Test-Path public/images/map-placeholder.svg` (PowerShell) / `ls public/images/map-placeholder.svg` → exists, non-empty. `npm run build` → `dist/images/map-placeholder.svg` present.

### Step 2: Swap the FeedbackSection placeholder image

In `src/components/FeedbackSection.tsx` (the `loadMap === false` branch, ~line 315), replace the `<img>`:

```tsx
<img 
  src="/images/map-placeholder.svg" 
  alt="Карта проезда к складу"
  loading="lazy"
  decoding="async"
  className="w-full h-full object-cover grayscale opacity-30 contrast-125 select-none"
/>
```

Keep the existing `className` (grayscale/opacity/contrast) — the SVG is already dark/on-brand; the className keeps it visually consistent with the prior look.

### Step 3: Fix the Yandex iframe in FeedbackSection

In `src/components/FeedbackSection.tsx` (~line 304), update the `<iframe>`:

```tsx
<iframe 
  src="https://yandex.ru/map-widget/v1/?ll=37.80285%2C48.015884&z=16&text=Донецк%20Углегорская%201" 
  title="Интерактивная карта проезда к складу ГориЯсно на ул. Углегорская, 1"
  loading="lazy"
  width="100%" 
  height="100%" 
  className="rounded-2xl absolute inset-0 z-20"
></iframe>
```

Changes: added `title`, added `loading="lazy"`, removed `frameBorder="0"`. (The visible border is already none via `rounded-2xl` + the parent's `overflow-hidden`; if a border appears, add `style={{ border: 'none' }}` — but try without it first.)

### Step 4: Swap the SuccessState map image

In `src/components/SuccessState.tsx` (~line 236), replace the `<img>`:

```tsx
<img 
  src="/images/map-placeholder.svg" 
  alt="Схема проезда к складу ГориЯсно"
  loading="lazy"
  decoding="async"
  className="w-full h-full object-cover grayscale opacity-30 contrast-125 select-none"
/>
```

**Verify**: `npm run build` exits 0; `npm run lint` exits 0. `grep -rn "images.unsplash.com" src` → no matches (both references gone).

### Step 5: Regression gate

**Verify**: `npx playwright test --project=chromium` → all 4 tests pass. (No test asserts on the map image/iframe, so this should be unaffected; if a test fails on a missing locator, STOP — you likely changed the wrong line.)

## Test plan

- No new automated tests. The grep in Step 4 (`grep -rn "images.unsplash.com" src` → no matches) is the machine-checkable proof that the external dependency is gone.
- Existing E2E is the regression gate.

## Done criteria

ALL must hold:

- [ ] `public/images/map-placeholder.svg` exists and `dist/images/map-placeholder.svg` is emitted by `npm run build`
- [ ] `grep -rn "images.unsplash.com" src` returns no matches
- [ ] The FeedbackSection `<iframe>` has a `title` attribute and `loading="lazy"`, and no `frameBorder` attribute
- [ ] Both map `<img>` tags use `src="/images/map-placeholder.svg"` with `loading="lazy"` + `decoding="async"`
- [ ] `npm run build` exits 0; `npm run lint` exits 0
- [ ] `npx playwright test --project=chromium` passes all 4
- [ ] `git status` shows changes only to in-scope files
- [ ] `plans/README.md` status row for 012 updated

## STOP conditions

- The `<img>`/`<iframe>` locations don't match the excerpts (line numbers shifted or the Unsplash URL changed) — reconcile before editing.
- `npm run build` fails after the SVG swap (e.g. Vite rejects the SVG) — most likely a malformed SVG; fix the XML and rebuild.
- A visible border appears on the Yandex iframe after removing `frameBorder` — add `style={{ border: 'none' }}` to the iframe and rebuild; if it still shows, STOP and report (do not restore `frameBorder`).
- Do NOT change the Yandex `src` URL or the `loadMap` click-to-load interaction.
- Do NOT replace the SVG with another external image — the whole point is same-origin, offline-capable, no licensing.

## Maintenance notes

- The placeholder is a generic dark grid + pin SVG, not a real map. The real map loads on click (Yandex iframe). If the maintainer later wants a real static map image (e.g. a Yandex Static API raster), that should be fetched at build time into `public/images/` — keep it self-hosted, never a runtime external CDN.
- If a real product/route photo is preferred over the SVG, drop a license-clean JPG into `public/images/map-placeholder.jpg` and update the two `src` paths; keep `loading="lazy"`.
- The iframe `loading="lazy"` defers the Yandex widget until the user scrolls near it (combined with the existing click-to-load `loadMap` overlay, the heavy widget only loads on explicit interaction — good for 3G).
- A future CSP (Plan 016) must allow `frame-src https://yandex.ru` for the map widget to render; note this when writing the CSP.
