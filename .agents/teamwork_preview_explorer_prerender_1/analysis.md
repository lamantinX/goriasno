# Milestone 1 (Static Pre-render) Exploration Report

## 1. Scope & Drift Analysis
We verified the current repository state against the parent commit `dadeef4` (from which Plan 025 was written) for the 5 files in scope:
- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `vite.config.ts`
- `package.json`

**Observations**:
- Running `git diff --stat dadeef4..HEAD` returned empty output, confirming there is **no code drift** or conflicts in the scope of these files.
- The files match the exact states described in the "Current state" section of the plan.

---

## 2. Package Compatibility Analysis (`vite-react-ssg`)

We analyzed `vite-react-ssg` versions (including the latest stable `0.9.0` and pre-release `0.9.1-beta.1`) for React 19 and Vite 6 compatibility:

### Peer Dependency Verification
The peer dependencies of `vite-react-ssg@0.9.0` are:
```json
{
  "vite": "^2.0.0 || ^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0",
  "react": "^17.0.2 || ^18.0.0 || ^19.0.0",
  "react-dom": "^17.0.2 || ^18.0.0 || ^19.0.0",
  "react-router-dom": "^6.14.1"
}
```
* **React 19 Compatibility**: Officially supported.
* **Vite 6 Compatibility**: Officially supported.

### React 19 Specific Handling
Looking into the package source code (specifically `dist/shared/vite-react-ssg.DTTf7HZy.mjs`), `vite-react-ssg` includes explicit runtime version checks and dynamically calls the React 19 API (`createRoot` and `hydrateRoot` from `react-dom/client` inside `React.startTransition`) rather than the legacy React 18 or 17 API paths:
```js
const isReact19 = Number((version || "").split(".")[0]) > 18;
// ...
} else if (isReact19) {
  import('react-dom/client').then(({ default: { createRoot } }) => {
    const root = createRoot(container);
    React.startTransition(() => {
      root.render(app);
    });
  });
}
```
This guarantees that hydration behaves correctly under React 19.

### Router & Single Page Mode Analysis
* `vite-react-ssg` has a specialized single-page mode accessible via `vite-react-ssg/single-page`.
* The single-page adapter (`SinglePageAdapter`) does not import or execute any `react-router-dom` code at runtime.
* However, during the compilation and bundling step, Vite might warn or error out about missing peer dependencies if `react-router-dom` is completely missing from the project.
* **Recommendation**: Install `react-router-dom` as a devDependency alongside `vite-react-ssg` to ensure a smooth, warning-free build process, even when using the single-page mode.

---

## 3. SSR Compatibility Scan (Client-Only References)

We scanned the entire `src/` directory for globals like `window`, `document`, `localStorage`, `navigator`, and `sessionStorage`.

### 3.1. Safe Client-Only Usages
All component-level accesses are located inside runtime handlers or standard lifecycle hooks, making them safe for SSR/SSG:
- `src/components/Modal.tsx` uses `document.body` (overflow control) and `document.addEventListener` (Escape key closer, focus trap) inside `useEffect` and callback functions.
- `src/components/Header.tsx` uses `document.getElementById` inside a click-triggered scroll handler.
- `src/components/Hero.tsx` uses `document.getElementById` inside click-triggered scroll handlers.
- `src/App.tsx` uses `localStorage` (fetching and saving state) inside `useEffect` and callbacks.

### 3.2. Critical SSR Blocker (Entry Point)
In `src/main.tsx` (the SPA entry point), there is an unguarded top-level reference:
```tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
      // ...
  });
}
```
During `vite-react-ssg build`, Node.js imports the entry file (`src/main.tsx`) to extract the exported `createRoot` function. Since `window` and `navigator` are undefined in Node.js, this block will immediately throw:
`ReferenceError: window is not defined` (or `navigator is not defined`)
This will crash the build.

**Solution**: This block must be guarded with a client-side check:
```tsx
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // register service worker...
  });
}
```

---

## 4. Recommended Implementation Strategy

To successfully implement Milestone 1, the implementer should follow these steps:

### Step 1: Install Dependencies
Install `vite-react-ssg` (stable `0.9.0`) and `react-router-dom` (to satisfy peer dependency resolve checks during Vite bundling):
```bash
npm install -D vite-react-ssg react-router-dom
```

### Step 2: Rewrite the Application Entry Point (`src/main.tsx`)
Replace `src/main.tsx` contents with the single-page SSG wrapper:
```tsx
import { StrictMode } from 'react';
import { ViteReactSSG } from 'vite-react-ssg/single-page';
import App from './App.tsx';
import './index.css';

// Export createRoot wrapped with single-page SSG
export const createRoot = ViteReactSSG(
  <StrictMode>
    <App />
  </StrictMode>
);

// Guard client-only service worker registration
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.error('SW registration failed:', err));
  });
}
```

### Step 3: Configure `vite.config.ts`
Add the `ssgOptions` property to the exported configuration object. Do NOT add any extra plugins to the `plugins` array (as `vite-react-ssg` does not require one):
```ts
export default defineConfig(() => {
  return {
    base: process.env.BASE_PATH ?? '/',
    plugins: [react(), tailwindcss()],
    ssgOptions: {
      script: 'async',
      format: 'html',
    },
    // ...
  };
});
```

### Step 4: Update build script in `package.json`
Change the build script to run the SSG builder:
```json
"build": "vite-react-ssg build"
```

### Step 5: Verify the Build Output
1. Run `npm run build`.
2. Ensure that `dist/index.html` is generated and its size is significantly larger than the original ~4 KB template.
3. Verify that the static HTML contains pre-rendered elements:
   ```bash
   grep -c -E '<h1|<h2|антрацит|Дрова|Углегорская' dist/index.html
   ```
   (Should return `>0`).
4. Verify that the `<head>` sections, including the static JSON-LD `LocalBusiness` script block, are preserved:
   ```bash
   grep -c 'application/ld+json' dist/index.html
   ```
   (Should return `>=1`).

### Step 6: Verify Hydration and Functionality
1. Run the E2E tests:
   ```bash
   npm run test -- --project=chromium --project=firefox
   ```
   (Verify all 8 tests pass without regressions on hydration or click handlers).
2. Manually open `dist/index.html` in a browser with JavaScript disabled and verify that the layout, catalog, and images are fully visible and readable.
