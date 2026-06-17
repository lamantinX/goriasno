# Project Harness — goriasno

Global-Harness-Version: 0.2.0
Project-Harness-Version: goriasno-v2
Last-Sync: 2026-06-17
Local-Overrides: 7-dimension scoring rubric (see `.claude/rules/meta-harness.md`); Windows PowerShell scripts in `scripts/`.

## Structure

| Path | Role |
|---|---|
| `AGENTS.md` | Cross-agent contract: project, workflow, task classes, critical areas, safety, skills, enforcement. |
| `CLAUDE.md` | Claude entrypoint (loads AGENTS.md). |
| `.claude/rules/` | Operational rules: `task-routing.md`, `meta-harness.md`, `testing.md`, `context-budget.md`, `security.md`. |
| `.claude/skills/` | Workflows. Harness-critical: `sprint-contract`, `run-logging`, `feature-implementation`, `bug-investigation`, `release-check`, `improve`. |
| `.claude/agents/` | Specialist agents: `hostile-evaluator`, `security-reviewer`, `test-writer`. |
| `scripts/` | Enforcement + scaffolding: `sprint-gate.ps1`, `sprint-artifacts.ps1`, `run-log-check.ps1`, `install-hooks.ps1`. |
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
8. **Gate** the PR via `scripts/sprint-gate.ps1` (enforced by the pre-push hook).

## Meta-harness loop (concrete)

1. Every Standard+/Complex/Core-risk/Research-only/Meta task produces a run log in `docs/ai-runs/`.
2. After every 5 run logs (or immediately on `FAILED`/`ROLLED-BACK`/`SECURITY-SENSITIVE`/`HIGH-FRICTION`), score all 7 dimensions in `harness-scores.md` using the rubric in `.claude/rules/meta-harness.md`.
3. After each scoring, append **one** proposal to `harness-improvements.md`, selected from the lowest-scoring dimension.
4. The next Meta-harness-improvement task picks the top `PROPOSED` item, applies it, marks it `APPLIED` with the commit SHA.
5. One proposal per scoring. One application per Meta task. Small, reversible, evidence-linked.

## Enforcement (real, not prompt-compliance)

| Gate | Mechanism | What it blocks |
|---|---|---|
| Sprint artifact exists and `Result: PASS` | `scripts/sprint-gate.ps1`, wired into `.git/hooks/pre-push` via `scripts/install-hooks.ps1` | Pushing a branch with no passing sprint. |
| Run log appeared after a Standard+ task | `scripts/run-log-check.ps1` (run by the agent at task end) | Forgetting to log a run. |
| `npm run verify` before commit | Agent discipline + `testing.md` rule | Committing broken build/lint. |
| Sensitive surface touched without Core-risk | `security.md` rule + `security-reviewer` agent | Not auto-enforced yet — see improvement proposals. |

Install the git hook once per clone:
```powershell
pwsh scripts/install-hooks.ps1
```

## Skills actually used by this project

The `.claude/skills/` directory contains many skills; only the following are default-relevant to goriasno (a React/Vite/Tailwind product site). Others may be loaded on explicit request but are not default context.

- **Harness-critical:** `sprint-contract`, `run-logging`, `feature-implementation`, `bug-investigation`, `release-check`, `improve`, `meta-harness-optimize`.
- **Token/context:** `caveman`, `cavecrew`, `caveman-commit`, `caveman-review`.
- **Domain (product site):** `copywriting`, `cro`, `seo-audit`, `ai-seo`, `content-strategy`, `analytics`, `analytics-instrumentation`, `schema`, `social`, `launch`, `marketing-ideas`, `marketing-psychology`, `pricing`, `programmatic-seo`, `site-architecture`, `ab-testing`, `competitor-profiling`, `competitors`, `customer-research`, `product-marketing`, `product-audit`.

Skills **not** default-relevant (available but not loaded by default): `ads`, `ad-creative`, `aso`, `cold-email`, `churn-prevention`, `paywalls`, `referrals`, `revops`, `sales-enablement`, `sms`, `directory-submissions`, `co-marketing`, `public-relations`, `free-tools`, `lead-magnets`, `prospecting`, `community-marketing`.

## Test commands

- `npm run verify` — mandatory minimum pre-commit (`lint` + `build`).
- `npm run dev` — dev server on port 3000.
- `npm run build` — production build.
- `npm run lint` — `tsc --noEmit`.
- Playwright e2e — pending Plan 007.

## Branch / deploy policy

- Default branch: `main`. Staging branch: `staging`.
- Deploy: manual to staging/prod. No auto-deploy.
