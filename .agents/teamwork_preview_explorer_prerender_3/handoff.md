# Handoff Report: Static Pre-render (Milestone 1) Exploration

## 1. Observation

### Drift & Conflict Check
A comparison was conducted between the planned commit `dadeef4` and the current repository `HEAD` to inspect changes in files under scope: `index.html`, `src/main.tsx`, `src/App.tsx`, `vite.config.ts`, and `package.json`.
* Command: `git diff --stat dadeef4..HEAD -- index.html src/main.tsx src/App.tsx vite.config.ts package.json`
* Result: The command produced empty output, confirming that the files are in their expected state with zero drift or conflicts.

---

### Package Compatibility (Vite 6 + React 19)
The project codebase currently runs on **React 19.0.1** and **Vite 6.2.3**, as observed in `package.json`:
```json
"dependencies": {
  "react": "^19.0.1",
  "react-dom": "^19.0.1",
  "vite": "^6.2.3"
}
```

A dry-run installation of `vite-react-ssg` was performed to evaluate dependency resolution:
1. Running `npm install -D vite-react-ssg --dry-run` failed due to peer dependency mismatches because the registry default `latest` tag points to version `0.5.1`.
   * Verbatim output:
     ```
     npm ERR! code ERESOLVE
     npm ERR! ERESOLVE unable to resolve dependency tree
     npm ERR! Could not resolve dependency:
     npm ERR! peer react@"^16.14.0 || ^17.0.0 || ^18.0.0" from vite-react-ssg@0.5.1
     npm ERR! Conflicting peer dependency: react@19.0.1
     ```
2. Running `npm show vite-react-ssg dist-tags` retrieved:
   ```json
   { "latest": "0.5.1", "beta": "0.9.1-beta.1" }
   ```
3. Running `npm show vite-react-ssg@0.9.0 peerDependencies` and `npm show vite-react-ssg@0.9.1-beta.1 peerDependencies` retrieved:
   ```json
   {
     "react": "^17.0.2 || ^18.0.0 || ^19.0.0",
     "react-dom": "^17.0.2 || ^18.0.0 || ^19.0.0",
     "vite": "^2.0.0 || ^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0"
   }
   ```
4. Running `npm install -D vite-react-ssg@0.9.0 --dry-run` successfully completed without any errors or warnings.

---

### Browser-Only (Client) Globals Check
A search was performed across the `src/` directory to identify top-level calls to `window`, `document`, or `localStorage` that could crash a Node.js SSR pre-rendering engine:
* Command: `rg -n "window\.|document\.|localStorage\." src/ --glob "!**/*.test.*"`
* Output matched:
  1. `src/App.tsx:41` - `localStorage.getItem("goriyasno_mockup_submissions")`
  2. `src/App.tsx:56` - `localStorage.setItem("goriyasno_mockup_submissions", ...)`
  3. `src/main.tsx:6` - `createRoot(document.getElementById('root')!).render(...)`
  4. `src/main.tsx:13` - `window.addEventListener('load', ...)`
  5. `src/main.tsx:16` - `navigator.serviceWorker.register(...)`
  6. `src/components/Modal.tsx:42,44,47,59,60,72,75` - Various `document` references (`document.body.style`, `document.addEventListener`, etc.)
  7. `src/components/Header.tsx:31` - `document.getElementById(id)`
  8. `src/components/Hero.tsx:38,45` - `document.getElementById(...)`

#### Detailed Evaluation:
* **Components & App.tsx**: All references in components and `App.tsx` are correctly nested inside `useEffect` hook blocks or event callbacks. Since `useEffect` and callbacks do not execute during Server-Side Rendering (only executing in the browser after hydration), they are perfectly SSR-safe.
* **Entry Point (src/main.tsx)**: The code checking for service worker registration is executing at the **top level** of `src/main.tsx`:
  ```typescript
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { ... });
  }
  ```
  During pre-rendering, Node imports the entry point. Because `navigator` and `window` are undefined in Node, this will throw a `ReferenceError: navigator is not defined`, crashing the build.

---

## 2. Logic Chain

1. **Drift Analysis**: Since `git diff --stat dadeef4..HEAD` is empty, there are no changes to files under scope that violate any assumptions in plan `025-static-prerender-home.md`.
2. **Compatibility Analysis**: Installing the default `@latest` tag resolves to `vite-react-ssg@0.5.1`, which fails because of a peer conflict with React 19. By explicitly targetting version `^0.9.0` (e.g. `0.9.0` or `0.9.1-beta.1`), the package installs successfully because version `0.9.x` includes official compatibility tags for React 19 (`^19.0.0`) and Vite 6 (`^6.0.0`).
3. **SSR Safety Analysis**: All component-level client global references reside inside `useEffect` or user action handlers, making them inert during SSR. However, the service worker block in `src/main.tsx` is parsed and executed at the module level. During pre-rendering, this script is executed in Node.js, where `navigator` and `window` do not exist. Therefore, we must guard it with `typeof window !== 'undefined'` to avoid a runtime `ReferenceError` during compilation.

---

## 3. Caveats

* **Build Verification**: We have not run the actual production build with the package installed, since our task is strictly restricted to read-only investigation.
* **Indirect Imports**: Although all direct files in `src/` were scanned, any third-party dependencies imported in components that access `window` at their top level during loading could still cause issues. None are currently known.

---

## 4. Conclusion

Integrating `vite-react-ssg` into the codebase is highly feasible and compatible with React 19 and Vite 6, provided that:
1. Version `0.9.0` (or `^0.9.0`) of `vite-react-ssg` is explicitly targeted to avoid peer dependency errors.
2. The service worker registration code in `src/main.tsx` is wrapped in a client-only check to prevent crashing the Node process during static pre-rendering.

### Proposed Diff for Implementation

#### A. Dependency Additions (`package.json`)
```json
"devDependencies": {
  "vite-react-ssg": "^0.9.0"
}
```

#### B. Main Entry Point Adjustments (`src/main.tsx`)
```tsx
import { StrictMode } from 'react';
import { ViteReactSSG } from 'vite-react-ssg';
import App from './App.tsx';
import './index.css';

export const createApp = ViteReactSSG(
  <StrictMode>
    <App />
  </StrictMode>
);

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.error('SW registration failed:', err));
  });
}
```
*Note: In `vite-react-ssg`, the wrapper expects `createApp` to be exported rather than directly calling `createRoot` at the module level.*

#### C. Vite Config Modifications (`vite.config.ts`)
```typescript
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: process.env.BASE_PATH ?? '/',
    plugins: [
      react(),
      tailwindcss()
    ],
    ssgOptions: {
      script: 'async',
      formatting: 'minify',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        }
      }
    },
  };
});
```

---

## 5. Verification Method

To verify the integration:
1. **Dependency Verification**: Run `npm install -D vite-react-ssg@0.9.0` to confirm it resolves cleanly.
2. **Build and Code-Gen Verification**: Run `npm run build`. Confirm that the build completes successfully and `dist/index.html` size is significantly larger than ~4KB.
3. **HTML Inspection**: Run `grep -c -E '<h1|<h2|антрацит|Углегорская' dist/index.html` and `grep -c 'application/ld+json' dist/index.html` to confirm that the static content and JSON-LD markup are retained in the pre-rendered shell.
4. **Hydration Integrity**: Start the server using `npm run dev` and execute Playwright E2E tests: `npx playwright test`. Confirm that all 4 tests pass, ensuring that client-side hydration works perfectly and the page remains interactive.
