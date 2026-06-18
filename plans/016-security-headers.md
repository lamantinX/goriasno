# Plan 016: Add HTTP security headers (CSP, X-Frame-Options, nosniff, Referrer-Policy)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 69c19dc..HEAD -- nginx.conf server.js`
> If either in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. NOTE: Plan 012 (remove Unsplash
> external images) must be DONE before this plan — the CSP below uses
> `img-src 'self' data:`, which would block the external Unsplash images if
> they still existed. If 012 is not DONE, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: Plan 012 (so `img-src 'self'` is valid — no external images remain). Plan 010 (fonts in `dist/assets`, same-origin) is compatible but not required.
- **Category**: security (defensive hardening)
- **Planned at**: commit `69c19dc`, 2026-06-17

## Why this matters

The site currently sets no HTTP security headers anywhere — `nginx.conf`
has gzip + cache only, and `server.js` sets none. The site embeds a
third-party Yandex map iframe and serves a lead-capture form, so the absence
of a Content-Security-Policy means any injected/compromised third-party
script could execute; missing `X-Frame-Options`/`frame-ancestors` allows
clickjacking; missing `nosniff` allows MIME-sniffing attacks on static
assets. This plan adds a conservative, correct-for-this-site CSP and the
standard hardening headers to BOTH the nginx path (prod static deploy) and
the Express path (`server.js` serves `dist/` + `/api/leads` in production),
so whichever serves the site enforces the same policy. No exploitable bug
was found — this is defensive maintenance.

## Current state

### The repo

Two production serve paths, both must set the headers:
1. Nginx serving `dist/` (`nginx.conf`) — used for the `goryasno.ru` prod deploy and the Docker/Nginx path in `DEPLOY_NIP_IO.md`.
2. Express `server.js` serving `dist/` + `/api/leads` — used when the backend serves the SPA in production.

In dev, Vite (`npm run dev`) serves the page and does NOT set these headers — so the CSP is not enforced in dev. That's expected (and why E2E won't catch CSP issues; see Test plan).

### nginx.conf (evidence)

