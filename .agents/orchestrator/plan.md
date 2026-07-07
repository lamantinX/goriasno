# Plan: Plan 025 - Static Pre-render

This plan details the steps required to implement static pre-rendering for the home page (/) using `vite-react-ssg` on the #ГориЯсно# codebase.

## Milestones

1. **Drift Check & Setup**: Check file changes since the planned commit `dadeef4`.
2. **Solution Evaluation & Installation**: Install `vite-react-ssg` and ensure package compatibility with React 19 and Vite 6.
3. **Environment Audit**: Check client-only code in `src/` to ensure no top-level `window`/`document` access that breaks SSR.
4. **Integration**:
   - Rewrite `src/main.tsx` for `vite-react-ssg` entry point.
   - Configure `vite.config.ts` to include `ssgOptions`.
5. **Verification**:
   - Verify static content and schema in the generated `dist/index.html`.
   - Run E2E Playwright tests to verify hydration.
6. **Documentation & Finalization**: Update `plans/README.md` status to `DONE` and report back.

## Interface Contracts
No new cross-module interfaces are introduced. Standard React component structures are preserved.
