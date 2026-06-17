# Sprint: <title>

> Copy this file to `docs/sprints/<slug>.md`. Scaffold via `pwsh scripts/sprint-artifacts.ps1 sprint -s <slug> -t "Title" -c Standard`. Replace `Result: PENDING` with the real verdict after evaluating.

Branch: <branch> · Date: <YYYY-MM-DD> · Class: Trivial | Standard | Complex | Core-risk

## Sprint
**Goal:** <one sentence>
**Scope:** in — <files/areas this sprint may touch>; out — <explicitly out of scope>
**Risks:** <what could go wrong; sensitive surfaces per `security.md`>
**Context budget:** Tiny | Medium | Large | Core — <files planned to load>

## Contract
<Each criterion must be verifiable by a concrete command or Playwright step. "Works correctly" is not a criterion.>

1. <criterion 1, verifiable>
2. <criterion 2, verifiable>
3. …

## Critique
<Standard/Complex: self-critique — edge cases, error states, responsive design, sensitive surfaces.>
<Core-risk: `hostile-evaluator` critique-mode findings + how criteria were expanded.>

## Evidence
<For each criterion: command + captured output. Plus `npm run verify`. Skipped checks with reason + remaining risk.>

- `npm run verify` → <result>
- Criterion 1: `<cmd>` → <result>
- Criterion 2: `<cmd>` → <result>
- Skipped: <check> — <reason> — remaining risk: <risk>

## Evaluation
<Standard/Complex: self-evaluation verdict against the Contract.>
<Core-risk: `hostile-evaluator` evaluation-mode verdict; failures + repro steps; fixes applied.>

Result: PENDING | PASS | PASS (Self-Evaluated) | FAIL
