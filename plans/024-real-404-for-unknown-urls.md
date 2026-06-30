# Plan 024: Return real 404 for non-existent URLs instead of 200 + SPA shell

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat b1ac6d3..HEAD -- nginx.conf server.js index.html`
> If any of these changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch, treat
> it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: MED (a too-greedy 404 rule could 404 real assets — verify carefully)
- **Depends on**: none
- **Category**: bug / seo
- **Planned at**: commit `b1ac6d3`, 2026-06-30

## Why this matters

Both serving paths (`nginx.conf` and `server.js`) fall back to `index.html` for
**any** unmatched URL, returning **HTTP 200** for pages that do not exist (e.g.
`/no-such-page`). Search engines then index junk URLs as valid, and clients
cannot distinguish "found" from "not found". This site is a **single-page app
with no client-side router** (`App.tsx` renders one page; there are no in-app
URL routes), so a path that is neither `/` nor a real static asset is genuinely a
404 — it should say so.

## Current state

- `server.js:116-121` — static serving then a catch-all that returns the SPA
  shell with the default 200 status:

  ```js
  // Serve static files in production
  app.use(express.static(path.join(__dirname, 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));   // 200 for everything
  });
  ```

- `nginx.conf:28-30` — SPA fallback that rewrites unknown paths to `/index.html`
  (served 200):

  ```nginx
  location / {
      try_files $uri $uri/ /index.html;
  }
  ```

- The app has **no client-side routing**. `index.html` loads one bundle that
  renders the whole landing page on `/`. There are no deep links like
  `/catalog` or `/product/123` handled in JS. (Confirm by checking `src/App.tsx`
  — it switches between `landing`/`success` via React state, not URL.) Therefore
  the SPA-fallback-to-index pattern is unnecessary here and is what produces the
  200s.

- `dist/` is the build output served in prod (`npm run build` writes it).

## Commands you will need

| Purpose       | Command                                  | Expected on success    |
|---------------|------------------------------------------|------------------------|
| Typecheck     | `npm run lint`                           | exit 0, no errors      |
| Build         | `npm run build`                          | exit 0, writes `dist/` |
| Verify        | `bash scripts/run-quiet.sh verify`       | exit 0, silent on pass |
| Run server    | `node server.js`                         | logs "Server running on port 3001" |
| nginx syntax  | `nginx -t -c "$PWD/nginx.conf"`          | "syntax is ok" (skip if nginx absent) |

## Scope

**In scope**:
- `server.js` — make the catch-all return 404 for unknown paths (still serve
  real static assets and `/`).
- `nginx.conf` — replace the SPA `try_files ... /index.html` fallback so unknown
  paths return 404; keep `/` and real assets working.
- `index.html` is **referenced** but only the SPA loads from it. (No new
  `404.html` is required — see Step notes. If you add one, it goes in
  `public/404.html` so the build copies it to `dist/`.)

**Out of scope** (do NOT touch):
- The `/api/leads` route in `server.js` — it is defined before the catch-all and
  keeps working; do not move or modify it.
- The static-asset caching `location ~* \.(...)$` block in `nginx.conf` — leave
  it; real assets must still be served (200) by it.
- Any client/React code — there is no router to add.

## Git workflow

- Branch: `advisor/024-real-404-for-unknown-urls`
- Commit style: conventional commits. Suggested:
  `fix(serve): return 404 for unknown URLs instead of SPA 200 fallback`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Decide the 404 body (use the SPA shell with a 404 status)

The simplest correct behavior: serve a response with **HTTP status 404** for
unknown paths. You may serve `dist/index.html` as the body (so the user still
sees a styled page) but with status 404 — the status code is what matters for
crawlers and clients. This avoids creating a separate 404 page.

(If the operator later wants a dedicated "страница не найдена" design, add
`public/404.html` and serve that instead — out of scope here.)

### Step 2: Express — 404 for unknown paths

In `server.js`, replace the catch-all so it sends the shell with a 404 status.
`express.static` still serves real files in `dist/` (200) before this handler
runs, and `/` resolves to `dist/index.html` via static (`index.html` is the
directory index) — but verify `/` returns 200 in Step 4. Change:

```js
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```
to:

```js
app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

