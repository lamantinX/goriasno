# Plan 023: Add HSTS header, drop script-src 'unsafe-inline', add Twitter Card meta

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
- **Risk**: MED (CSP change can break script loading if assumptions are wrong — verify in Step 2)
- **Depends on**: none
- **Category**: security / seo
- **Planned at**: commit `b1ac6d3`, 2026-06-30

## Why this matters

Three header/meta hygiene fixes that the served HTML and API responses are
missing:

1. **HSTS** — no `Strict-Transport-Security` header is sent, so a browser that
   first reaches the site over HTTP can be downgraded/MITM'd before it learns to
   use HTTPS. (Per the operator's decision, this plan adds the **HSTS header
   only**; it does NOT add a 443 server block or an http→https redirect — TLS is
   terminated upstream.)
2. **`script-src 'unsafe-inline'`** — the CSP allows inline `<script>` execution,
   which defeats much of CSP's XSS protection. The built `dist/index.html`
   contains **no inline executable JS** — only an external module script
   (`<script type="module" ... src="/assets/index-*.js">`) and a non-executable
   `<script type="application/ld+json">` block (data, not script, allowed
   regardless). So `'unsafe-inline'` can be removed from `script-src` safely.
3. **Twitter Card meta** — `index.html` has Open Graph tags but no
   `twitter:card`/`twitter:title`/etc., so links shared on Twitter/X (and other
   consumers that read Twitter tags) render a bare URL.

## Current state

- `server.js:26-36` — security-header middleware (mirrors nginx). CSP excerpt:

  ```js
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://yandex.ru; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
  );
  ```
  No `Strict-Transport-Security` line.

- `nginx.conf:13-17` — server-level `add_header` directives, including the same
  CSP string. No HSTS line. Comment at lines 12 + 20-21 notes that per-location
  `add_header` overrides server-level ones (an nginx quirk) — the static-asset
  `location ~* ...` at lines 22-26 re-adds `X-Content-Type-Options`. HSTS only
  needs to apply to HTML responses (the `location /` path), so adding it at
  server level is sufficient for the document response.

- `index.html:16-20` — Open Graph tags exist; **no `twitter:*` tags**:

  ```html
  <meta property="og:title" content="Купить уголь, дрова, песок и щебень в Донецке со склада | ГориЯсно" />
  <meta property="og:description" content="Антрацит, уголь Т и ДГ, дрова, песок, щебень, вывоз мусора в Донецке. Цены от 600 ₽/мешок, от 9000 ₽/т. Доставка по ДНР. Тел: +7 (949) 340-10-11, МТС: +7 (988) 994-68-96." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://goryasno.ru" />
  <meta property="og:image" content="https://goryasno.ru/images/products/anthracite-bags.jpg" />
  ```

- Convention: `server.js` and `nginx.conf` are intentionally kept **in sync**
  (comment at `server.js:25`: "keep in sync with nginx.conf"). Any header change
  must be applied to **both** files.

## Commands you will need

| Purpose        | Command                              | Expected on success    |
|----------------|--------------------------------------|------------------------|
| Typecheck      | `npm run lint`                       | exit 0, no errors      |
| Build          | `npm run build`                      | exit 0                 |
| Verify         | `bash scripts/run-quiet.sh verify`   | exit 0, silent on pass |
| nginx syntax   | `nginx -t -c "$PWD/nginx.conf"`      | "syntax is ok" (skip if nginx not installed — see Step 1) |
| Inspect build  | `grep -nE '<script' dist/index.html` | only ld+json + one external `src=` script |

## Scope

**In scope**:
- `nginx.conf` — add HSTS `add_header`; remove `'unsafe-inline'` from `script-src`.
- `server.js` — add HSTS `setHeader`; remove `'unsafe-inline'` from `script-src`.
- `index.html` — add Twitter Card meta tags.

**Out of scope** (do NOT touch):
- The `style-src 'unsafe-inline'` — Tailwind/inline styles may rely on it; this
  plan changes **script-src only**. Leave `style-src` exactly as-is.
- Any 443 `server {}` block / http→https redirect / `listen` directive —
  explicitly excluded per operator decision (TLS terminates upstream).
- `frame-src`, `img-src`, and all other CSP directives — unchanged.

## Git workflow

- Branch: `advisor/023-headers-csp-twitter-card`
- Commit style: conventional commits. Suggested:
  `feat(security): add HSTS, drop script-src unsafe-inline; add Twitter Card meta`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Add HSTS header (both files)

In `server.js`, inside the header middleware (after the `Permissions-Policy`
line, ~line 30), add:

```js
res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
```

