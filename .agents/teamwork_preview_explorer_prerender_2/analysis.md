# Feasibility and Compatibility Analysis: Static Pre-render (Milestone 1)

This report details the findings from the exploration phase of Milestone 1 (Static Pre-render) for the #ГориЯсно# website. The goal is to pre-render the main landing page (`/`) to static HTML using `vite-react-ssg` to solve the empty root element problem (SEO roadblock #1) while keeping client-side hydration functioning seamlessly.

---

## 1. Conflict and Drift Analysis
A comparison of the current project codebase against the baseline commit `dadeef4` (the state when the plan was formulated) was executed:
```bash
git diff --stat dadeef4..HEAD -- index.html src/main.tsx src/App.tsx vite.config.ts package.json
```

### Observations:
- The command returned no output, meaning there is **zero drift** on the in-scope files.
- Manual inspection of `package.json`, `vite.config.ts`, `src/main.tsx`, and `index.html` confirmed they match the "Current state" snippets in `plans/025-static-prerender-home.md` exactly.
- **Conclusion**: There are no conflicts or codebase drifts that would prevent applying the static pre-rendering plan.

---

## 2. Package Compatibility Analysis
We evaluated the package compatibility of `vite-react-ssg` with the project's current frontend stack:
- **Vite version**: `^6.2.3`
- **React/React-DOM version**: `^19.0.1`

### peerDependencies of `vite-react-ssg`:
Running `npm info vite-react-ssg peerDependencies` returned the following schema:
- `react`: `^17.0.2 || ^18.0.0 || ^19.0.0`
- `react-dom`: `^17.0.2 || ^18.0.0 || ^19.0.0`
- `vite`: `^2.0.0 || ^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0`
- `react-router-dom`: `^6.14.1`

### Key Findings on Compatibility:
1. **React 19 & Vite 6**: `vite-react-ssg` has native peer dependency support for React 19 and Vite 6.
2. **React Router Dom Dependency**:
   - The project currently does not have `react-router-dom` installed.
   - We inspected `peerDependenciesMeta` for `vite-react-ssg`:
     ```json
     {
       "@tanstack/react-router": { "optional": true },
       "@tanstack/start": { "optional": true },
       "beasties": { "optional": true },
       "critters": { "optional": true },
       "prettier": { "optional": true },
       "react-router-dom": { "optional": true },
       "styled-components": { "optional": true }
     }
     ```
   - Since `react-router-dom` is marked as **optional**, we do not need to install it for Milestone 1. The default setup of `ViteReactSSG({ App })` acts as a drop-in wrapper for the single-page application.
   - *Note*: It will need to be installed in Milestone 2 (routing for product pages).
3. **Dry-run Verification**:
   - Running `npm install --dry-run -D vite-react-ssg` completed successfully with exit code 0.
   - No peer dependency errors block the installation, only minor warnings (`npm warn ERESOLVE overriding peer dependency`) which are standard and safe.

---

## 3. Client-Only API Reference Scan
We performed a ripgrep scan of the `src/` directory for any top-level references to browser-specific objects (`window`, `document`, `localStorage`, `navigator`) that would crash the Node-side static generator.

### Observations:
1. **`localStorage`**:
   - Occurrences in `src/App.tsx` (lines 41, 56) are safely wrapped inside a `useEffect` hook or in an event callback. No top-level references exist.
2. **`document`**:
   - Occurrences in `src/components/Header.tsx` (line 31) and `src/components/Hero.tsx` (lines 38, 45) are inside click handler callbacks (run only in-browser).
   - Occurrences in `src/components/Modal.tsx` are wrapped in `useEffect` or React callbacks.
   - Occurrence in `src/main.tsx` (line 6) is the react-dom mount hook which is replaced by the SSG entry point anyway.
3. **`window` / `navigator`**:
   - **Crucial SSR Breaker**: In `src/main.tsx` lines 12-20:
     ```tsx
     if ('serviceWorker' in navigator) {
       window.addEventListener('load', () => { ... })
     }
     ```
     This block is executed at the module's top-level. During static pre-rendering, Node.js imports `src/main.tsx`. Since `navigator` is not defined globally in Node, this block will throw `ReferenceError: navigator is not defined`, crashing the build.
   - **Fix**: Guard the Service Worker block using `typeof window !== 'undefined'`:
     ```tsx
     if (typeof window !== 'undefined' && 'serviceWorker' in navigator) { ... }
     ```

---

## 4. Recommended Implementation Strategy
To implement static pre-rendering using `vite-react-ssg` cleanly, we recommend the following approach:

### Step 1: Install `vite-react-ssg`
Run the following installation command in the workspace:
```bash
npm install -D vite-react-ssg
```

### Step 2: Update `src/main.tsx`
Replace the entry point rendering logic and wrap the Service Worker registry in a client-only guard:
```tsx
import { StrictMode } from 'react';
import { ViteReactSSG } from 'vite-react-ssg';
import App from './App.tsx';
import './index.css';

// Replace standard createRoot with ViteReactSSG wrapper
export const createRoot = ViteReactSSG({ App });

// Guard navigator/window access from running on Node during build
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.error('SW registration failed:', err));
  });
}
```

### Step 3: Update `vite.config.ts`
Introduce `ssgOptions` and adjust exports to work with `vite-react-ssg`:
```ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: process.env.BASE_PATH ?? '/',
    plugins: [
      react(),
      tailwindcss(),
    ],
    ssgOptions: {
      script: 'async',
      format: 'html',
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

### Step 4: Verification Gate
Verify that:
1. `npm run build` runs successfully.
2. `dist/index.html` size is significantly larger than ~4KB (indicating content rendering).
3. Confirm core content presence:
   ```bash
   grep -c -E '<h1|<h2|антрацит|Дрова|Углегорская' dist/index.html
   ```
   Must return `>0`.
4. Confirm schema availability:
   ```bash
   grep -c 'application/ld+json' dist/index.html
   ```
   Must return `≥1`.
5. Run the Playwright E2E suite (`npm run test`) to verify that the pre-rendered shell hydrates without breaking interactive features.

### Playwright E2E Baseline Run Note:
During exploration, a baseline E2E run (`wsl npm run test`) was performed. The output was as follows:
- **Total tests**: 12 (4 tests x 3 browsers: Chromium, Firefox, WebKit)
- **Results**: 8 passed, 4 failed.
- **Root cause of failures**: The 4 WebKit tests failed exclusively due to missing system-level dependencies for WebKit in the host WSL environment (e.g., `browserType.launch: Host system is missing dependencies to run browsers`).
- **Verdict**: The core application logic is fully healthy, as all tests passed under Chromium and Firefox. E2E verification of pre-rendering should focus on running tests under Chromium/Firefox or installing missing dependencies inside WSL using `sudo npx playwright install-deps`.

