# AI Run: 2026-06-17 - Audit & Planning (improve)

## Context
- **Date**: 2026-06-17
- **Task Class**: Standard
- **Trigger**: `/improve`
- **Status**: DONE

## Actions Taken
- Performed recon and audit of the codebase in default "standard" mode.
- Identified multiple issues:
  1. A destructive `clean` script in `package.json` that deleted the handwritten `server.js`.
  2. A Service Worker installation failure in production due to a reference to `/src/main.tsx` in `public/sw.js`.
  3. Security/Correctness HTML escaping issue in `server.js` when sending notifications to Telegram.
  4. Bubbling issues in `App.tsx` clicking mode.
  5. Playwright testing configuration and lack of local E2E coverage.
  6. Missing/incomplete calculator and review toolbar elements.
- Drafted **Plan 006: Clean up and Bug Fixes** to:
  - Fix the `clean` script, sw.js cache asset list, and Telegram API HTML escaping.
  - Remove the design review toolbar completely.
  - Remove the calculator code completely.
  - Set the theme permanently to `cozy-wood` (теплые дрова).
  - Verify text readability under the selected theme.
- Drafted **Plan 007: E2E Testing and DX** to:
  - Configure Playwright to test the local application at port 3000 instead of `playwright.dev`.
  - Add E2E tests covering the main page rendering, catalog filters, and callback modal/form inputs.
- Updated `plans/README.md` to index Plan 006 and Plan 007 as `TODO`.

## Next Steps
- Delegate Plan 006 and Plan 007 to an executor for implementation and test verification.
