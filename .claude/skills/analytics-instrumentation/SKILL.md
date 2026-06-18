---
name: analytics-instrumentation
description: Use when adding or reviewing product analytics events.
---

# Analytics Instrumentation Skill

## Goal
Add useful analytics without tracking sensitive data.

## Steps
1. **Define Product Questions**: What user behaviors do we want to understand?
2. **Map User Flow**: Identify the conversion funnel steps.
3. **Choose Events**: Map actions to standardized event keys.
4. **Define Properties**: Attach required metadata parameters.
5. **Implement Tracking**: Insert PostHog or custom logging commands.
6. **Verify**: Ensure the events trigger correctly in local logs.

## Rules
- Track behavior, not vanity.
- Do not track sensitive personal data.
- Keep event names consistent.
