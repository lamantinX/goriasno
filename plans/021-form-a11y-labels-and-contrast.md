# Plan 021: Associate form labels with inputs and fix consent-checkbox contrast

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat b1ac6d3..HEAD -- src/components/Modal.tsx`
> If `src/components/Modal.tsx` changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (edits `Modal.tsx`, same file as 019/020 — see Maintenance)
- **Category**: a11y / bug
- **Planned at**: commit `b1ac6d3`, 2026-06-30

## Why this matters

In the lead form (`Modal.tsx`) the `<label>` elements are **not associated** with
their inputs — there is no `htmlFor`/`id` pairing and the inputs are not nested
inside their labels. Screen readers announce the fields as unlabeled, and
clicking a label does not focus its input. Separately, the FZ-152 consent
checkbox text uses `text-slate-500` (#64748b) on the modal background `#16161a`,
which measures ≈3.93:1 contrast — below the WCAG AA 4.5:1 minimum for body text.
This plan ties each label to its control and bumps the checkbox text one shade to
clear 4.5:1.

## Current state

`src/components/Modal.tsx` — four form controls, each with a detached label.
There are **two text inputs, one textarea, one checkbox**. Current excerpts:

```tsx
// Name — Modal.tsx:226-239
<label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block font-sans">
  Ваше имя
</label>
<div className="relative">
  <span className="absolute left-3 ..."><User className="w-4 h-4" /></span>
  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
    placeholder="Иван Иванов" className="..." />
</div>

// Phone — Modal.tsx:245-258
<label className="...">Номер телефона</label>
<div className="relative">
  <span ...><Phone className="w-4 h-4" /></span>
  <input type="tel" value={phone} onChange={handlePhoneChange}
    placeholder="+7 (949) 340-10-11" className="..." />
</div>

// Comment textarea — Modal.tsx:265-274
<label className="...">Дополнительные пожелания (Необязательно)</label>
<textarea value={message} onChange={(e) => setMessage(e.target.value)}
  placeholder="..." rows={3} className="..." />

// Consent checkbox — Modal.tsx:279-288  (label WRAPS the input — this one is OK structurally)
<label className="flex items-start gap-2 text-[10px] text-slate-500 cursor-pointer pt-2 pb-2">
  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required
    className="mt-0.5 rounded border-slate-800 bg-slate-900 text-orange-500 shrink-0" />
  <span>Я согласен на обработку персональных данных ...</span>
</label>
```

Convention in this repo: Tailwind utility classes inline; theme colors are
custom tokens defined in `src/index.css` `@theme` (e.g. `--color-slate-405`).
`text-slate-400` (#94a3b8) is already used for the field labels and is the safe
"muted but readable" shade here.

## Commands you will need

| Purpose   | Command                              | Expected on success    |
|-----------|--------------------------------------|------------------------|
| Typecheck | `npm run lint`                       | exit 0, no errors      |
| Build     | `npm run build`                      | exit 0                 |
| Verify    | `bash scripts/run-quiet.sh verify`   | exit 0, silent on pass |

## Scope

**In scope**:
- `src/components/Modal.tsx`

**Out of scope** (do NOT touch):
- `src/index.css` — no new color token needed; reuse the existing
  `text-slate-400` Tailwind class for the contrast fix.
- The icon `<span>` decorations inside the input wrappers — leave them.

## Git workflow

- Branch: `advisor/021-form-a11y-labels-and-contrast`
- Commit style: conventional commits. Suggested:
  `fix(a11y): associate form labels with inputs, raise checkbox contrast`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Pair each label with its input via id + htmlFor

For the **name**, **phone**, and **comment** fields, add a unique `id` to the
control and a matching `htmlFor` to its `<label>`:

- Name: `<label htmlFor="lead-name">` + `<input id="lead-name" ...>`
- Phone: `<label htmlFor="lead-phone">` + `<input id="lead-phone" ...>`
- Comment: `<label htmlFor="lead-message">` + `<textarea id="lead-message" ...>`

Do not change classes, values, handlers, or placeholders — only add the
`id`/`htmlFor` attribute pairs.

The **consent checkbox** label already wraps its input (implicit association), so
it needs no `htmlFor` — leave its structure. (Its contrast is fixed in Step 2.)

**Verify**: `npm run lint` → exit 0.

### Step 2: Raise consent-checkbox text contrast to AA

On the consent `<label>` (Modal.tsx:279), change `text-slate-500` to
`text-slate-400`:

```tsx
<label className="flex items-start gap-2 text-[10px] text-slate-400 cursor-pointer pt-2 pb-2">
```

`text-slate-400` is #94a3b8 → ~5.9:1 on `#16161a`, clearing AA 4.5:1. The inner
`<a>` (`Политике конфиденциальности`) keeps its `underline hover:text-white`.

**Verify**: `npm run lint` → exit 0.

### Step 3: Build

**Verify**: `npm run build` → exit 0.

## Test plan

- No unit test framework for components in this repo; verification is the build +
  these grep checks (Done criteria).
- If the Playwright suite (`tests/`) opens the modal, optionally add an assertion
  that `getByLabel('Ваше имя')` / `getByLabel('Номер телефона')` resolve — this
  only passes once labels are associated. Follow the structural pattern of an
  existing spec in `tests/`; do not add a new framework.

## Done criteria

ALL must hold:

- [ ] `npm run lint` exits 0
- [ ] `npm run build` exits 0
- [ ] `grep -c 'htmlFor=' src/components/Modal.tsx` returns at least 3
- [ ] `grep -c 'id="lead-' src/components/Modal.tsx` returns 3
- [ ] `grep -n 'text-slate-500 cursor-pointer' src/components/Modal.tsx` returns
      nothing (the consent label no longer uses slate-500)
- [ ] No files outside `src/components/Modal.tsx` modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- `Modal.tsx` does not match the "Current state" excerpts (drifted).
- A verification fails twice after a reasonable fix attempt.
- Fixing contrast appears to need a new color token in `index.css` — it does
  not (use `text-slate-400`); if you believe otherwise, stop and report.

## Maintenance notes

- Plans 019, 020, 021 all edit `Modal.tsx` in different regions (019: hook
  ordering at top; 020: `fetch` body; 021: the `<form>` markup). Execute on
  separate branches and rebase; conflicts, if any, are trivial.
- Reviewer: verify clicking each label focuses its input, and re-check the
  checkbox text contrast against the modal background.
- The `aria-label` on the dialog container (`Modal.tsx:164`) already names the
  dialog — no change needed there.
