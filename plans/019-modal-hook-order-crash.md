# Plan 019: Fix Modal hook-order crash (React error #310) on "Рассчитать заказ"

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat b1ac6d3..HEAD -- src/components/Modal.tsx`
> If `src/components/Modal.tsx` changed since this plan was written, compare the
> "Current state" excerpt against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `b1ac6d3`, 2026-06-30

## Why this matters

Clicking **"Рассчитать заказ"** on any catalog product (all 8 products) opens
`Modal`, which crashes with React error #310 ("Rendered more hooks than during
the previous render") and shows a white screen — the primary conversion path is
completely broken. The cause: `Modal` calls hooks **after** an early
`return null`. React requires every hook to run in the same order on every
render; when `isOpen` flips `false → true`, the early return is skipped and
three extra hooks suddenly run, violating the Rules of Hooks. Moving the early
return below all hook calls fixes it with no behavior change.

## Current state

- `src/components/Modal.tsx` — the lead-capture dialog rendered globally from
  `src/App.tsx:190`. It declares state hooks at the top, then has an early
  return, then declares **three more hooks after the return**:

  ```tsx
  // src/components/Modal.tsx
  export default function Modal({ isOpen, ... }: ModalProps) {
    const [name, setName] = useState("");          // line 28
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [agree, setAgree] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { ... }, [isOpen]);             // line 35  (hook #7)

    if (!isOpen) return null;                        // line 51  <-- EARLY RETURN

    // ... non-hook helpers (handlePhoneChange, handleSubmit, getTheme*) ...

    const modalRef = useRef<HTMLDivElement>(null);   // line 133 (hook AFTER return)

    useEffect(() => { ... }, [isOpen, onClose]);     // line 136 (hook AFTER return)

    const handleTrapFocus = useCallback((e) => {     // line 146 (hook AFTER return)
      ...
    }, []);

    return ( <div ...>...</div> );                   // line 163
  }
  ```

  When `isOpen === false`: hooks #1–#7 run, then `return null`. When
  `isOpen === true`: hooks #1–#7 run, the early return is skipped, then
  `useRef` + `useEffect` + `useCallback` run too. Hook count differs between
  renders → crash.

- Repo convention: components are function components with hooks at the top of
  the body; see `src/App.tsx:19-49` (all hooks declared before any conditional
  rendering / early logic). Match that — **all hooks before any early return**.

## Commands you will need

| Purpose   | Command                                  | Expected on success         |
|-----------|------------------------------------------|-----------------------------|
| Typecheck | `npm run lint`                           | exit 0, no errors           |
| Build     | `npm run build`                          | exit 0                      |
| Verify    | `bash scripts/run-quiet.sh verify`       | exit 0, silent on pass      |
| E2E       | `bash scripts/run-quiet.sh test`         | exit 0, silent on pass      |

## Scope

**In scope** (the only file you should modify):
- `src/components/Modal.tsx`

**Out of scope** (do NOT touch):
- `src/App.tsx`, `src/components/Catalog.tsx` — the call sites are correct;
  the bug is entirely inside `Modal`.
- The form submission logic, theme helpers, focus-trap behavior — preserve
  them exactly; this is a pure reordering fix.

## Git workflow

- Branch: `advisor/019-modal-hook-order-crash`
- Commit message style: conventional commits (repo uses them, e.g.
  `fix(client): remove stock widget...`). Suggested:
  `fix(modal): move all hooks above early return to fix React #310 crash`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Move the three trailing hooks above the early return

In `src/components/Modal.tsx`, relocate these three hook declarations so they
sit with the other hooks **before** `if (!isOpen) return null;`:

1. `const modalRef = useRef<HTMLDivElement>(null);` (currently ~line 133)
2. The Escape-key `useEffect(() => { ... }, [isOpen, onClose]);` (currently ~line 136)
3. The `const handleTrapFocus = useCallback((e) => { ... }, []);` (currently ~line 146)

Target body order (hooks first, then early return, then non-hook helpers, then
JSX):

```tsx
export default function Modal({ isOpen, onClose, formType, selectedProduct, onSubmitSuccess, theme }: ModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [agree, setAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // reset-on-open effect (was line 35)
  useEffect(() => {
    if (isOpen) { /* ...unchanged... */ }
    else { document.body.style.overflow = "unset"; }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Escape-key effect (moved up; the `if (!isOpen) return;` guard INSIDE it stays)
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Focus-trap callback (moved up)
  const handleTrapFocus = useCallback((e: React.KeyboardEvent) => {
    /* ...unchanged... */
  }, []);

  if (!isOpen) return null;   // <-- early return now AFTER all hooks

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* unchanged */ };
  const handleSubmit = (e: React.FormEvent) => { /* unchanged */ };
  const getThemeAccentClass = () => { /* unchanged */ };
  const getThemeTextClass = () => { /* unchanged */ };
  const getThemeBorderClass = () => { /* unchanged */ };

  return ( /* unchanged JSX */ );
}
```

Notes:
- Keep the bodies of all three hooks **byte-for-byte identical** to today — only
  their position moves. The Escape-key effect keeps its internal `if (!isOpen)
  return;` guard (that guard is fine — it runs inside the hook, not before it).
- The non-hook helpers (`handlePhoneChange`, `handleSubmit`, `getTheme*`) may
  stay where they are (below the early return) — they are plain functions, not
  hooks, so their position does not matter. Only the **hooks** must precede the
  early return.

**Verify**: `npm run lint` → exit 0, no errors.

### Step 2: Build

**Verify**: `npm run build` → exit 0.

## Test plan

- This repo has a Playwright e2e suite (`npm run test`, see `tests/`). Run it to
  confirm the modal flow no longer crashes.
- If, and only if, the existing suite does **not** already cover opening the
  order modal, add one spec following the structural pattern of an existing file
  in `tests/` (open the catalog page, click a product's "Рассчитать заказ"
  button, assert the dialog `[role="dialog"]` becomes visible and no error
  boundary / blank `#root` appears). Do not invent a new test framework — reuse
  Playwright exactly as the existing specs do.
- Verification: `bash scripts/run-quiet.sh test` → exit 0.

## Done criteria

ALL must hold:

- [ ] `npm run lint` exits 0
- [ ] `npm run build` exits 0
- [ ] `bash scripts/run-quiet.sh test` exits 0
- [ ] In `src/components/Modal.tsx`, `useRef`/`useCallback` and BOTH `useEffect`
      calls appear **before** the line `if (!isOpen) return null;`
      (`grep -n "return null" src/components/Modal.tsx` line number is greater
      than every hook-call line number)
- [ ] No files outside `src/components/Modal.tsx` are modified (`git status`)

## STOP conditions

Stop and report back if:

- `src/components/Modal.tsx` does not match the "Current state" excerpt (drifted
  since this plan was written).
- After moving the hooks, `npm run build` or the e2e suite fails twice after a
  reasonable fix attempt.
- You find that fixing the crash appears to require editing `App.tsx` or
  `Catalog.tsx` — it should not; if it seems to, stop.

## Maintenance notes

- Rule of Hooks: never add a hook below the `if (!isOpen) return null;` line in
  this component again. Any future hook must go in the top block.
- A reviewer should confirm the three moved hook bodies are unchanged (pure
  reorder) and that the modal still: resets fields on open, closes on Escape,
  and traps Tab focus.
- Consider enabling an eslint `react-hooks/rules-of-hooks` rule later to catch
  this class of bug automatically — deferred (repo currently lints via `tsc`
  + Biome, neither of which flags hook-order).
