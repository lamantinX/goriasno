# Project: #ГориЯсно# Plan 025 Static Pre-render

## Architecture
- **Front-end**: React 19, Vite 6, Tailwind CSS v4, Lucide React icons.
- **Entry point**: `src/main.tsx` mounts `<App />` into `index.html`.
- **Service Worker**: Registered in `src/main.tsx`, offline app shell caching.
- **Build Output**: Generates static assets in `dist/`.
- **Express Server**: `server.js` handles API requests under `/api/leads` and falls back to serving static files.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Static Pre-render | Implement static pre-rendering of `/` to `dist/index.html` via `vite-react-ssg` | None | IN_PROGRESS |

## Interface Contracts
- No new cross-module interface changes. Standard React structure is kept intact.

## Code Layout
- `src/main.tsx` - Application entry point.
- `vite.config.ts` - Vite build configuration.
- `package.json` - Dependencies and build/lint scripts.
- `index.html` - HTML template.
