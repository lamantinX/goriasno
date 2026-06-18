# Plan 011: Rewrite the Service Worker (method guard, cleanup, real app-shell caching)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 69c19dc..HEAD -- public/sw.js src/main.tsx`
> If either in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. NOTE: Plan 010 pruned `public/sw.js`
> `ASSETS` to `['/', '/index.html']` and moved fonts to hashed `dist/assets`
> via @fontsource — this plan assumes that state. If 010 is not yet DONE, STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: Plan 010 (fonts moved to hashed `dist/assets`; `ASSETS` already pruned). This plan rebuilds the SW on top of that state.
- **Category**: correctness / perf (PWA)
- **Planned at**: commit `69c19dc`, 2026-06-17

## Why this matters

The hand-rolled Service Worker in `public/sw.js` is broken in four ways that
defeat the project's stated #1 goal — offline-first PWA for slow RF 3G
(`plans/README.md:30`). (1) The `fetch` handler has **no HTTP-method guard**,
so it tries to cache POST responses (including `/api/leads` lead submissions)
and opaque cross-origin responses — POSTs aren't cacheable and `cache.put`
on a POST request throws. (2) `install` does an all-or-nothing `cache.addAll`
of 54 entries — one 404 or one moment offline at install time aborts the
entire SW install. (3) There is **no `activate` handler** and `CACHE_NAME`
is never bumped, so updated deploys serve stale cached content forever and
old caches grow unbounded. (4) The precache list only ever held fonts + HTML
(Plan 010 removed the fonts), so the JS/CSS app shell was never precached —
offline navigation fetched fresh JS that might not load on flaky 3G. This
plan rewrites the SW with a method guard, versioned cleanup, and a
network-first-for-navigation / cache-first-for-static-assets strategy that
actually delivers offline app-shell behavior.

## Current state

### The repo

Single-page React 19 + Vite 6 app. Vite build emits `dist/index.html` plus
hashed `dist/assets/index-<hash>.js` and `dist/assets/index-<hash>.css`, and
(after Plan 010) hashed `dist/assets/<hash>.woff2` fonts. The SW is
registered in `src/main.tsx:12-17`:

```ts
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.error('SW registration failed:', err));
  });
}
```

