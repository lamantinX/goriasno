# Original User Request

## Initial Request — 2026-07-06T07:09:53Z

Execute Plan 025 (Static Pre-render) on the '#ГориЯсно#' codebase to pre-render the main catalog page (/) into static HTML at build time, ensuring SEO optimization.

Working directory: \\wsl.localhost\Ubuntu\home\zelen\dev\goriasno
Integrity mode: development

## Requirements

### R1. Evaluate and Install Pre-rendering Solution
Analyze the project's dependencies (React 19, Vite 6, Tailwind CSS v4). Select and install the best pre-rendering solution (e.g., `vite-react-ssg`, `vite-plugin-prerender`, or custom script) that is fully compatible.

### R2. Pre-render Home Page (/) Content
Modify the Vite build pipeline so that building the app pre-renders the home page (/) into `dist/index.html`. The output file must contain the actual static HTML content (such as headings, product catalog, contact information) rather than an empty `<div id="root"></div>`.

### R3. Preserve Head Meta Tags & JSON-LD
The generated `dist/index.html` must fully preserve all original `<head>` elements, SEO meta tags, and the static `LocalBusiness` JSON-LD schema defined in `index.html`.

### R4. Maintain Service Worker & Runtime Hydration
Ensure the Service Worker registration code in `src/main.tsx` is preserved and active in the built app. The pre-rendered static HTML must successfully hydrate on the client without breaking any runtime behaviors (e.g., catalog filters, quick order modal, contact form).

### R5. Track Status in Index
Do not modify any source code outside the scope of Plan 025 (in-scope: `package.json`, `vite.config.ts`, `src/main.tsx`, `index.html`, and potentially minor client-side guards in `src/App.tsx`). Upon successful completion, update the status of Plan 025 in `plans/README.md` to `DONE`.

## Acceptance Criteria

### Build & Typecheck Compliance
- [ ] Running `wsl -d Ubuntu --cd /home/zelen/dev/goriasno npm run lint` completes with exit code 0.
- [ ] Running `wsl -d Ubuntu --cd /home/zelen/dev/goriasno npm run build` completes with exit code 0 and creates `dist/index.html`.

### Static Content Verification
- [ ] The generated `dist/index.html` contains the actual static catalog content (checking `grep -c -E '<h1|<h2|антрацит|Углегорская' dist/index.html` in WSL returns >= 1).
- [ ] The generated `dist/index.html` retains the JSON-LD schema (checking `grep -c 'application/ld+json' dist/index.html` in WSL returns >= 1).

### E2E Runtime Validation
- [ ] Running `wsl -d Ubuntu --cd /home/zelen/dev/goriasno npm run test -- --project=chromium --project=firefox` completes with exit code 0 and all 8 tests pass (validating successful React hydration and no runtime regression).

### Code & Status Hygiene
- [ ] `git status` shows no changes to files outside the defined scope of Plan 025.
- [ ] `plans/README.md` shows the status of Step 025 updated to `DONE`.
