---
name: feature-implementation
description: Use when implementing or modifying a product feature with minimal safe changes.
---

# Feature Implementation Skill

## Goal
Build the smallest correct version of a feature.

## Steps
1. **Understand User Outcome**: Define the user story and objective.
2. **Inspect Relevant Files**: Find affected files in `web/` or `backend/`.
3. **Identify Patterns**: Look for existing coding styles and implementation styles.
4. **Minimal Plan**: Plan a localized change.
5. **Implement Small Diff**: Focus on minimal changes to avoid side-effects.
6. **Verify**: Test endpoints, run syntax checks, and confirm visual styling.
7. **Summarize**: Present the changed files, any risks, and immediate next steps.

## Rules
- Do not overengineer. Keep the solution simple.
- Do not introduce dependencies unless necessary.
- Do not touch auth, payments, secrets, or production config without approval.
