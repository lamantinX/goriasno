# Harness Improvement Proposals

The meta-harness loop's output. One proposal per scoring entry, selected from the **lowest-scoring dimension** in `harness-scores.md`. Status moves PROPOSED → APPLIED (with commit SHA) → optionally OBSERVED (after a follow-up scoring confirms the lift).

Never batch applications. One small, reversible, evidence-linked change per Meta-harness task.

---

## Proposal 001 — PROPOSED → APPLIED
- **Date proposed:** 2026-06-17
- **Dimension:** verification quality (scored 2 in eval 1)
- **Evidence:** Evaluation 2026-06-17 (runs 001–005). Verification across the batch was only "`npm run build` which succeeded" — no criterion-level evidence in any run log; no Contract/Evidence sections used. Weakest dimension.
- **Proposal:** Standardize run logs via `docs/ai-runs/_TEMPLATE.md` (Evidence section mandatory) and add `npm run verify` as the canonical pre-commit command; require criterion-to-command mapping in every sprint Contract.
- **Status:** APPLIED — 2026-06-17. Template created; `npm run verify` added to `package.json`; `testing.md` rewritten with the verification ladder and criterion-level evidence rule. Commit SHA: pending (uncommitted harness revision).
- **Before/after:** before, run logs had no Evidence section and used two different ad-hoc formats; after, `_TEMPLATE.md` enforces a uniform Evidence section and `run-log-check.ps1` verifies a log was created.

## Proposal 002 — PROPOSED → APPLIED
- **Date proposed:** 2026-06-17
- **Dimension:** safety (scored 2 in eval 2)
- **Evidence:** Evaluation 2026-06-17 (run 006). `server.js` (a production server file) was modified with an HTML-escaping hardening without Core-risk classification or approval. The harness at the time did not flag `server.js` as a sensitive surface.
- **Proposal:** Enumerate sensitive surfaces concretely in `.claude/rules/security.md` (including `server.js`, `public/sw.js`, `package.json` scripts, CI, deploy configs, the harness itself) and require Core-risk tier + approval for any of them.
- **Status:** APPLIED — 2026-06-17. `security.md` rewritten with an explicit sensitive-surface list and the Core-risk workflow. The list includes `server.js`, which would have caught run 006's omission.
- **Before/after:** before, "sensitive surfaces" was an undefined phrase; after, it is a concrete checklist the agent must scan pre-task.

## Proposal 003 — PROPOSED → APPLIED
- **Date proposed:** 2026-06-17
- **Dimension:** diff minimality (scored 2 in eval 2)
- **Evidence:** Evaluation 2026-06-17 (run 006). Seven distinct concerns (clean script, sw.js, escapeHTML, toolbar deletion, design-review state, calculator removal, theme config) bundled into one "clean-up" run — scope creep, mixed concerns.
- **Proposal:** Require every hunk to trace to a Contract criterion in the sprint file; flag any run with >3 unrelated concerns for splitting. Codify in `task-routing.md` (Standard tier = ≤5 files, single-purpose) and `meta-harness.md` (diff minimality rubric).
- **Status:** APPLIED — 2026-06-17. Rubric defines diff minimality 1–5 with hunk-to-criterion mapping; `task-routing.md` Standard tier limits scope; sprint Contract requires criterion-traced changes.
- **Before/after:** before, no rule bounded scope per run; after, Standard = ≤5 files single-purpose, and the diff-minimality dimension scores bundling as a 1–2.

