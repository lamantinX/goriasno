---
name: run-logging
description: Create a run-log file in docs/ai-runs/ after completing a Standard/Complex/Core-risk/Research-only/Meta task. Use at task completion, right after the sprint evaluation passes.
---

# Run logging

Create **one file per run** at `docs/ai-runs/<YYYY-MM-DD>-<slug>.md` from `docs/ai-runs/_TEMPLATE.md`. This is the canonical format — every run log in this project is a standalone file, not a row in a shared table.

## When to log

- **Always:** Standard, Complex, Core-risk, Research-only, Meta-harness tasks.
- **Trivial:** skip **only if** no durable change AND no workflow issue surfaced. Otherwise log.

## How

Scaffold and fill every section of `docs/ai-runs/_TEMPLATE.md`:

- **Meta** — Date, Task Class, Trigger, Status (`SUCCESS`/`FAILED`/`ROLLED-BACK`/`PARTIAL`), Tags. A `SECURITY-SENSITIVE`/`HIGH-FRICTION`/`META` tag triggers **immediate** harness scoring.
- **Scope** — Goal, Files in (modified), Files out (read only), Sensitive surfaces touched (per `security.md`, or "none").
- **Changes** — bullet list, each traced to a Contract criterion. No unrelated changes.
- **Evidence** — for each Contract criterion: `command` → result, plus `npm run verify`. Skipped checks need name + reason + remaining risk.
- **Failures / Rework** — dead ends, rework. "None" is valid. Feeds the `speed` and `user friction` scoring dimensions.
- **Workflow notes** — harness friction. Feeds the meta-harness improvement loop.
- **Outcome** — one line: what is now true that was not before.

This log is enforced by `scripts/run-log-check.sh` (run by the agent at task end) and feeds the 7-dimension scoring in `docs/ai-runs/harness-scores.md`.
