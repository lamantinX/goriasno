# Handoff Report: Milestone 1 (Static Pre-render) Exploration

This report summarizes findings and provides a verified, executable plan for implementing static HTML pre-rendering of the home page.

## 1. Observation
* **No Code Drift**: Ran the drift check command `wsl git diff --stat dadeef4..HEAD -- index.html src/main.tsx src/App.tsx vite.config.ts package.json` and it returned no output. Files are exactly as they were at commit `dadeef4`.
* **Package Compatibility**:
  - `wsl npm info vite-react-ssg@0.9.0 peerDependencies` output:
    ```json
    {
      "vite": "^2.0.0 || ^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0",
      "react": "^17.0.2 || ^18.0.0 || ^19.0.0",
      "react-dom": "^17.0.2 || ^18.0.0 || ^19.0.0",
      "react-router-dom": "^6.14.1"
    }
    ```
  - Inspecting `node_modules/vite-react-ssg/dist/shared/vite-react-ssg.DTTf7HZy.mjs` confirmed version checks for React 19:
    ```js
    const isReact19 = Number((version || "").split(".")[0]) > 18;
    ```
  - `package.json` for `vite-react-ssg` specifies `react-router-dom` in `peerDependenciesMeta` as `optional: true`.
* **Top-Level Globals**:
  - `wsl bash -c "grep -rnE 'window|document|localStorage|navigator|sessionStorage' src/"` output:
    ```
    src/components/Modal.tsx:42:      document.body.style.overflow = "hidden";
    src/components/Modal.tsx:44:      document.body.style.overflow = "unset";
    src/components/Modal.tsx:47:      document.body.style.overflow = "unset";
    src/components/Modal.tsx:59:    document.addEventListener("keydown", handleKey);
    src/components/Modal.tsx:60:    return () => document.removeEventListener("keydown", handleKey);
    src/components/Modal.tsx:72:    if (e.shiftKey && document.activeElement === first) {
    src/components/Modal.tsx:75:    } else if (!e.shiftKey && document.activeElement === last) {
    src/components/Header.tsx:31:    const element = document.getElementById(id);
    src/components/Hero.tsx:38:    const element = document.getElementById("catalog");
    src/components/Hero.tsx:45:    const element = document.getElementById("contacts");
    src/App.tsx:41:    const savedSubmissions = localStorage.getItem("goriyasno_mockup_submissions");
    src/App.tsx:53:  // Save submissions to localStorage when changed
    src/App.tsx:56:    localStorage.setItem("goriyasno_mockup_submissions", JSON.stringify(updatedSubmissions));
    src/main.tsx:6:createRoot(document.getElementById('root')!).render(
    src/main.tsx:12:if ('serviceWorker' in navigator) {
    src/main.tsx:13:  window.addEventListener('load', () => {
    src/main.tsx:16:    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
    ```
* **E2E Tests**:
  - Running `wsl npm run test -- --project=chromium --project=firefox` succeeded, showing:
    ```
    Running 8 tests using 4 workers
    ...
    8 passed (39.5s)
    ```
  - Playwright webkit tests failed due to missing host libraries in the WSL environment: `Host system is missing dependencies to run browsers. Please install them with the following command: sudo npx playwright install-deps`

---

## 2. Logic Chain
1. **Drift-Free State**: Since `git diff --stat dadeef4..HEAD` returned no output (Observation 1), we can confidently proceed with the changes outlined in Plan 025 without conflicts.
2. **React 19 & Vite 6 Compatibility**: Peer dependencies of `vite-react-ssg@0.9.0` allow React 19 and Vite 6, and the source bundle has specific handling for React 19 client APIs (Observation 2). Therefore, the plugin is compatible with the project stack.
3. **Optional Peer Dependency Warning Avoidance**: Since `react-router-dom` is a peer dependency of `vite-react-ssg` (Observation 2) and contains dynamic import blocks inside the SSG build process, failing to install it may lead to Vite bundling or resolve warnings. Recommending its installation alongside `vite-react-ssg` is the most stable approach.
4. **Client-Side Safe Components**: All `window`, `document`, and `localStorage` references inside components (`src/App.tsx` and `src/components/*`) are encapsulated in standard React lifecycle hooks or event listeners (Observation 3). Therefore, they will not run during SSR and will not crash the server-side build.
5. **Entry Point SSR Blocker**: In `src/main.tsx`, `navigator` and `window` are accessed at the top level outside of any client checks (Observation 3). Because the SSG build imports this file in Node.js, these references will cause a crash due to undefined globals. Guarding the block with `typeof window !== 'undefined'` is necessary.
6. **WebKit Environment Caveat**: E2E tests run successfully on Chromium and Firefox, but fail on WebKit due to WSL dependencies (Observation 4). Verifications must be focused on Chromium and Firefox to avoid environment false-negatives.

---

## 3. Caveats
* The E2E WebKit tests will fail on the host environment unless `sudo npx playwright install-deps` is run first. Testing is targeted to `--project=chromium --project=firefox`.
* Single-page mode `vite-react-ssg/single-page` was analyzed and confirmed to only build `/` when no route array is provided, which matches our target scope.

---

## 4. Conclusion
Integrating `vite-react-ssg` is fully viable and compatible with React 19 and Vite 6. To avoid build failures, the top-level service worker check in `src/main.tsx` must be wrapped in a `typeof window !== 'undefined'` guard. The single-page API (`vite-react-ssg/single-page`) is recommended as it keeps the runtime simple and free of router boilerplate.

---

## 5. Verification Method
After implementation, verify using:
1. **TypeScript Typecheck**:
   ```bash
   npm run lint
   ```
   (Must exit 0 with no errors).
2. **Build and Output Check**:
   ```bash
   npm run build
   ```
   Ensure `dist/index.html` contains:
   - Orbs, catalog items, and footer contents (e.g. `grep -c -E '<h1|<h2|антрацит' dist/index.html` is `>0`).
   - JSON-LD tags (`grep -c 'application/ld+json' dist/index.html` is `>=1`).
3. **E2E Validation**:
   ```bash
   npx playwright test --project=chromium --project=firefox
   ```
   (Must show 8 passed tests).
