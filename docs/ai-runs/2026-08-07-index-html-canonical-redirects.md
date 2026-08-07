# AI Run: index.html canonical redirects

## Meta
- **Date:** 2026-08-07
- **Task Class:** Core-risk
- **Trigger:** User asked to implement the duplicate-page fix, verify CI passes, and verify the live site works.
- **Status:** PARTIAL
- **Tags:** SECURITY-SENSITIVE | HIGH-FRICTION

## Scope
- **Goal:** Redirect explicit `/index.html` document URLs to their canonical directory URLs in production.
- **Files in (modified):** `server.js`, `plans/030-index-html-canonical-redirects.md`, `docs/sprints/index-html-canonical-redirects.md`, this run log.
- **Files out (read only):** `.claude/rules/task-routing.md`, `.claude/rules/security.md`, `.github/workflows/deploy.yml`, `nginx.conf`, `DEPLOY_NIP_IO.md`, existing sprint examples.
- **Sensitive surfaces touched:** `server.js` (production server/deploy surface).

## Plan reference
- **Sprint artifact:** `docs/sprints/index-html-canonical-redirects.md`
- **Approved plan:** `plans/030-index-html-canonical-redirects.md`

## Changes
- Added same-origin permanent canonicalization for GET/HEAD requests ending in `/index.html` before static file serving.
- Preserved the original query string.
- Kept API, form, asset-cache, and fallback behavior unchanged.

## Evidence
- `npm run verify` → pending main-branch CI; local Git clone was unavailable because the execution container could not resolve github.com.
- Criterion 1: code review → `/index.html` maps to `/`.
- Criterion 2: code review → `/anthracite/index.html` maps to `/anthracite/`.
- Criterion 3: code review → query suffix is copied from `req.originalUrl`.
- Criterion 4–8: pending merge + existing CI/CD + live verification.
- Skipped local npm verification — environment DNS prevented cloning repository — remaining risk: caught by existing CI test gate before production deploy.

## Failures / Rework
- Initial proposed nginx-only fix was rejected after inspecting deployment workflow: `nginx.conf` is not included in the deploy tarball, while `server.js` is.
- Container Git clone failed with `Could not resolve host: github.com`; switched to the connected GitHub API.

## Workflow notes
- Repository CI is configured only for pushes to `main`, not pull_request events. Therefore final automated verification requires merge to main; deploy depends on the test job.

## Outcome
Implementation is ready for diff review and merge. CI/deploy/live checks remain to complete this run.
