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

- Build/Typecheck: `npm run build`
- Dev server: `npm run dev`

## Branch/deploy policy

- Default branch: main
- Staging branch: staging
- Deploy policy: Manual deploy to staging/prod

## Safety

Do not touch secrets, environment files, production data, destructive operations, or production deploy logic without explicit approval.

## Local harness

Read project rules under `.claude/rules/` when relevant.
Use `docs/harness/README.md` for project harness details.
Log every Standard, Complex, Core-risk, Research-only, and Meta-harness task under `docs/ai-runs/`.
Trivial tasks may be skipped only when they create no durable change and expose no workflow issue.
Update `docs/ai-runs/harness-scores.md` after every five required logs and after any failed, rolled-back, security-sensitive, or high-friction run.

**Required Plugins & Skills:**
Always proactively use **caveman** (to optimize token usage and communication), **context-mode** (for searching and processing large outputs safely), and **agentmemory** (to recall and preserve context across sessions) throughout your workflow.

