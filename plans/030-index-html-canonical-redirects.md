# Plan 030 — redirect duplicate index.html URLs

Status: APPROVED
Class: Core-risk
Approval: user explicitly requested implementation, CI verification, and live-site verification on 2026-08-07.

## Goal
Make every rendered document have one canonical public URL by permanently redirecting `/index.html` and nested `*/index.html` URLs to their directory URLs before static files are served.

## Sensitive surface
- `server.js` — production server/deploy surface.

## Scope
In: `server.js`, required sprint/run documentation.
Out: CI workflow, secrets, auth, payment, service-worker behavior, application UI.

## Contract
1. `GET /index.html` returns 301 with `Location: /`.
2. `GET /anthracite/index.html` returns 301 with `Location: /anthracite/` (same behavior for all nested `index.html`).
3. Query strings are preserved.
4. Normal canonical URLs continue to be served normally.
5. Existing API/404 behavior is unchanged.
6. CI `Lint, Test, and Build` passes after merge.
7. Production deploy succeeds and the site responds successfully after deploy.

## Implementation
Add a small middleware before `express.static(...)` that handles only GET/HEAD requests whose path ends in `/index.html`, computes the directory URL, preserves the query string, and issues a 301 redirect.

## Verification
- Static review / syntax check of `server.js` change.
- Review PR diff for unrelated changes.
- Merge to `main` to trigger the existing CI/CD pipeline.
- Confirm workflow test + deploy jobs succeed.
- Verify production root and representative product page respond after deploy; verify duplicate index URL redirect using available HTTP tooling.
