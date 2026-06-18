# Plan 013: Fix Hero "contact manager" scroll target + JSON-LD Sunday hours

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 69c19dc..HEAD -- src/components/Hero.tsx index.html`
> If either in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: correctness (two independent trivial bugs bundled)
- **Planned at**: commit `69c19dc`, 2026-06-17

## Why this matters

Two small, HIGH-confidence correctness bugs that each silently degrade the
site: (1) The Hero's secondary CTA "Связаться с менеджером" scrolls to
`getElementById("feedback-section")`, but no element has that id — the
contacts section is `id="contacts"`. The guard `if (element)` makes it
silently no-op, so a primary above-the-fold contact button does nothing.
(2) The `LocalBusiness` JSON-LD in `index.html` lists `dayOfWeek` as
Monday–Saturday, but the UI advertises "Ежедневно 08:00–18:00" / "Пн-Вс"
everywhere — the structured data contradicts the page and would produce
wrong rich-result hours for a business where hours are a conversion signal.

## Current state

### Bug 1 — Hero scroll target

`src/components/Hero.tsx:52-57`:

```tsx
const handleScrollToContacts = () => {
  const element = document.getElementById("feedback-section");
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};
```

The button at `Hero.tsx:121-126` calls `handleScrollToContacts`:

```tsx
<button
  onClick={handleScrollToContacts}
  className="px-8 py-4 rounded-xl border border-slate-800 ..."
>
  <span>Связаться с менеджером</span>
</button>
```

The target section is `src/components/FeedbackSection.tsx:119`:
`<section id="contacts" ...>`. There is no `id="feedback-section"` anywhere
in `src/` (grep-confirmed: only `contacts`, `catalog`, `process` exist).

### Bug 2 — JSON-LD missing Sunday

`index.html:48-53`:

```json
"openingHoursSpecification": {
  "@type": "OpeningHoursSpecification",
  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  "opens": "08:00",
  "closes": "18:00"
}
```

The UI says Sunday is a working day:
- `src/components/Header.tsx:87` — "Пн-Вс 08:00–18:00" (desktop status badge)
- `src/components/Header.tsx:191` — "Пн-Вс 08:00–18:00" (mobile drawer)
- `src/components/FeedbackSection.tsx:276` — "Ежедневно с 08:00 до 18:00 без перерывов"

So the schema must include `"Sunday"`.

### Repo conventions

- Anchor scrolling uses `document.getElementById(id).scrollIntoView({ behavior: "smooth" })` — see `Header.tsx:35-41` `scrollToSection` as the exemplar. Match its pattern (it already targets `"catalog"`, `"process"`, `"contacts"` correctly).
- JSON-LD is inline in `index.html` as a `<script type="application/ld+json">` block; keep the JSON valid (trailing commas not allowed in JSON).

## Commands you will need

| Purpose | Command | Expected on success |
|-----------|--------------------------|---------------------|
| Build | `npm run build` | exit 0 |
| Typecheck | `npm run lint` | exit 0 |
| E2E smoke | `npx playwright test --project=chromium` | all pass |
| JSON-LD sanity | `node -e "JSON.parse(require('fs').readFileSync('index.html','utf8').match(/<script type=\"application\\/ld\\+json\">([\s\S]*?)<\\/script>/)[1])"` | exit 0 (JSON parses) |

## Scope

**In scope**:
- `src/components/Hero.tsx` (fix the one `getElementById` string)
- `index.html` (add `"Sunday"` to the `dayOfWeek` array)

**Out of scope** (do NOT touch):
- Any other scroll handler (`Header.tsx` already correct), any other JSON-LD field, the `og:` meta tags, or the `<title>`.
- The `Header.tsx`/`FeedbackSection.tsx` "Пн-Вс" display strings (they're correct; the schema is the one that's wrong).
- Do not "fix" the `if (element)` guard by removing it — keep the null guard (it's good practice); only fix the id string.

## Git workflow

- Branch: `advisor/013-small-correctness-fixes`
- Commit message style: `fix: hero contacts scroll target + add Sunday to JSON-LD opening hours`

## Steps

### Step 1: Fix the Hero scroll target

In `src/components/Hero.tsx`, change `handleScrollToContacts` (line ~53) to
target the real section id:

```tsx
const handleScrollToContacts = () => {
  const element = document.getElementById("contacts");
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};
```

Only the string `"feedback-section"` → `"contacts"` changes. Leave
`handleScrollToCatalog` (which targets `"catalog"` — correct) untouched.

**Verify**: `npm run lint` exits 0. `grep -n "feedback-section" src/components/Hero.tsx` → no matches.

### Step 2: Add Sunday to the JSON-LD opening hours

In `index.html`, update the `dayOfWeek` array (line ~50) to include all
seven days:

```json
"dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
```

Do not change `opens`/`closes` (08:00–18:00 is correct per the UI) or any
other JSON-LD field.

**Verify**: the JSON-LD sanity command above exits 0 (the block still
parses as valid JSON). `grep -n "Sunday" index.html` → 1 match.

### Step 3: Regression gate

**Verify**:
- `npm run build` exits 0 (the `index.html` change is copied to `dist/`).
- `npm run lint` exits 0.
- `npx playwright test --project=chromium` → all 4 tests pass (no test
  asserts on the Hero secondary button or the JSON-LD, so this should be
  unaffected).

### Step 4: Manual smoke (optional but recommended)

`npm run dev` → http://localhost:3000 → click "Связаться с менеджером" in
the Hero → the page should smooth-scroll to the contacts section (form +
map). If it doesn't scroll, the id still doesn't match — re-check
`FeedbackSection.tsx` line 119.

## Test plan

- No new automated tests (both fixes are trivial and verified by grep +
  JSON.parse). The existing E2E is the regression gate.
- Optional: a future E2E could click the Hero "Связаться с менеджером"
  button and assert `#contacts` is in the viewport — out of scope here.

## Done criteria

ALL must hold:

- [ ] `grep -n "feedback-section" src` returns no matches (the dead id is gone)
- [ ] `grep -n "Sunday" index.html` returns 1 match (in the `dayOfWeek` array)
- [ ] The JSON-LD block in `index.html` still parses as valid JSON (the sanity command exits 0)
- [ ] `npm run build` exits 0; `npm run lint` exits 0
- [ ] `npx playwright test --project=chromium` passes all 4
- [ ] `git status` shows changes ONLY to `src/components/Hero.tsx` and `index.html`
- [ ] `plans/README.md` status row for 013 updated

## STOP conditions

- `FeedbackSection.tsx:119` is not `<section id="contacts" ...>` (the id
  changed) — do not guess a new id; STOP and report.
- The JSON-LD block in `index.html` doesn't match the excerpt (field shape
  changed) — reconcile before editing.
- `npm run build` fails after the JSON-LD edit — you introduced a JSON
  syntax error (likely a trailing comma or missing quote); fix and rebuild.
- Do NOT also "clean up" other JSON-LD fields or meta tags while here —
  scope is exactly these two bugs.

## Maintenance notes

- If the contacts section id is ever renamed, update BOTH `Header.tsx`
  `scrollToSection("contacts")` and `Hero.tsx` `handleScrollToContacts` in
  the same change. The two scroll handlers must agree on the id.
- If the business hours ever actually change (e.g. Sunday becomes a day
  off), update the JSON-LD `dayOfWeek` AND the display strings in
  `Header.tsx` and `FeedbackSection.tsx` together — they must agree, or
  rich results contradict the page again.
- Consider adding a future E2E that asserts the Hero CTA scrolls to
  `#contacts`, so this regression can't silently return.
