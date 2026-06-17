# Context Budget

Start small. Escalate only with a named reason. Every byte loaded into conversation costs reasoning capacity for the whole session.

## Tiers (mirrors task-routing)

- **Tiny:** ≤5 relevant files.
- **Medium:** ≤15 relevant files.
- **Large:** Complex/Core-risk only, after plan approval.
- **Core:** strictest — every loaded file needs a stated reason.

## What counts as a "relevant file"

A file is relevant only if **one** holds:
- named in the task or in the approved plan;
- in the sprint scope (`in — …`);
- surfaced by a scoped search returning ≤20 results;
- a rule/contract file the task tier requires (`AGENTS.md`, `.claude/rules/*`, `docs/harness/README.md`).

A file is **not** relevant just because it is in the same directory.

## Escalation rule

Tiny → Medium only when Tiny proved insufficient (name the file you still need).
Medium → Large only after the plan is approved.
Never load the whole repo.

## Keep raw bytes out of the conversation

- Multi-command gathers → `ctx_batch_execute` (auto-indexes, returns matched sections).
- File analysis (line counts, pattern matches, aggregates) → `ctx_execute_file` / `ctx_execute`. Print only the derived answer.
- Recall (prior decisions, past runs) → `ctx_search` / `agentmemory`.
- Web content → `ctx_fetch_and_index`; retrieve sections via `ctx_search`.
- **Forbidden:** pasting >5KB of raw command output or file content into the conversation when a `ctx_*` tool could derive the answer in-sandbox.

## Forbidden

- `Get-ChildItem -Recurse` from repo root into context (use `glob` / `ctx_execute` for structure).
- Reading a file you will not edit, "for context", without a named reason.
- Loading >15 files without an approved plan.
