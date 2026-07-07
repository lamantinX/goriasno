# Handoff Report — Static Pre-render Exploration (Milestone 1)

This report summarizes the findings of the static pre-rendering exploration using `vite-react-ssg`.

## 1. Observation
- **Codebase Drift**: We ran `git diff --stat dadeef4..HEAD -- index.html src/main.tsx src/App.tsx vite.config.ts package.json` in the `/home/zelen/dev/goriasno` directory and it returned no output (exit code 0), meaning there is no drift from the plan's baseline.
- **Package Compatibility**:
  - The project runs React version `^19.0.1` and Vite version `^6.2.3` (verified in `package.json`).
  - We ran `npm info vite-react-ssg peerDependencies` and got:
    ```json
    {
      "react": "^17.0.2 || ^18.0.0 || ^19.0.0",
      "react-dom": "^17.0.2 || ^18.0.0 || ^19.0.0",
      "vite": "^2.0.0 || ^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0"
    }
    ```
  - We ran `npm info vite-react-ssg peerDependenciesMeta` and confirmed:
    ```json
    {
      "react-router-dom": { "optional": true }
    }
    ```
  - Dry-run validation via `npm install --dry-run -D vite-react-ssg` completed cleanly with exit code 0.
- **Client-Only References**:
  - Ripgrep search of `src/` for `window.` returned:
    ```
    src/main.tsx:13:  window.addEventListener('load', () => {
    ```
    which resides in the top-level block:
    ```tsx
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => { ... })
    }
    ```
  - Scanning for `document.` returned no top-level references that are active during module load (all document access is wrapped inside component hooks or user action handlers).
  - Scanning for `localStorage.` returned references in `src/App.tsx` at lines 41 and 56, both within `useEffect` or callbacks (safe).
- **Baseline Test Suite**:
  - The E2E suite was executed (`wsl npm run test`). Out of 12 tests (4 tests x 3 browsers), 8 passed successfully (Chromium and Firefox).
  - 4 tests failed on WebKit because of missing WSL system dependencies for WebKit launch (`browserType.launch: Host system is missing dependencies to run browsers`). This is a test-runner host environment limitation, and not a bug in the application codebase.


## 2. Logic Chain
- **Conflict/Drift**: Since `git diff --stat` against the plan's base commit `dadeef4` shows zero changes on the target files, the files in scope are 100% aligned with the execution plan.
- **Package Compatibility**: Since `vite-react-ssg`'s peer dependencies match the project's React (`19.0.1`) and Vite (`6.2.3`) versions, and dry-run installation exits with code 0, the library is fully compatible with our stack. Because `react-router-dom` is marked as optional in `peerDependenciesMeta`, we do not need to install it for Milestone 1's single-page prerendering.
- **Client-Only References**: Since `navigator` and `window` in `src/main.tsx:12-20` execute at import time, they will crash Node.js pre-rendering where these objects are undefined. Because all other references to `window`, `document`, and `localStorage` are safely wrapped in component handlers or `useEffect` (which is skipped on the server), they will not run on the server.
- **Actionable Steps**: Guarding the Service Worker registration in `src/main.tsx` using `typeof window !== 'undefined'` and wrapping `createRoot` via `ViteReactSSG` will prevent the server crash and allow clean pre-rendering.

## 3. Caveats
- Since this is a read-only investigation, the changes were not implemented and verified at build time. The actual behavior of the `vite-react-ssg` build execution (e.g. static HTML output verification) must be validated by the Implementer agent.
- `react-router-dom` is optional for this milestone but will become mandatory in Milestone 2.

## 4. Conclusion
Integrating `vite-react-ssg` for static pre-rendering of `/` is fully feasible and compatible with the current stack of React 19 and Vite 6. To avoid server-side crashes during pre-rendering, a single top-level client-only guard is required around the Service Worker registration in `src/main.tsx`.

## 5. Verification Method
- **Verification Commands**:
  - Execute `npm install -D vite-react-ssg` (must complete with exit 0).
  - Apply proposed changes to `src/main.tsx` and `vite.config.ts`.
  - Execute `npm run build` (must compile and output pre-rendered markup).
  - Verify that `dist/index.html` size is greater than 10KB (was ~4KB).
  - Check content inclusion: `grep -c -E '<h1|<h2|антрацит|Дрова' dist/index.html` must return `>0`.
  - Check schema preservation: `grep -c 'application/ld+json' dist/index.html` must return `≥1`.
  - Execute `npm run test` to verify that client-side hydration passes E2E checks in Playwright.
