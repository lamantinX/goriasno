# AI Run: Migrate harness scripts to bash and prune dead weight

## Meta
- **Date:** 2026-06-19
- **Task Class:** Meta-harness
- **Trigger:** "оптимизируй harness в проекте чтоб он нормально работал и был полезным"
- **Status:** SUCCESS
- **Tags:** META

## Scope
- **Goal:** Make harness enforcement real on Linux/WSL2 (was PowerShell-only, `pwsh` absent) and prune dead/fictional weight.
- **Files in (modified):** `scripts/{sprint-gate,run-log-check,sprint-artifacts,install-hooks}.sh` (new), `AGENTS.md`, `docs/harness/README.md`, `.claude/rules/{context-budget,task-routing,testing}.md`, `.claude/skills/{sprint-contract,run-logging,feature-implementation}/SKILL.md`, `docs/{sprints,ai-runs}/_TEMPLATE.md`, `docs/sprints/advisor-{008,011}-*.md`, `plans/018-quiet-test-output.md`, `plans/README.md`, `.gitignore`.
- **Files out (read only):** `.claude/rules/{meta-harness,security}.md`, all 4 old `.ps1`, `.git/hooks/pre-push`, `package.json`, `skills-lock.json`.
- **Sensitive surfaces touched:** the harness itself — `.claude/rules/*`, `scripts/*`, `.git/hooks/*` (Meta-harness tier; user-approved plan).

## Plan reference
- **Sprint artifact:** `docs/sprints/harness-bash-migration.md`
- **Approved plan:** N/A — user-directed Meta improvement (plan presented via ExitPlanMode and approved).

## Changes
- Created 4 bash scripts porting the 4 `.ps1` 1:1; deleted the `.ps1` — Criterion 1.
- Regenerated `.git/hooks/pre-push` via `install-hooks.sh` to call `bash` — Criterion 2.
- Updated all live `.ps1`/`pwsh` references → `.sh`/`bash` in AGENTS.md, README, sprint-contract, templates, 2 sprint files; rewrote `plans/018` under bash — Criterion 3.
- Removed fictional tool refs: `ctx_*`/`agentmemory` (context-budget.md → real tools), `context-mode`/`agentmemory` (AGENTS.md), `/browse` (→ `npm run preview`), `/simplify` (deleted), `meta-harness-optimize` (dropped), `web/`/`backend/` (→ `src/`) — Criterion 4.
- Rewrote `run-logging` SKILL.md to match the actual file-per-run format — Criterion 5.
- Removed 27 irrelevant skill dirs; pruned README skills list to the actual inventory — Criterion 6.
- Removed root `nul` (Windows artifact), added `/nul` to `.gitignore`.

## Evidence
- `npm run verify` → exit 0 (lint + `vite build` ✓ built in 4.35s).
- Criterion 1: `for s in scripts/*.sh; do bash -n "$s"; done` → 4× OK. `bash scripts/sprint-gate.sh` → PASS; `run-log-check.sh` → PASS; `sprint-artifacts.sh sprint/runlog` → created.
- Criterion 2: `git push --dry-run` → `sprint-gate: PASS … [exit 0]`; `grep -c pwsh .git/hooks/pre-push` → 0; `grep -c 'bash scripts/sprint-gate.sh'` → 1.
- Criterion 3: live `.ps1`/`pwsh` grep (excl. historical logs) → only explanatory mentions.
- Criterion 4: grep for `ctx_batch_execute|ctx_execute|ctx_search|agentmemory|/browse|/simplify|meta-harness-optimize` in rules/skills → none.
- Criterion 5: `run-logging/SKILL.md` — no `YYYY-MM` table; references `_TEMPLATE.md` one-file-per-run.
- Criterion 6: 27 dirs removed via `git rm -r`; dangling skill-call grep (`` `<names>` ``) → 0 matches.
- Criterion 7: `npm run verify` exit 0 (above).
- Skipped: Playwright e2e — harness-only change, no UI — remaining risk: none.

## Failures / Rework
- First `sprint-gate.sh` test failed: branch-slug regex initially stripped `advisor/` (not in the original's strip list) and `s:/:-:g` was mistyped as `s:/: -:g` (inserted a stray space). Fixed both to match original behavior. Caught by testing before any commit.
- `sprint-artifacts.sh` scaffold failed: sed delimiter `|` collided with the `Trivial | Standard | Complex | Core-risk` template pattern. Switched all 5 substitutions to `#` delimiter. This was a latent bug inherited from a faithful port — caught when scaffolding this very task's artifacts.

## Workflow notes
- Root cause of "enforcement not working": the project's scripts were authored in an Antigravity/Gemini-on-Windows stack (`ctx_*`, `pwsh`, Windows paths in old run-logs) and ported to this Linux/WSL2 box without removing dead tool refs or making enforcement runtime-portable. The pre-push hook called `pwsh scripts/sprint-gate.ps1` with no `pwsh` installed → the gate was a silent no-op (or would error). Now real.
- `context-budget.md`'s "keep raw bytes out" rule was 100% non-executable here (6 fictional tools). Rewritten against the real toolset (Glob/Grep/Read/Bash/Explore).
- Two Plan-mode read-only-tool constraints encountered (Bash blocked in plan mode) — worked around with Glob/Grep. Not a harness defect.

## Outcome
The harness now enforces for real on this machine (bash hook end-to-end), carries no fictional tool/skill references, and is ~27 skills lighter. Next step: optionally run the meta-harness scoring (5-log cadence not yet hit since this is the first post-cleanup run).