In `nginx.conf`, in the server-level header block (after the `Permissions-Policy`
`add_header`, ~line 16), add:

```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
```

(`max-age=63072000` = 2 years, the value HSTS preload requires.)

**Verify**: `npm run lint` → exit 0. If nginx is installed locally, run
`nginx -t -c "$PWD/nginx.conf"` → "syntax is ok". If nginx is NOT installed,
skip the nginx syntax check (do not install it) and rely on the grep check in
Done criteria.

### Step 2: Remove 'unsafe-inline' from script-src (both files)

First confirm the build has no inline executable script:

```bash
npm run build
grep -nE '<script' dist/index.html
```
Expected: exactly two `<script` matches — one `type="application/ld+json"`
(data) and one `type="module" ... src="/assets/index-*.js"` (external). If you
see any `<script>` WITHOUT a `src` and WITHOUT `type="application/ld+json"`,
**STOP** (see STOP conditions) — removing `'unsafe-inline'` would break it.

Then, in BOTH `server.js` (line 33) and `nginx.conf` (line 17), change the CSP
substring:

```
script-src 'self' 'unsafe-inline';
```
to:
```
script-src 'self';
```

Leave `style-src 'self' 'unsafe-inline'` untouched. Change nothing else in the
CSP string. Keep the two CSP strings identical to each other.

**Verify**: `npm run lint` → exit 0; `npm run build` → exit 0;
`grep -c "script-src 'self' 'unsafe-inline'" server.js nginx.conf` returns 0 for
both files.

### Step 3: Add Twitter Card meta tags

In `index.html`, after the Open Graph block (after line 20, the `og:image`
line), add:

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Купить уголь, дрова, песок и щебень в Донецке со склада | ГориЯсно" />
<meta name="twitter:description" content="Антрацит, уголь Т и ДГ, дрова, песок, щебень, вывоз мусора в Донецке. Цены от 600 ₽/мешок, от 9000 ₽/т. Доставка по ДНР. Тел: +7 (949) 340-10-11, МТС: +7 (988) 994-68-96." />
<meta name="twitter:image" content="https://goryasno.ru/images/products/anthracite-bags.jpg" />
```

(Reuse the exact title/description/image values from the existing OG tags so the
two stay consistent.)

**Verify**: `npm run build` → exit 0; `grep -c 'twitter:' dist/index.html`
returns 4.

## Test plan

- No automated header test exists; verification is build + grep (Done criteria).
- Optional manual check after deploy: `curl -sI https://goryasno.ru/ | grep -i
  'strict-transport\|content-security'` should show the HSTS header and the CSP
  without `'unsafe-inline'` in `script-src`. (Not runnable from CI; informational.)

## Done criteria

ALL must hold:

- [ ] `npm run lint` exits 0
- [ ] `npm run build` exits 0
- [ ] `grep -c 'Strict-Transport-Security' server.js` ≥ 1 and
      `grep -c 'Strict-Transport-Security' nginx.conf` ≥ 1
- [ ] `grep -c "script-src 'self' 'unsafe-inline'" server.js` == 0 and same for
      `nginx.conf`
- [ ] `grep -c "style-src 'self' 'unsafe-inline'" server.js` == 1 (style-src
      unchanged) and same for `nginx.conf`
- [ ] `grep -c 'twitter:' dist/index.html` == 4
- [ ] No 443/`listen`/redirect lines added to `nginx.conf` (diff review)
- [ ] No files outside `nginx.conf`, `server.js`, `index.html` modified
      (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- The Step 2 build inspection shows an inline `<script>` block that is NOT
  `type="application/ld+json"` and has NO `src` — removing `'unsafe-inline'`
  would break the page; report it instead of proceeding.
- Any of `nginx.conf` / `server.js` / `index.html` does not match the "Current
  state" excerpts (drifted).
- `nginx -t` reports a syntax error you cannot resolve by matching the existing
  `add_header ... always;` directive style.
- A verification fails twice after a reasonable fix attempt.

## Maintenance notes

- `server.js` and `nginx.conf` headers are deliberately mirrored — any future
  header change must touch both, or they diverge.
- HSTS `preload` directive implies an intent to submit the domain to the HSTS
  preload list; only keep `preload` if the operator actually wants that. If
  unsure, the header is still valid and useful without it — but do not remove it
  unilaterally here; flag in review.
- If a future build introduces a genuine inline script (e.g. an analytics
  snippet), `script-src 'self'` will block it; the correct fix then is a nonce or
  hash, not re-adding `'unsafe-inline'`.
- Reviewer: confirm the two CSP strings remain byte-identical between the two
  files, and that `style-src` was not touched.
