# Project Harness — goriasno

Global-Harness-Version: 0.2.0
Project-Harness-Version: goriasno-v1
Last-Sync: YYYY-MM-DD
Local-Overrides:

## Structure

- `AGENTS.md`: cross-agent contract.
- `CLAUDE.md`: Claude entrypoint.
- `.claude/rules/`: task and domain rules.
- `.claude/skills/`: workflows.
- `.claude/agents/`: specialist agents.
- `docs/ai-runs/`: run logs.
- `docs/ai-runs/harness-scores.md`: cumulative evidence-based score log.

## Meta-harness

Log all required runs before the final response. Score each five-run sample, and score exceptions immediately. Select one next improvement from evidence.

