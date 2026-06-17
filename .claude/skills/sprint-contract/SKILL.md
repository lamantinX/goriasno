---
name: sprint-contract
description: Use for every non-trivial task (any change beyond a typo/docs/config one-liner) — Plan → Contract → Evaluate workflow with sprint artifacts. Required before a PR can be opened (enforced by the sprint-gate hook). Tier comes from the task class in .claude/rules/task-routing.md.
---

# Sprint / Contract Workflow

You are the **architect**: plan, contract, delegate narrow pieces, review, verify. Never mark work
complete because it "looks done" — evidence is required.

## Tier = task class (see `.claude/rules/task-routing.md`)

1. **Trivial** — skip the workflow. Create `docs/sprints/<branch-slug>.trivial` with a one-line reason.
2. **Standard** (default) — streamlined: create `docs/sprints/<branch-slug>.md`, do **Self-Critique**
   and **Self-Evaluation** (no external evaluator rounds). End Evaluation with `Result: PASS (Self-Evaluated)`.
3. **Complex** — Standard sprint file + the task must have gone through `improve plan` → user approval
   → `improve execute` first (the plan in `plans/` is the Sprint+Contract source; reference it).
4. **Core-risk** — full workflow with external rounds: `hostile-evaluator` in critique AND evaluation
   modes, `security-reviewer` on auth/billing surfaces. End with `Result: PASS`.

## Phases

### 1. Plan (Planner)
- Restate the goal. Inspect the relevant files — never assume layout.
- Write the **Sprint** section: goal, scope (files in/out), risks.

### 2. Contract
- Acceptance criteria, each **verifiable by a concrete command or Playwright step** —
  "works correctly" is not a criterion; "POST /api/x returns 403 for free plan" is.

### 3. Critique
- **Standard/Complex**: quick self-critique — edge cases, error states, responsive design.
- **Core-risk**: dispatch `hostile-evaluator` in **critique mode**; expand criteria until it finds no gaps.

### 4. Implement
- Minimal diff. No unrelated refactors. Preserve API contracts and existing behavior.
- Delegate narrow self-contained subtasks to a subagent (Task tool / `cavecrew`); review every delegated diff before accepting. Compressed subagent output preserves main-context capacity.
- Optional polish for Complex/Core: run `/simplify` or the code-simplifier plugin agent on modified files.

### 5. Verify
- Verify **every** criterion; record command + output in the Evidence section.
- UI work → Playwright, desktop (1280×720) and mobile (375×667), states: loading, empty, error.
- Targeted tests per the Test Policy in AGENTS.md.

### 6. Evaluate
- **Standard/Complex**: self-evaluation verdict against the contract.
- **Core-risk**: dispatch `hostile-evaluator` in **evaluation mode**; failures go into the sprint file;
  fix and re-evaluate.

## Completion checklist

`docs/sprints/<slug>.md` must contain: Sprint, Contract with precise criteria, Evidence
(command/output per criterion), Evaluation ending in `PASS` or `PASS (Self-Evaluated)`.
The sprint-gate hook (`scripts/sprint-gate.ps1`, wired into `.git/hooks/pre-push` by
`scripts/install-hooks.ps1`) blocks `git push` until this holds. Then append the run-log
(`docs/ai-runs/<YYYY-MM-DD>-<slug>.md` per `docs/ai-runs/_TEMPLATE.md`).

Scaffold both artifacts with `scripts/sprint-artifacts.ps1` (PowerShell — the project is
Windows-first; `.sh` references are obsolete):
```
pwsh scripts/sprint-artifacts.ps1 sprint  -s <slug> -t "Title" -c <Class>
pwsh scripts/sprint-artifacts.ps1 trivial -s <slug> "reason"
pwsh scripts/sprint-artifacts.ps1 runlog  -s <slug> "Title"
```
It ships the skeleton with `Result: PENDING`, which you replace with the real verdict after
evaluating. Create them yourself as part of finishing the task — don't ask the user first.

## Sprint file template

```markdown
# Sprint: <title>
Branch: <branch> · Date: <YYYY-MM-DD> · Class: <Standard|Complex|Core-risk>

## Sprint
Goal: …
Scope: in — …; out — …
Risks: …

## Contract
1. <precise, verifiable criterion>
2. …

## Critique
<Standard/Complex: self-critique notes / Core: hostile-evaluator findings + how criteria were expanded>

## Evidence
1. <criterion 1>: `<command>` → <result>
…

## Evaluation
<Standard/Complex: self-evaluation verdict / Core: hostile-evaluator verdict, failures + repro steps>
Result: PASS | PASS (Self-Evaluated) | FAIL
```
