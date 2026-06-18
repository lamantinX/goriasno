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

This environment exposes file/search tools (Glob, Grep, Read, Bash) and a Task/Agent delegation tool. Use them to keep raw output out of the conversation:

- Multi-file structure questions → **Glob** (pattern match, returns paths only, not contents).
- Content searches across many files → **Grep** (ripgrep; use `output_mode: count`/`files_with_matches` to avoid dumping matches; scope with `glob`/`type`).
- Large file inspection → **Read** with `offset`/`limit` rather than the whole file when only a section is needed.
- Bulk operations / derived answers (counts, aggregates, pattern hits) → a focused **Bash** command that prints only the derived answer (e.g. `rg -c`, `wc -l`), not the raw input.
- Sweeps across many files/dirs where you only need the conclusion → delegate to an **Explore** agent; it reads excerpts and returns the finding, not the file dumps.
- **Forbidden:** pasting >5KB of raw command output or file content into the conversation when a scoped tool could derive the answer.

## Forbidden

- `find`/`ls -R` from repo root into context (use **Glob** for structure).
- Reading a file you will not edit, "for context", without a named reason.
- Loading >15 files without an approved plan.
