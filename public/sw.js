// Service Worker for ГориЯсно — app-shell caching with versioned cleanup.
// Bump CACHE_NAME on every deploy that changes cached assets; the activate
// handler deletes any cache whose name is not the current one.
const CACHE_NAME = 'goryasno-v3';
// Scope-relative app shell. registrationScope is the directory the SW lives in
// (e.g. "/" at a root deploy or "/goriasno/" on a subpath deploy like GitHub
// Pages). Avoids hardcoding absolute paths that break under a subpath.
const registrationScope = (self.registration && self.registration.scope) || '/';
const APP_SHELL = [registrationScope, `${registrationScope}index.html`];

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
        .catch(() => caches.match(request).then((r) => r || caches.match(`${registrationScope}index.html`)))
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
