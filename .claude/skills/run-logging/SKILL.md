---
name: run-logging
description: Append a one-line run record to docs/ai-runs/ after completing a Standard/Complex/Core task. Use at task completion, right after the sprint evaluation passes.
---

# Run logging

Append exactly one row to `docs/ai-runs/<YYYY-MM>.md` (create the file with the header below if the
month is new). One line, no prose.

```markdown
# AI run log — <YYYY-MM>

| Date | Task | Class | Plan? | Approved? | Files read≈/changed | Tests | Result | Context note | Improvement idea |
|---|---|---|---|---|---|---|---|---|---|
```

Column rules:
- **Class**: Trivial rows are not logged; Research only if it produced a decision worth tracking.
- **Plan?**: `y` if `improve plan` (or an equivalent plan file in `plans/`) was used.
- **Approved?**: `y` if the user approved the plan before execution; `—` when no plan was required.
- **Files read≈/changed**: rough count, e.g. `12/3`. Honesty over precision.
- **Result**: `ok` / `ok-after-fix` / `fail` (+ one word why).
- **Context note**: what wasted tokens or what saved them. `—` if nothing notable.
- **Improvement idea**: one short harness improvement suggestion, or `—`. These feed Meta tasks
  (`docs/harness/README.md`).
