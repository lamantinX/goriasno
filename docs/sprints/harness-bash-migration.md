# Sprint: Migrate harness scripts to bash and prune dead weight

> User task: "оптимизируй harness в проекте чтоб он нормально работал и был полезным." Plan approved (bash migration + prune dead weight).

Branch: advisor/011-service-worker-fix · Date: 2026-06-19 · Class: Standard (Meta-harness)

## Sprint
**Goal:** Make the harness actually enforce on this Linux/WSL2 box (scripts were PowerShell-only, `pwsh` not installed) and remove dead/fictional weight.
**Scope:** in — `scripts/` (4 scripts), `AGENTS.md`, `docs/harness/README.md`, `.claude/rules/{context-budget,task-routing,testing}.md`, `.claude/skills/{sprint-contract,run-logging,feature-implementation}/SKILL.md`, `docs/{sprints,ai-runs}/_TEMPLATE.md`, 2 existing sprint files, `plans/018-*`, `plans/README.md`, `.gitignore`, ~27 skill dirs; out — product code (`src/`, `public/`, `server.js`, `package.json`), 6 tiers, 7-dim scoring, `security.md`, historical run-logs, `worktree-014/`.
**Risks:** Sensitive surface = the harness itself (`.claude/rules/*`, `scripts/*`, `.git/hooks/*`) per `security.md` → Meta-harness tier. Bash is present (WSL2). All changes reversible.
**Context budget:** Tiny — rules, scripts, README, key skills.

## Contract
1. All 4 enforcement scripts run under bash (no `pwsh` dependency): `sprint-gate.sh`, `run-log-check.sh`, `sprint-artifacts.sh`, `install-hooks.sh`.
2. The pre-push hook invokes bash, not pwsh; `git push --dry-run` no longer fails on a missing runtime.
3. No live (non-historical) doc references `.ps1`/`pwsh`.
4. No fictional tool/command references remain in rules/skills (`ctx_*`, `agentmemory`, `/browse`, `/simplify`, `meta-harness-optimize`, `web/`/`backend/`).
5. `run-logging` SKILL.md matches the actual one-file-per-run format (no contradictory monthly-table).
6. `.claude/skills/` holds only relevant skills; no dangling skill-call references.
7. `npm run verify` passes.

## Critique
- **Self-critique:** Porting 1:1 risks carrying the original's latent bug — and one was found: `sprint-artifacts.sh` sed delimiter `|` collided with the `Trivial | Standard | Complex | Core-risk` template (contains `|`). Fixed by switching to `#` delimiter. Caught during this task's own scaffold, not in production.
- Branch-slug mapping matches the original exactly (`advisor/` not stripped → `advisor-011-service-worker-fix`), preserving compatibility with existing sprint files.
- Did NOT touch the 6-tier system, 7-dim scoring, or `security.md` — these are the working core (score-log shows honest 2–3 scores). "Prune" ≠ "rewrite working logic."
- Historical run-logs (`2026-06-17-*`, `harness-improvements.md`) intentionally left — they record facts about the 2026-06-17 PowerShell-era build.

## Evidence
- `npm run verify` → exit 0 (lint + `vite build` ✓ built in 4.35s).
- Criterion 1: `for s in scripts/*.sh; do bash -n "$s"; done` → all 4 OK (syntax).
- Criterion 2: `git push --dry-run` → `sprint-gate: PASS … [exit 0]`; `grep -c pwsh .git/hooks/pre-push` → **0**; `grep -c 'bash scripts/sprint-gate.sh'` → **1**.
- Criterion 1 (runtime): `bash scripts/sprint-gate.sh` → `PASS — advisor-011-service-worker-fix.md`; `bash scripts/run-log-check.sh` → `PASS (new vs main)`; `bash scripts/sprint-artifacts.sh sprint …` → `created:` (after the delimiter fix); `bash scripts/install-hooks.sh` → `installed .git/hooks/pre-push`.
- Criterion 3: `grep -rE '\.ps1|pwsh'` excluding `docs/ai-runs/2026-06-17-*`/`harness-improvements.md` → only intentional explanatory mentions ("`.ps1` references are obsolete"; "`pwsh` is NOT installed").
- Criterion 4: removed `ctx_*`/`agentmemory` from `context-budget.md` (→ Glob/Grep/Read/Bash/Explore); `context-mode`/`agentmemory` removed from `AGENTS.md` required skills; `/browse` → `npm run preview`; `/simplify` line deleted; `meta-harness-optimize` dropped from README harness-critical list; `web/`/`backend/` → `src/`/`src/components/`.
- Criterion 5: `run-logging/SKILL.md` rewritten — file-per-run, matches `_TEMPLATE.md`.
- Criterion 6: 27 skills removed; `grep '\`(<names>)\`` → 0 dangling skill-call references.
- Criterion 7: see `npm run verify` above.
- Skipped: Playwright e2e — no product/UI change in this task — remaining risk: none (harness-only).

## Evaluation
Self-evaluated against the Contract: every criterion verified with a concrete command and captured result. Enforcement is now real (hook runs under bash end-to-end), dead weight removed without touching the working core. Two latent defects fixed (sed delimiter; the original `.ps1`-on-Linux enforcement gap that made the gate a no-op).

Result: PASS (Self-Evaluated)