`nginx.conf` (entire file, 21 lines):
```nginx
server {
    listen 80;
    server_name goryasno.ru;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

No security headers. Note nginx quirk: a `location` block's `add_header`
directives REPLACE (not append to) the parent `server`-level `add_header`s.
So the static-asset location currently sets only `Cache-Control`; the
HTML-serving `location /` has no `add_header` and would inherit
server-level ones (once added).

### server.js (evidence)

`server.js` sets no headers. `server.js:23` `app.use(express.json({ limit: '10kb' }));`
is the first middleware; routes follow. A header-setting middleware must go
after `express.json` and before the `/api/leads` route + the static serve.

### What the CSP must allow (grounded in the codebase)

- `script-src 'self' 'unsafe-inline'` — Vite emits hashed JS files (self); the only inline `<script>` is the JSON-LD block in `index.html` (`<script type="application/ld+json">`), which needs `'unsafe-inline'`. (A future hardening can externalize JSON-LD to `ld.json` + a `<link>` to drop `'unsafe-inline'`; out of scope here.)
- `style-src 'self' 'unsafe-inline'` — Tailwind v4 emits a CSS file (self); React inline `style={{...}}` attributes (e.g. `Hero.tsx:187` `style={{ width: "85%" }}`) need `'unsafe-inline'` for inline style attributes.
- `img-src 'self' data:` — all images are self-hosted after Plan 012 (catalog `public/images/products/*`, map `public/images/map-placeholder.svg`); `data:` kept for safety.
- `font-src 'self'` — @fontsource fonts ship as same-origin `dist/assets/*.woff2` (after Plan 010) or `dist/fonts/*` (pre-010); both self.
- `connect-src 'self'` — the browser only fetches `/api/leads` (same-origin). The Telegram API call is server-side (`server.js`), not browser-governed.
- `frame-src https://yandex.ru` — the Yandex map iframe (`FeedbackSection.tsx:305`).
- `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'` — hardening.

## Commands you will need

| Purpose | Command | Expected on success |
|-----------|--------------------------|---------------------|
| Build | `npm run build` | exit 0 (produces `dist/`) |
| server.js syntax | `node --check server.js` | exit 0 |
| nginx syntax (if nginx available) | `nginx -t -c "$(pwd)/nginx.conf"` (may not be available in worktree) | exit 0 / "syntax is ok" |
| Header check vs prod server | see Step 3 | CSP + X-Frame-Options present in response headers |
| E2E | `npx playwright test --project=chromium` | all pass (dev has no CSP) |

## Scope

**In scope**:
- `nginx.conf` (add security headers at server level + `X-Content-Type-Options` in the static-asset location)
- `server.js` (add a `app.use` header-setting middleware before the routes)

**Out of scope** (do NOT touch):
- `index.html` (the JSON-LD stays inline; `'unsafe-inline'` on script-src covers it. Externalizing JSON-LD is a future hardening, not this plan.)
- `vite.config.ts` (dev CSP is out of scope — Vite dev doesn't set headers; do not add a dev CSP that would break HMR).
- Any `.tsx` component, `public/sw.js`, or `src/`.
- Do NOT add `helmet` or any new dependency — set headers manually to keep the CSP identical to nginx and avoid a new dep.

## Git workflow

- Branch: `advisor/016-security-headers`
- Commit message style: `feat(security): add CSP and hardening headers in nginx.conf and server.js`

## Steps

### Step 1: Add security headers to nginx.conf

Edit `nginx.conf` to add the headers at the `server` level and re-add
`X-Content-Type-Options` inside the static-asset location (because that
location's `add_header` overrides the server-level ones). Target file:

```nginx
server {
    listen 80;
    server_name goryasno.ru;
    root /usr/share/nginx/html;
    index index.html;

    # gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Security headers (apply to HTML responses served via location /)
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://yandex.ru; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" always;

    # Cache static assets; re-add nosniff because this location's add_header
    # overrides the server-level ones (nginx quirk).
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Verify**: if `nginx` is installed in the worktree, `nginx -t -c "$(pwd)/nginx.conf"` → "syntax is ok". If nginx isn't available, skip (note in report) — the file is plain nginx config; eyeball it for brace balance and semicolons. `grep -n "Content-Security-Policy" nginx.conf` → 1 match.

### Step 2: Add the header-setting middleware to server.js

In `server.js`, immediately AFTER `app.use(express.json({ limit: '10kb' }));` (line 23) and BEFORE `const leadLimiter = rateLimit({...})` (line 25), insert:

```js
// Security headers — keep in sync with nginx.conf.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://yandex.ru; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
  );
  next();
});
```

Use `setHeader` (not `append`) so it's idempotent. The CSP string MUST match `nginx.conf` exactly (single source of truth: this plan). Do NOT add `helmet`.

**Verify**: `node --check server.js` → exit 0. `grep -n "Content-Security-Policy" server.js` → 1 match.

### Step 3: Verify the headers are actually served by the Express production path

Build, then start the Express server and curl the headers:

```
npm run build
PORT=3099 node server.js &
sleep 2
curl -sI http://localhost:3099/ | grep -iE 'content-security-policy|x-frame-options|x-content-type-options|referrer-policy'
kill %1
```

(Use a non-default `PORT=3099` to avoid colliding with anything on 3001. The server starts even without `TELEGRAM_BOT_TOKEN` — the `/api/leads` route returns 500 on use, but static + headers work.)

**Verify**: the curl output contains `content-security-policy:`, `x-frame-options:`, `x-content-type-options:`, and `referrer-policy:` headers. If any is missing, the middleware isn't wired before the static serve — re-check Step 2 placement.

### Step 4: Regression gate

**Verify**:
- `npm run build` exits 0
- `npm run lint` exits 0 (no TS change)
- `npx playwright test --project=chromium` → all 4 pass (dev server = Vite, no CSP in dev, so tests are unaffected; this just confirms no accidental breakage)

## Test plan

- No automated test for headers (would need a prod-server Playwright fixture).
- The Step 3 curl is the machine-checkable proof that the Express path sets the headers.
- The nginx path is verified by `nginx -t` if available; otherwise by inspection. The maintainer should curl the deployed `https://goryasno.ru/` headers after deploy and confirm the CSP is present.
- E2E stays green (dev has no CSP).

## Done criteria

ALL must hold:

- [ ] `nginx.conf` has `add_header Content-Security-Policy "..."` plus `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` at server level, and `X-Content-Type-Options` repeated in the static-asset location
- [ ] `server.js` has the `app.use` header middleware before the routes; `node --check server.js` exits 0
- [ ] The Step 3 curl shows `content-security-policy`, `x-frame-options`, `x-content-type-options`, `referrer-policy` headers in the response
- [ ] The CSP in `nginx.conf` and `server.js` are identical strings
- [ ] `npm run build` exits 0; `npm run lint` exits 0; `npx playwright test --project=chromium` passes all 4
- [ ] `git status` shows changes ONLY to `nginx.conf` and `server.js`
- [ ] `plans/README.md` status row for 016 updated

## STOP conditions

- Plan 012 is not DONE (Unsplash external images still present) — `img-src 'self'` would block them; STOP and land 012 first.
- The Step 3 curl shows a missing header — the middleware is placed after the static serve or a route short-circuits; fix placement (it must be before `app.use(express.static(...))` and before `app.get('*')`), do not add duplicate middleware.
- `node --check server.js` fails — syntax error in the inserted middleware (likely a quote issue in the CSP string); fix and re-check.
- Do NOT add `helmet` or any new dependency — set headers manually.
- Do NOT change `index.html` or externalize JSON-LD in this plan — `'unsafe-inline'` on script-src covers the inline JSON-LD. (Externalizing is a documented future hardening.)
- Do NOT add CSP to the Vite dev server (`vite.config.ts`) — it breaks HMR and E2E; CSP is a prod concern enforced by nginx/Express.
- If `nginx -t` (where available) reports a syntax error, fix the nginx.conf braces/semicolons; do not commit a broken config.

## Maintenance notes

- **Keep `nginx.conf` and `server.js` CSP in sync.** They must be the same string. If the policy changes, update both in one commit. A future improvement: factor the CSP into a shared file both read — out of scope here.
- **`'unsafe-inline'` on script-src** is required only because the JSON-LD is inline in `index.html`. To drop it (stricter CSP): move the JSON-LD to `public/ld.json`, replace the `<script type="application/ld+json">` block in `index.html` with `<link rel="application/ld+json" href="/ld.json">` (Google supports this), then change `script-src` to `'self'` only. That's a follow-up plan; verify in Search Console that the `<link>`-form JSON-LD is still parsed before merging.
- **`frame-src https://yandex.ru`** is the only cross-origin frame allowed. If another trusted embed is added, append its origin here (both nginx and server.js).
- **`connect-src 'self'`** — if the frontend ever fetches a cross-origin API directly (browser-side), add it here. The Telegram call stays server-side (not governed by CSP).
- After deploy, verify the headers with `curl -sI https://goryasno.ru/` and run the CSP through Google's CSP Evaluator to confirm no gaps.
- Plan 012's note about CSP allowing the Yandex iframe is satisfied by `frame-src https://yandex.ru` here.
