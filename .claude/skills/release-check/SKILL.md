---
name: release-check
description: Use before deployment, release, or production-impacting changes.
---

# Release Check Skill

## Goal
Reduce risk before release.

## Checklist
- Build passes (`npm run build` or syntax validation).
- Tests pass (`npm test`).
- Typecheck/Syntax checks pass.
- Main user flows (search, translate, payment session creation) work.
- No secrets or keys committed.
- Environment variables checked.
- Auth/payment flows verified.
- Rollback path known.

## Output
- **Go / No-Go**: Recommendation to deploy or hold.
- **Risks**: Any potential release hazards.
- **Failed Checks**: Failed safety audits.
- **Next Actions**: Action plan to resolve failures.
