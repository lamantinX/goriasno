# Project Harness — goriasno

Global-Harness-Version: 0.2.0
Project-Harness-Version: goriasno-v2
Last-Sync: 2026-06-17
Local-Overrides: 7-dimension scoring rubric (see `.claude/rules/meta-harness.md`); bash enforcement scripts in `scripts/`.

## Structure

| Path | Role |
|---|---|
| `AGENTS.md` | Cross-agent contract: project, workflow, task classes, critical areas, safety, skills, enforcement. |
| `CLAUDE.md` | Claude entrypoint (loads AGENTS.md). |
| `.claude/rules/` | Operational rules: `task-routing.md`, `meta-harness.md`, `testing.md`, `context-budget.md`, `security.md`. |
| `.claude/skills/` | Workflows. Harness-critical: `sprint-contract`, `run-logging`, `feature-implementation`, `bug-investigation`, `release-check`, `improve`. |
| `.claude/agents/` | Specialist agents: `hostile-evaluator`, `security-reviewer`, `test-writer`. |
| `scripts/` | Enforcement + scaffolding: `sprint-gate.sh`, `sprint-artifacts.sh`, `run-log-check.sh`, `install-hooks.sh`. |
| `docs/ai-runs/` | Run logs (one per Standard+ task) + `_TEMPLATE.md` + `harness-scores.md` + `harness-improvements.md`. |
| `docs/sprints/` | Sprint artifacts (`<slug>.md`, `<slug>.trivial`) + `_TEMPLATE.md`. |
| `plans/` | Approved execution plans (`<NNN>-<slug>.md`) from `improve plan`. |
| `docs/harness/README.md` | This file. |

## Default workflow (per task)

1. **Classify** the task into a tier (`task-routing.md`).
2. **Load** the smallest relevant context (`context-budget.md`).
3. **Plan + Contract** for Standard+ (`sprint-contract` skill → `docs/sprints/<slug>.md`).
4. **Make** the smallest safe change.
5. **Verify** every Contract criterion + `npm run verify` (`testing.md`).
6. **Evaluate** against the Contract → `Result: PASS`.
7. **Log** the run in `docs/ai-runs/` using `_TEMPLATE.md`.
8. **Gate** the PR via `scripts/sprint-gate.sh` (enforced by the pre-push hook).

## Meta-harness loop (concrete)

1. Every Standard+/Complex/Core-risk/Research-only/Meta task produces a run log in `docs/ai-runs/`.
2. After every 5 run logs (or immediately on `FAILED`/`ROLLED-BACK`/`SECURITY-SENSITIVE`/`HIGH-FRICTION`), score all 7 dimensions in `harness-scores.md` using the rubric in `.claude/rules/meta-harness.md`.
3. After each scoring, append **one** proposal to `harness-improvements.md`, selected from the lowest-scoring dimension.
4. The next Meta-harness-improvement task picks the top `PROPOSED` item, applies it, marks it `APPLIED` with the commit SHA.
5. One proposal per scoring. One application per Meta task. Small, reversible, evidence-linked.

## Enforcement (real, not prompt-compliance)

| Gate | Mechanism | What it blocks |
|---|---|---|
| Sprint artifact exists and `Result: PASS` | `scripts/sprint-gate.sh`, wired into `.git/hooks/pre-push` via `scripts/install-hooks.sh` | Pushing a branch with no passing sprint. |
| Run log appeared after a Standard+ task | `scripts/run-log-check.sh` (run by the agent at task end) | Forgetting to log a run. |
| `npm run verify` before commit | Agent discipline + `testing.md` rule | Committing broken build/lint. |
| Sensitive surface touched without Core-risk | `security.md` rule + `security-reviewer` agent | Not auto-enforced yet — see improvement proposals. |

Install the git hook once per clone:
```bash
bash scripts/install-hooks.sh
```

## Skills actually used by this project

The `.claude/skills/` directory holds only skills relevant to goriasno (a React/Vite/Tailwind product site). Unrelated SaaS/experimentation marketing skills were removed; the set below is the whole inventory. Load any of them when its trigger fires.

- **Harness-critical:** `sprint-contract`, `run-logging`, `feature-implementation`, `bug-investigation`, `release-check`, `improve`.
- **Ponytail (lazy senior dev):** `ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-debt`, `ponytail-help`.
- **Domain (product site):** `copywriting`, `cro`, `ai-seo`, `content-strategy`, `analytics`, `analytics-instrumentation`, `launch`, `marketing-ideas`, `marketing-psychology`, `pricing`, `programmatic-seo`, `competitor-profiling`, `customer-research`, `product-marketing`, `product-audit`.
- **Utility:** `image`.

## Test commands

- `npm run verify` — mandatory minimum pre-commit (`lint` + `build`).
- `npm run dev` — dev server on port 3000.
- `npm run build` — production build.
- `npm run lint` — `tsc --noEmit`.
- Playwright e2e — pending Plan 007.

## Branch / deploy policy

- Default branch: `main`. Staging branch: `staging`.
- Deploy: manual to staging/prod. No auto-deploy.
