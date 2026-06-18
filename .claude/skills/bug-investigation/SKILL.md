---
name: bug-investigation
description: Use when investigating and fixing bugs, regressions, UI issues, API errors, or broken flows.
---

# Bug Investigation Skill

## Goal
Find and fix the root cause of a bug.

## Steps
1. **Expected vs Actual**: Define expected vs actual behavior clearly.
2. **Reproduction Path**: Establish how to trigger the bug.
3. **Inspect Related Files**: Locate code files using grepping or trace reviews.
4. **Form Hypotheses**: Develop theories for root cause.
5. **Test Smallest Hypothesis**: Run tests or code audits starting with simplest theories.
6. **Fix Root Cause**: Resolve the bug at its source, not just its surface symptoms.
7. **Verify Regression Path**: Confirm the fix works and has not broken other features.

## Output
- **Root Cause**: Why the bug occurred.
- **Files Changed**: Paths modified.
- **Verification**: Evidence of verification (curl outputs, tests, etc.).
- **Remaining Risks**: Remaining vulnerabilities.