## Proposal 004 — PROPOSED → APPLIED
- **Date proposed:** 2026-06-17
- **Dimension:** (enforcement gap, surfaced by audit)
- **Evidence:** `sprint-contract` SKILL.md and AGENTS.md referenced a "sprint-gate hook", `scripts/delegate.sh`, and `scripts/sprint-artifacts.sh` — none existed. `.claude/hooks/` was empty. Enforcement was prompt-compliance, not real.
- **Proposal:** Create the actual enforcement scripts (`sprint-gate.ps1`, `sprint-artifacts.ps1`, `run-log-check.ps1`, `install-hooks.ps1`) and wire the sprint-gate into `.git/hooks/pre-push`.
- **Status:** APPLIED — 2026-06-17. All four scripts created; `install-hooks.ps1` run to install the pre-push hook. Sprint-gate now blocks pushes with no passing sprint.
- **Before/after:** before, push was unguarded and the "hook" was fictional; after, `git push` invokes `sprint-gate.ps1` and fails on a missing/non-passing sprint.
- **Re-applied — 2026-06-19 (run `2026-06-19-harness-bash-migration`):** the 2026-06-17 scripts were PowerShell, but the project runs on Linux/WSL2 with `pwsh` **not installed** — so the pre-push hook (`pwsh scripts/sprint-gate.ps1`) was a silent no-op (or errored). Ported all four scripts 1:1 to bash (`scripts/*.sh`), deleted the `.ps1`, and regenerated the hook to call `bash scripts/sprint-gate.sh`. Verified end-to-end: `git push --dry-run` now runs the gate under bash and passes/fails correctly. This closes the Linux-portability gap the original application left open.

## Proposal 005 — PROPOSED
- **Date proposed:** 2026-06-17
- **Dimension:** context efficiency + safety (scored 3 and 2; both lacked evidence)
- **Evidence:** No run log in either evaluation records the files loaded or whether a pre-task sensitive-surface scan was done. "No evidence in log" is the dominant scoring note. The rubric works, but the logs do not feed it.
- **Proposal:** Add a "Files in / out" and "Sensitive surfaces touched" field to the run-log template (already added in `_TEMPLATE.md`); have `run-log-check.ps1` warn (not fail) if the "Sensitive surfaces touched" field reads "N/A" for a run that touched `src/` or `server.js`.
- **Status:** PARTIALLY APPLIED — 2026-06-19 (run `2026-06-19-harness-bash-migration`). The "Files in/out" and "Sensitive surfaces touched" fields are in `_TEMPLATE.md` and were exercised in this run's log. The `run-log-check.sh` warn-on-missing-sensitive-surface behavior is still **PROPOSED** — not implemented (it is a distinct feature, out of scope for the bash-migration task).

## Proposal 006 — PROPOSED
- **Date proposed:** 2026-06-19
- **Dimension:** correctness (sourced from the 2026-06-19 harness-bash-migration run)
- **Evidence:** `AGENTS.md` and `docs/harness/README.md` both still state "Playwright e2e: pending Plan 007", but Plan 007 is DONE (`playwright.config.ts` and `npm run test` exist and work — confirmed in `plans/018` and `plans/README`). A second stale line: the bash port of `sprint-artifacts.sh` inherited a latent bug (sed `|` delimiter collided with the `Trivial | Standard | Complex | Core-risk` template pattern); the PowerShell original never hit it because `-replace` uses different semantics. Both are "the docs/scripts drift from reality" — the same failure mode this harness exists to catch.
- **Proposal:** Sweep docs for "pending Plan 007" (now DONE) and replace with the actual `npm run test`; and add a one-line harness self-test that scaffolds + validates a sprint file so the sed-substitution path is exercised automatically (e.g. a `scripts/selftest.sh` or a `verify`-adjacent check). Small, reversible.
- **Status:** PROPOSED — pending the next Meta-harness task.

## Proposal 007 — PROPOSED
- **Date proposed:** 2026-07-10
- **Dimension:** speed (scored 3 in the 2026-07-10 SECURITY-SENSITIVE run)
- **Evidence:** A link-href change (`/anthracite` → `/anthracite/`) broke a hard-coded Playwright selector (`a[href="/anthracite"]`) in `tests/example.spec.ts`. The pre-push local `npm run test` could not catch it because webkit browsers don't launch in the WSL sandbox (missing `libgtk-4-1` etc.), so the failure surfaced only on the CI runner — costing a second push and ~7 min of wall time. The root pattern: tests assert on exact URL strings, so any trailing-slash / URL-shape change silently breaks them.
- **Proposal:** Two small, independent changes: (1) in `tests/example.spec.ts`, loosen the navigation selector to a substring/prefix match (e.g. `a[href^="/anthracite"]`) so URL-shape changes don't break the assertion; (2) add a `.github/workflows` note OR a `scripts/run-quiet.sh test --no-webkit` fallback so a local WSL run isn't blocked on browsers that can't launch. Either change is reversible and ≤2 files.
- **Status:** PROPOSED — pending the next Meta-harness task.