`public/sw.js` (after Plan 010's prune) looks like:

```js
const CACHE_NAME = 'goryasno-v1';
const ASSETS = [
  '/',
  '/index.html',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});
```

Problems: no `activate`; no method guard; `cache.put` on POST/opaque throws
(or silently fails); no version cleanup; precache is only the HTML shell.

### Repo conventions

- `public/sw.js` is a plain JS file served from the site root (Vite copies
  `public/*` to `dist/*` verbatim). It is NOT processed by Vite/Tailwind.
  No imports allowed — it must be self-contained.
- No build step touches it; verify with `node --check public/sw.js` (syntax).
- The site is a single-page app: all navigations resolve to `index.html`
  (nginx `try_files ... /index.html`). The SW must serve `index.html` for
  navigation requests when offline.

## Commands you will need

| Purpose | Command | Expected on success |
|-----------|--------------------------|---------------------|
| Build | `npm run build` | exit 0; `dist/sw.js` present (copied from public/) |
| SW syntax check | `node --check public/sw.js` | exit 0 |
| Typecheck | `npm run lint` | exit 0 (no TS change) |
| E2E (SW registers, no console error) | `npx playwright test --project=chromium` | all pass |

## Scope

**In scope**:
- `public/sw.js` (full rewrite — replace the entire file with the target below)

**Out of scope** (do NOT touch):
- `src/main.tsx` — the registration code is already correct; do not change it.
  (If you want to add `self.skipWaiting()`/`clients.claim()` behavior, that
  lives in the SW, not main.tsx.)
- `server.js`, `nginx.conf` — not part of the SW story.
- `vite.config.ts` — do not add `vite-plugin-pwa` here (that's direction D1,
  not selected). This plan keeps the hand-rolled SW but makes it correct.
- The `/api/leads` POST flow — the SW must NOT cache it; it passes through.

## Git workflow

- Branch: `advisor/011-service-worker-fix`
- Commit message style: `fix(pwa): rewrite service worker with method guard, versioned cleanup, app-shell caching`

## Steps

### Step 1: Replace `public/sw.js` with the corrected version

Overwrite the entire contents of `public/sw.js` with:

```js
// Service Worker for ГориЯсно — app-shell caching with versioned cleanup.
// Bump CACHE_NAME on every deploy that changes cached assets; the activate
// handler deletes any cache whose name is not the current one.
const CACHE_NAME = 'goryasno-v2';
const APP_SHELL = ['/', '/index.html'];

// On install: precache only the HTML app shell (small, stable). Hashed
// JS/CSS/woff2 assets are picked up at runtime by the fetch handler
// (cache-first for same-origin static GETs).
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  // Take over immediately instead of waiting for all tabs to close.
  self.skipWaiting();
});

// On activate: delete caches from previous versions, then claim open clients
// so the new SW controls them without a reload.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Only handle GET requests; let everything else (POST /api/leads, etc.) go
// straight to the network, uncached.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Navigation requests (HTML pages): network-first so users get fresh
  // content when online, fall back to cached index.html when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache a copy of the fresh HTML for offline use.
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/index.html')))
    );
    return;
  }

  // Same-origin static assets (hashed JS/CSS/woff2 in /assets/): cache-first
  // with runtime population. Hashed filenames are immutable, so a cached
  // copy is always valid. Skip cross-origin (e.g. the Yandex map iframe).
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          // Only cache successful, basic responses (avoid caching errors or
          // opaque responses that can't be inspected).
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        });
      })
    );
    return;
  }

  // Cross-origin GETs (e.g. Yandex maps): pass through, do not cache.
  // (Default: do nothing → browser handles the request normally.)
});

// Allow the page to trigger an immediate update when a new SW is waiting.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
```

Key correctness properties of this version:
- `request.method !== 'GET'` guard → POST `/api/leads` is never intercepted/cached.
- `request.mode === 'navigate'` → network-first for pages, offline fallback to `/index.html`.
- Same-origin static GETs → cache-first with runtime population; only `status === 200 && type === 'basic'` cached (no opaque/error caching).
- Cross-origin GETs → pass-through (no opaque-response caching).
- `activate` deletes old caches; `skipWaiting` + `clients.claim()` so updates apply promptly.
- `CACHE_NAME = 'goryasno-v2'` — the bump from v1 triggers old-cache deletion on activate.

**Verify**: `node --check public/sw.js` → exit 0 (no syntax error).

### Step 2: Build and confirm the SW is emitted

**Verify**: `npm run build` → exit 0; `dist/sw.js` exists (Vite copies `public/sw.js` to `dist/`). Confirm with `Test-Path dist/sw.js` (PowerShell) or `ls dist/sw.js`.

### Step 3: Confirm the app shell + a hashed asset get cached on load

Run the dev server and load the page with a clean SW state:

1. `npm run dev`
2. Open http://localhost:3000 in a Chromium browser, DevTools → Application → Service Workers → check "Update on reload" for the test, then reload.
3. Confirm the SW `goryasno-v2` registers and activates (status: activated).
4. DevTools → Application → Cache Storage → `goryasno-v2` → should contain `/` and `/index.html` after first load, and after a second load should also contain the hashed `index-<hash>.js` / `index-<hash>.css` / `*.woff2` (runtime-cached).
5. DevTools → Network → set "Offline", reload → the page should still load (served from cache), confirming offline app-shell works.

If you cannot do the browser inspection (e.g. headless worktree), rely on Step 4's E2E gate plus the syntax check; note in your report that the offline manual check was skipped.

### Step 4: Regression gate

**Verify**:
- `npm run lint` exits 0
- `npm run build` exits 0
- `npx playwright test --project=chromium` → all 4 tests pass (the SW should not interfere; Playwright's `webServer` serves the dev server and the SW registers but tests assert on DOM, not caches). If a test fails with a SW-related console error (e.g. `cache.addAll` rejected), STOP — the APP_SHELL precache failed, likely because `/` or `/index.html` isn't served by the dev server the way the SW expects; report the exact error.

## Test plan

- No automated SW tests exist and adding one is out of scope (would need
  Playwright `context.serviceWorkers()` + offline emulation). The gate is:
  syntax check (Step 1), build emits `dist/sw.js` (Step 2), and the existing
  E2E suite stays green (Step 4).
- The manual offline check (Step 3.5) is the proof that the offline-first
  goal is met; if skipped in a headless worktree, flag it for the reviewer
  to do before merging.

## Done criteria

ALL must hold:

- [ ] `public/sw.js` matches the target in Step 1 (method guard, `activate` + cleanup, `skipWaiting` + `clients.claim()`, network-first navigate, cache-first same-origin static, cross-origin pass-through, `CACHE_NAME = 'goryasno-v2'`)
- [ ] `node --check public/sw.js` exits 0
- [ ] `npm run build` exits 0 and `dist/sw.js` exists
- [ ] `npm run lint` exits 0
- [ ] `npx playwright test --project=chromium` passes all 4
- [ ] `git status` shows changes ONLY to `public/sw.js`
- [ ] `plans/README.md` status row for 011 updated

## STOP conditions

- `public/sw.js` doesn't match the "Current state" excerpt (Plan 010's prune
  didn't land, or someone else edited the SW) — reconcile before proceeding.
  This plan assumes Plan 010 is DONE (fonts in hashed `dist/assets`,
  `ASSETS` already `['/', '/index.html']`).
- `node --check public/sw.js` reports a syntax error you can't fix in one
  attempt — do not ship a syntactically invalid SW.
- An E2E test fails with a Service Worker console error (e.g. `cache.addAll`
  rejected, or `cache.put` threw on a POST) — that means the method guard
  or APP_SHELL is wrong; report the exact error rather than weakening tests.
- Do NOT add `vite-plugin-pwa` or any build plugin — that's direction D1
  (not selected). Keep the hand-rolled SW.
- Do NOT cache cross-origin requests (Yandex map iframe) — opaque responses
  waste cache space and can't be validated. The target SW passes them
  through; keep it that way.

## Maintenance notes

- **Bump `CACHE_NAME`** (e.g. `goryasno-v2` → `goryasno-v3`) on every deploy
  that changes cached assets. The `activate` handler deletes older caches.
  Forgetting to bump means users see stale content until they hard-reload.
- The hashed `dist/assets/*` filenames are the cache-busting mechanism for
  JS/CSS/fonts — old hashed assets get evicted by the `activate` cleanup of
  the previous CACHE_NAME. No manual asset-list maintenance needed.
- If `/api/leads` ever adds a GET endpoint (e.g. fetching lead status), the
  current SW would runtime-cache it (same-origin GET). If that's undesired,
  add an `if (url.pathname.startsWith('/api/')) return;` pass-through before
  the same-origin static branch.
- If the maintainer later adopts `vite-plugin-pwa` (direction D1), this
  hand-rolled SW is replaced entirely — delete `public/sw.js` and the
  `main.tsx` registration at that point (the plugin injects its own).
- The `SKIP_WAITING` message handler is forward-looking (lets the page call
  `reg.waiting.postMessage('SKIP_WAITING')` to apply an update instantly).
  No UI uses it today; it's harmless and ready for a "new version available"
  toast.
