# BRIEFING — 2026-07-06T10:18:00+03:00

## Mission
Implement Plan 025 (Static Pre-render) on the #ГориЯсно# codebase using vite-react-ssg.

## 🔒 My Identity
- Archetype: teamwork_preview_worker
- Roles: implementer, qa, specialist
- Working directory: \\wsl.localhost\Ubuntu\home\zelen\dev\goriasno\.agents\teamwork_preview_worker_prerender_1
- Original parent: e3a532c4-7e6d-4b9b-b80a-b02f582b1abc
- Milestone: Static Pre-render

## 🔒 Key Constraints
- CODE_ONLY network mode: No external internet access, no curl, wget, lynx.
- Install specific vite-react-ssg@0.9.0.
- Guard Service Worker registration with `typeof window !== 'undefined'`.
- Modify src/main.tsx to use ViteReactSSG.
- Do not cheat, hardcode, or create dummy implementations.

## Current Parent
- Conversation ID: e3a532c4-7e6d-4b9b-b80a-b02f582b1abc
- Updated: 2026-07-06T10:18:00+03:00

## Task Summary
- **What to build**: Pre-rendering for the home page and other pages via `vite-react-ssg`.
- **Success criteria**: Compile/build succeeds, lint succeeds, dist/index.html has static markup and JSON-LD schema, hydration works, Playwright tests pass, plan status set to DONE, handoff and send_message sent.
- **Interface contracts**: \\wsl.localhost\Ubuntu\home\zelen\dev\goriasno\PROJECT.md
- **Code layout**: \\wsl.localhost\Ubuntu\home\zelen\dev\goriasno\PROJECT.md

## Key Decisions Made
- Use WSL path \\wsl.localhost\Ubuntu\home\zelen\dev\goriasno as workspace root.

## Change Tracker
- **Files modified**: None yet.
- **Build status**: Unknown.
- **Pending issues**: None.

## Quality Status
- **Build/test result**: Unknown.
- **Lint status**: Unknown.
- **Tests added/modified**: None.

## Loaded Skills
- **Source**: antigravity-guide
- **Local copy**: C:\Users\zelen\.gemini\antigravity\builtin\skills\antigravity_guide\SKILL.md
- **Core methodology**: Guide to Antigravity CLI and setup.

## Artifact Index
- \\wsl.localhost\Ubuntu\home\zelen\dev\goriasno\.agents\teamwork_preview_worker_prerender_1\ORIGINAL_REQUEST.md — Original request content
