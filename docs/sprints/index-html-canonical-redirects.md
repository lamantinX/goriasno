# Sprint: canonical redirects for explicit index.html URLs

Branch: fix/index-html-canonical-redirects · Date: 2026-08-07 · Class: Core-risk

## Sprint
**Goal:** Remove duplicate public document URLs ending in `/index.html` in the production Express server.
**Scope:** in — `server.js`, plan/run docs; out — CI workflow, app UI, service worker, secrets.
**Risks:** Core-risk because `server.js` is a production deploy surface. User explicitly approved implementation, CI verification, deploy, and live-site verification.

## Contract
1. `/index.html` redirects permanently to `/`.
2. Nested `/x/index.html` redirects permanently to `/x/`.
3. Query strings are preserved.
4. Canonical URLs continue serving normally.
5. Existing API and 404 behavior is unaffected.
6. Existing CI test job passes after merge.
7. Production deploy job and smoke test pass.
8. Live site remains available after deployment.

## Critique
- Redirect middleware must run before `express.static`, otherwise existing index files are served as HTTP 200 and duplicates remain.
- Restricting to GET/HEAD avoids changing POST/API semantics.
- `req.path` excludes the query string, while `req.originalUrl` is used only to append the original query string.
- Root `/index.html` becomes `/`; nested `/anthracite/index.html` becomes `/anthracite/` without constructing an external origin, avoiding host/proxy assumptions.
- Existing `/api/*` and missing JSON behavior remains below the static layer and is untouched.
- The production workflow deploys `server.js`, so this fix reaches the actual runtime; repository `nginx.conf` is not included in the current deploy tarball.

## Security review
- No secrets, auth, payment, PII, or environment configuration changed.
- No new dependency or executable shell introduced.
- Redirect target is derived only from the request path and original query string and remains same-origin (relative Location).
- No user-controlled Host header is reflected into the redirect.

## Evidence before merge
- Diff scope: only `server.js` plus plan/run documentation.
- Static code review: middleware is before both static handlers and has an explicit GET/HEAD + `/index.html` guard.
- Full verification is delegated to the repository's existing main-branch CI/CD gate because the execution environment cannot clone GitHub directly; CI runs `npm ci`, `npm run verify`, Playwright, production build, deploy, service health, root smoke and 404 smoke.

## Evaluation
The implementation is minimal and isolated. Remaining deployment risk is bounded by the existing CI-before-deploy dependency: production deploy cannot run unless the test job succeeds.

Result: PASS (Self-Evaluated; CI/live verification pending merge)
