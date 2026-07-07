# BRIEFING — 2026-07-06T10:11:00+03:00

## Mission
Execute Plan 025 (Static Pre-render) on the #ГориЯсно# codebase to pre-render the main catalog page (/) into static HTML at build time, ensuring SEO optimization.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: \\wsl.localhost\Ubuntu\home\zelen\dev\goriasno\.agents\orchestrator
- Original parent: parent
- Original parent conversation ID: c9ab1887-953c-4363-9403-0d1dc9413110

## 🔒 My Workflow
- **Pattern**: Project Pattern
- **Scope document**: \\wsl.localhost\Ubuntu\home\zelen\dev\goriasno\.agents\orchestrator\plan.md
1. **Decompose**: We will run a single cycle of Explorer -> Worker -> Reviewer for Plan 025 since it fits within a single iteration loop (focuses on package.json, vite.config.ts, src/main.tsx, and index.html).
2. **Dispatch & Execute**:
   - **Direct (iteration loop)**: We will run the Explorer -> Worker -> Reviewer loop directly for this single milestone.
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: Self-succeed at 16 spawns.
- **Work items**:
  1. Drift Check & Setup [pending]
  2. Implement Step 1 (Install SSG-solution) [pending]
  3. Implement Step 2 (Safe-guard client code) [pending]
  4. Implement Step 3 & 4 (Rewrite Entry/Vite config) [pending]
  5. Implement Step 5 & 6 (Verify Output/E2E tests) [pending]
  6. Final Gate [pending]
- **Current phase**: 1
- **Current focus**: Drift Check & Setup

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- You MAY use file-editing tools ONLY for metadata/state files (.md) in your .agents/ folder.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.
- Zero tolerance for hardcoded test results, facade implementations, or circumventing the intended task.

## Current Parent
- Conversation ID: c9ab1887-953c-4363-9403-0d1dc9413110
- Updated: not yet

## Key Decisions Made
- Use `vite-react-ssg` as the pre-rendering solution (preferred candidate in Step 1).

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| Prerender Explorer 1 | teamwork_preview_explorer | Pre-render exploration | completed | fcf45379-f837-4cc5-aca7-9b74a0c212ea |
| Prerender Explorer 2 | teamwork_preview_explorer | Pre-render exploration | completed | b91e729b-01f8-4e78-ac5b-70abe0e9c079 |
| Prerender Explorer 3 | teamwork_preview_explorer | Pre-render exploration | completed | a85a21aa-6e1e-46a7-8250-418a72deaa20 |
| Prerender Worker | teamwork_preview_worker | Pre-render implementation | in-progress | 5b33949f-402b-43c8-a2e5-ae3a360a324c |

## Succession Status
- Succession required: no
- Spawn count: 4 / 16
- Pending subagents: 5b33949f-402b-43c8-a2e5-ae3a360a324c
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: task-23
- Safety timer: task-98
- On succession: kill all timers before spawning successor
- On context truncation: run `manage_task(Action="list")` — re-create if missing

## Artifact Index
- \\wsl.localhost\Ubuntu\home\zelen\dev\goriasno\.agents\orchestrator\ORIGINAL_REQUEST.md — Verbatim user request
- \\wsl.localhost\Ubuntu\home\zelen\dev\goriasno\.agents\orchestrator\plan.md — Detailed execution steps
- \\wsl.localhost\Ubuntu\home\zelen\dev\goriasno\.agents\orchestrator\progress.md — Checklist & status tracking