Note: `express.static` serves `/` → `index.html` automatically with 200, so the
homepage is unaffected; only paths that fall through to this catch-all get 404.
If during Step 4 `/` returns 404, it means static index resolution is off — STOP
and report (do not hack around it).

**Verify**: `npm run lint` → exit 0.

### Step 3: nginx — 404 for unknown paths

In `nginx.conf`, change the `location /` block so unmatched paths return 404
instead of rewriting to `/index.html`. Replace:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
with:

```nginx
location = / {
    try_files /index.html =404;
}

location / {
    try_files $uri $uri/ =404;
}
```

This serves `/` from `index.html` (200), serves any real file/dir that exists
(200, including assets via the cache `location` which still matches first), and
returns a real 404 for everything else. Do not modify the
`location ~* \.(...)$` asset block.

**Verify**: if nginx is installed, `nginx -t -c "$PWD/nginx.conf"` → "syntax is
ok". If not installed, skip (do not install) and rely on Step 4 + Done grep.

### Step 4: Express smoke test

Build, start the server, and check three paths:

```bash
npm run build
node server.js &   # note the PID; kill it after
sleep 1
# Homepage must be 200
curl -s -o /dev/null -w "/ => %{http_code}\n" http://localhost:3001/
# A real asset must be 200 (pick any file that exists in dist/, e.g. robots.txt)
curl -s -o /dev/null -w "/robots.txt => %{http_code}\n" http://localhost:3001/robots.txt
# An unknown path must be 404
curl -s -o /dev/null -w "/no-such-page => %{http_code}\n" http://localhost:3001/no-such-page
# stop the server
kill %1 2>/dev/null
```

Expected:
```
/ => 200
/robots.txt => 200
/no-such-page => 404
```

**Verify**: the three lines match the expected output exactly.

## Test plan

- Step 4 is the regression test (homepage 200, real asset 200, unknown path
  404).
- If the Playwright suite (`tests/`) runs against `server.js`, confirm it still
  passes (it should only request `/` and real assets, which stay 200). Run
  `bash scripts/run-quiet.sh test`.
- Optional: add a Playwright assertion that navigating to a bogus path yields a
  404 response, following an existing spec's structure in `tests/`.

## Done criteria

ALL must hold:

- [ ] `npm run lint` exits 0
- [ ] `npm run build` exits 0
- [ ] `grep -n 'status(404)' server.js` returns the catch-all line
- [ ] `grep -c '=404' nginx.conf` ≥ 1 and `grep -c 'try_files $uri $uri/ /index.html' nginx.conf` == 0
- [ ] Step 4 prints `/ => 200`, `/robots.txt => 200`, `/no-such-page => 404`
- [ ] `/api/leads` still defined before the catch-all in `server.js` (diff review)
- [ ] No files outside `server.js` and `nginx.conf` modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- In Step 4, `/` returns 404 (static index resolution is misconfigured) — do not
  work around it; report.
- A real existing asset returns 404 (the nginx rule is too greedy) — report.
- `nginx.conf` or `server.js` does not match the "Current state" excerpts
  (drifted).
- You discover the app actually DOES have client-side routes (deep links handled
  in JS) — then a blanket 404 would break those routes; STOP and report so the
  approach can be reconsidered. (Recon says it does not, but verify.)
- A verification fails twice after a reasonable fix attempt.

## Maintenance notes

- This 404 strategy is correct **only while the app has no client-side router**.
  If a SPA router with real deep links is introduced later, revert to a
  `try_files ... /index.html` SPA fallback (200) for known route prefixes and
  keep 404 only for the rest — revisit this plan then.
- Reviewer: confirm `/`, every real asset, the manifest, favicons, sitemap, and
  `privacy.html` all still return 200; only genuinely missing paths 404.
- The body served on 404 is still the styled SPA shell (status 404) — acceptable
  for crawlers; swap to a dedicated `public/404.html` later if a custom design
  is wanted.
