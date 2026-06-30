# Plan 022: Add a <main> landmark and a visible :focus-visible outline

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat b1ac6d3..HEAD -- src/App.tsx src/index.css`
> If either file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch, treat
> it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: a11y
- **Planned at**: commit `b1ac6d3`, 2026-06-30

## Why this matters

Two accessibility gaps: (1) the page has no `<main>` landmark, so screen-reader
"skip to main content" / landmark navigation has nothing to target — all content
sits in plain `<div>`s. (2) There is no `:focus-visible` style, so keyboard users
tabbing through links/buttons/inputs get no reliable visible focus ring (the
inputs even set `outline-none`). This plan wraps the landing/success content in a
single `<main>` and adds one global `:focus-visible` outline in the accent color.

## Current state

- `src/App.tsx` — the page shell. The landing/success content is rendered inside
  a `<div className="relative">` wrapper with a `<footer>` after it; there is no
  `<main>`. Relevant excerpt:

  ```tsx
  // src/App.tsx:104-187 (abridged)
  <div className="relative">
    {config.mockupStage === "landing" ? (
      <>
        <div className="transition-all"><Header .../></div>
        <div className="transition-all"><Hero .../></div>
        <div className="transition-all"><Catalog .../></div>
        <div className="transition-all"><HowWeWork .../></div>
        <div className="transition-all"><FeedbackSection .../></div>
      </>
    ) : (
      <div className="transition-all"><SuccessState .../></div>
    )}

    <footer className="bg-slate-950 py-8 border-t border-slate-900">
      ...
    </footer>
  </div>
  ```

  `<Header>` is a site banner and `<footer>` is the contentinfo — neither should
  be inside `<main>`. The page body between them is the main content.

- `src/index.css` — has `@import "tailwindcss";`, a `@theme` block with custom
  tokens, scrollbar styles, and a `pulse-glow` keyframe. **No `:focus-visible`
  rule exists.** The accent color requested is `#fe9a00` (amber). The file's
  custom CSS rules live after the `@theme` block (e.g. the `::-webkit-scrollbar`
  rules at lines 493+).

## Commands you will need

| Purpose   | Command                              | Expected on success    |
|-----------|--------------------------------------|------------------------|
| Typecheck | `npm run lint`                       | exit 0, no errors      |
| Build     | `npm run build`                      | exit 0                 |
| Verify    | `bash scripts/run-quiet.sh verify`   | exit 0, silent on pass |

## Scope

**In scope**:
- `src/App.tsx` — introduce the `<main>` element.
- `src/index.css` — add the `:focus-visible` rule.

**Out of scope** (do NOT touch):
- `Header`, `Hero`, `Catalog`, `HowWeWork`, `FeedbackSection`, `SuccessState`,
  `Modal` components — the landmark is added at the App level only.
- The existing `outline-none` on form inputs in `Modal.tsx` — the global
  `:focus-visible` rule below uses `outline` and will still apply on keyboard
  focus; do not edit Modal here.

## Git workflow

- Branch: `advisor/022-main-landmark-and-focus-visible`
- Commit style: conventional commits. Suggested:
  `fix(a11y): wrap content in <main>, add :focus-visible outline`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Wrap the main content in <main>

In `src/App.tsx`, change the wrapper `<div className="relative">` so the
landing/success content is inside a `<main>`, while keeping `<footer>` a sibling
**outside** `<main>`. `<Header>` should also stay outside `<main>` (it is the
banner). Target structure:

```tsx
<div className="relative">
  {config.mockupStage === "landing" ? (
    <>
      <div className="transition-all"><Header ... /></div>
      <main>
        <div className="transition-all"><Hero ... /></div>
        <div className="transition-all"><Catalog ... /></div>
        <div className="transition-all"><HowWeWork ... /></div>
        <div className="transition-all"><FeedbackSection ... /></div>
      </main>
    </>
  ) : (
    <main>
      <div className="transition-all"><SuccessState ... /></div>
    </main>
  )}

  <footer className="bg-slate-950 py-8 border-t border-slate-900">
    ...
  </footer>
</div>
```

Keep every component prop and the existing `className`s unchanged; only insert
the `<main>` wrapper(s). Exactly one `<main>` renders at a time (one per branch
of the ternary) — never two simultaneously.

**Verify**: `npm run lint` → exit 0.

### Step 2: Add the :focus-visible outline

In `src/index.css`, add this rule **after** the `@theme { ... }` block (place it
near the other custom rules, e.g. just before or after the `::-webkit-scrollbar`
rules):

```css
:focus-visible {
  outline: 2px solid #fe9a00;
  outline-offset: 2px;
}
```

`outline-offset` keeps the ring off the element edge for legibility on dark
backgrounds; if you prefer the exact spec from the request, the offset line is
optional but recommended. Do not remove or alter any existing rule.

**Verify**: `npm run lint` → exit 0.

### Step 3: Build

**Verify**: `npm run build` → exit 0.

## Test plan

- Verification is the build + grep checks (Done criteria); no component unit
  tests in this repo.
- Manual check (optional): `npm run dev`, Tab through the page, confirm a visible
  amber ring appears on focused links/buttons/inputs, and that a screen reader's
  landmark list now includes "main".
- If the Playwright suite asserts page structure, optionally add
  `expect(page.getByRole('main')).toBeVisible()` following an existing spec's
  pattern in `tests/`.

## Done criteria

ALL must hold:

- [ ] `npm run lint` exits 0
- [ ] `npm run build` exits 0
- [ ] `grep -c '<main' src/App.tsx` returns 2 (one per ternary branch) and
      `grep -c '</main>' src/App.tsx` returns 2
- [ ] `grep -n ':focus-visible' src/index.css` returns the new rule; the rule
      body contains `outline: 2px solid #fe9a00`
- [ ] `<footer>` and `<Header>` remain OUTSIDE `<main>` (visual check of the
      diff)
- [ ] No files outside `src/App.tsx` and `src/index.css` modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- `src/App.tsx` or `src/index.css` does not match the "Current state" excerpts.
- Adding `<main>` produces two `<main>` elements rendered at once (it must be one
  per ternary branch) — re-check the JSX nesting.
- A verification fails twice after a reasonable fix attempt.

## Maintenance notes

- If more top-level sections are added to the landing page later, place them
  inside the `<main>` (not between `<main>` and `<footer>`).
- Reviewer: confirm exactly one `<main>` lands at runtime and the focus ring is
  visible against the dark theme; check it does not appear on mouse click
  (`:focus-visible`, not `:focus`, is intentional).
