# AGENTS.md — goriasno

This is the project-level cross-agent contract.

## Project

- Name: goriasno
- Stack: React (Vite), TypeScript, Tailwind CSS, Lucide React

## Default workflow

1. Classify task.
2. Load the smallest relevant context.
3. Make the smallest safe change.
4. Run targeted verification.
5. Log every required run before the final response.

## Task classes

- Trivial
- Standard
- Complex
- Core-risk
- Research-only
- Meta-harness improvement

## Critical areas

- Landing page structure
- Contact forms
- Mobile responsiveness

## Test commands

- Verify (mandatory pre-commit): `npm run verify` (= `lint` + `build`)
- Build/Typecheck: `npm run build`
- Lint: `npm run lint`
- Dev server: `npm run dev`
- Playwright e2e: pending Plan 007

## Branch/deploy policy

- Default branch: main
- Staging branch: staging
- Deploy policy: Manual deploy to staging/prod

## Safety

Do not touch secrets, environment files, production data, destructive operations, or production deploy logic without explicit approval. Sensitive surfaces are listed in `.claude/rules/security.md`; touching any requires Core-risk tier + approval.
**Rule: Always check the code and run `npm run verify` before making a commit. Never commit unverified code.**

## Local harness

- Read project rules under `.claude/rules/` when relevant (always read `task-routing.md` before classifying a task).
- Use `docs/harness/README.md` for the full harness map, meta-harness loop, and enforcement table.
- Log every Standard, Complex, Core-risk, Research-only, and Meta-harness task under `docs/ai-runs/` **using `docs/ai-runs/_TEMPLATE.md`**. Trivial tasks may be skipped only when they create no durable change and expose no workflow issue.
- Create a sprint artifact under `docs/sprints/` for every Standard+ task (scaffold via `scripts/sprint-artifacts.sh`).
- Update `docs/ai-runs/harness-scores.md` after every five required logs and **immediately** after any run tagged `FAILED`, `ROLLED-BACK`, `SECURITY-SENSITIVE`, or `HIGH-FRICTION`.
- After each scoring, append one proposal to `docs/ai-runs/harness-improvements.md` (the meta-harness loop).

## Enforcement (real, not prompt-compliance)

- **Sprint gate:** `scripts/sprint-gate.sh` checks that `docs/sprints/<slug>.md` exists and contains `Result: PASS`. Wired into `.git/hooks/pre-push` by `scripts/install-hooks.sh` (run once per clone). Blocks push on a failing/missing sprint.
- **Run-log check:** `scripts/run-log-check.sh` verifies a new entry appeared in `docs/ai-runs/` for Standard+ tasks. Run by the agent at task end.
- **Verify gate:** `npm run verify` must pass before any commit that touches `src/`, `public/`, `server.js`, or `package.json`.

## Required skills

Always proactively use **ponytail** (lazy senior dev mode — simplest minimal solution) throughout the workflow. Keep raw bytes out of the conversation — see `.claude/rules/context-budget.md`.

The default-relevant skill allowlist for this project lives in `docs/harness/README.md` ("Skills actually used by this project"). Load others only on explicit request.

