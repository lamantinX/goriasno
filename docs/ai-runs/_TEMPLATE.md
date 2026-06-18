# AI Run: <title>

> Copy this file to `docs/ai-runs/<YYYY-MM-DD>-<slug>.md`. Fill every section. Do not remove sections — write `N/A` with a reason if a section does not apply. This template is enforced by `scripts/run-log-check.sh`.

## Meta
- **Date:** <YYYY-MM-DD>
- **Task Class:** Trivial | Standard | Complex | Core-risk | Research-only | Meta-harness
- **Trigger:** <user instruction or command that started this run>
- **Status:** SUCCESS | FAILED | ROLLED-BACK | PARTIAL
- **Tags:** <optional: SECURITY-SENSITIVE | HIGH-FRICTION | META — a tag triggers immediate harness scoring>

## Scope
- **Goal:** <one sentence>
- **Files in (modified):** <paths>
- **Files out (read only):** <paths>
- **Sensitive surfaces touched:** <list per `security.md`, or "none">

## Plan reference
- **Sprint artifact:** `docs/sprints/<slug>.md` (or `.trivial` reason, or "N/A — Research-only")
- **Approved plan:** `plans/<NNN>-<slug>.md` (Complex/Core-risk only, or "N/A")

## Changes
<bullet list of what changed, each traced to a Contract criterion. No unrelated changes — if any exist, explain why under Workflow.>

## Evidence
<for each Contract criterion: `command` → result. Plus `npm run verify` output. Skipped checks: name + reason + remaining risk.>

- `npm run verify` → <pass/fail + key lines>
- Criterion 1: `<cmd>` → <result>
- Criterion 2: `<cmd>` → <result>
- Skipped: <check> — <reason> — remaining risk: <risk>

## Failures / Rework
<any dead ends, failed approaches, rework. "None" is valid. This section is evidence for the `speed` and `user friction` scoring dimensions.>

## Workflow notes
<any harness friction: tool failures, sandbox restrictions, missing infra, rule gaps. These feed the meta-harness improvement loop. "None" is valid.>

## Outcome
<one line: what is now true that was not before. Followed by next step, if any.>
