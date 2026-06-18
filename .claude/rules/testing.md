# Testing

**Strict rule: never commit unverified code. "Looks done" is not verification.**

## Verification ladder (by tier)

- **Trivial (code):** `npm run verify`.
- **Standard:** every Contract criterion verified + `npm run verify`.
- **Complex:** every Contract criterion + `npm run verify` + Playwright for UI (desktop 1280×720, mobile 375×667; states: loading, empty, error).
- **Core-risk:** everything in Complex + `hostile-evaluator` evaluation + `security-reviewer` on sensitive surfaces.

## What `npm run verify` is

`npm run verify` = `npm run lint && npm run build` (i.e. `tsc --noEmit` + `vite build`). It is the **mandatory minimum** before any commit that touches `src/`, `public/`, `server.js`, or `package.json`.

## Quiet wrapper for agent context hygiene

`bash scripts/run-quiet.sh verify` runs the IDENTICAL `npm run verify` and
propagates its exit code, but suppresses stdout/stderr on success — printing
the full captured output only on failure. This keeps verify output out of the
agent's conversation memory on green runs (see
`.claude/rules/context-budget.md`). It does NOT disable, skip, or weaken any
check (see Forbidden below); use the raw `npm run verify` when you need to
read the output. The quiet wrapper satisfies the mandatory-verify-before-commit
rule because it runs `npm run verify` internally.

## Criterion-level evidence

Each acceptance criterion in the sprint Contract must be **verifiable by a concrete command or Playwright step**. "Works correctly" is not a criterion. Record in the sprint Evidence section:

```
1. <criterion>: `<command>` → <result>
```

If a criterion cannot be verified by a command, it is not a valid criterion — rewrite it.

## Skipped checks

Skipping a check is allowed only with: the check name, the reason, and the remaining risk. Record all three in the Evidence section. "No time" is not a reason.

## Forbidden

- Committing with `npm run verify` failing.
- "Should work", "probably fine", "looks correct" as verification.
- Disabling lint/build to make a commit pass.
- Running full CI suites locally (they run in CI); local verification is `npm run verify` + criterion-level.

## Pending

Plan 007 (`plans/007-e2e-testing-and-dx.md`) adds a Playwright e2e harness. Until it lands, UI verification is a manual browser check via `npm run preview` + screenshot, recorded in Evidence.
