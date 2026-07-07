## 2026-07-06T07:16:39Z
You are a teamwork_preview_worker. Your working directory is \\wsl.localhost\Ubuntu\home\zelen\dev\goriasno\.agents\teamwork_preview_worker_prerender_1.
Your mission is to implement Plan 025 (Static Pre-render) on the #ГориЯсно# codebase.
Please read and follow the requirements in:
- \\wsl.localhost\Ubuntu\home\zelen\dev\goriasno\PROJECT.md
- \\wsl.localhost\Ubuntu\home\zelen\dev\goriasno\plans\025-static-prerender-home.md
- Synthesis report: \\wsl.localhost\Ubuntu\home\zelen\dev\goriasno\.agents\orchestrator\analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Specifically, you need to perform the following:
1. Install the specific version of `vite-react-ssg` that supports React 19 and Vite 6, which is `vite-react-ssg@0.9.0` (as a devDependency).
2. Modify `src/main.tsx` to:
   - Use `ViteReactSSG` wrapper.
   - Export `createApp`.
   - Guard the Service Worker registration code with `typeof window !== 'undefined'` so it does not run in Node during build.
3. Update `vite.config.ts` to add the `ssgOptions`.
4. Run `npm run build` and `npm run lint` to verify that compile and build complete with exit code 0.
5. Verify that `dist/index.html` contains static HTML content (such as headings, product catalog, and contact information) and preserving the JSON-LD schema.
6. Verify that the app hydrates successfully on the client without regressions. Run E2E tests via Playwright (`npm run test`) to confirm that all tests pass.
7. Update the status of Plan 025 in `plans/README.md` to `DONE`.
8. Write a clear handoff report (`\\wsl.localhost\Ubuntu\home\zelen\dev\goriasno\.agents\teamwork_preview_worker_prerender_1\handoff.md`) with passing build/test results.
9. Report back to the parent orchestrator via send_message when complete.
