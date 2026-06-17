const CACHE_NAME = 'goryasno-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/fonts/Outfit-300-normal-1.woff2',
  '/fonts/Outfit-300-normal-10.woff2',
  '/fonts/Outfit-300-normal-2.woff2',
  '/fonts/Outfit-300-normal-3.woff2',
  '/fonts/Outfit-300-normal-4.woff2',
  '/fonts/Outfit-300-normal-5.woff2',
  '/fonts/Outfit-300-normal-6.woff2',
  '/fonts/Outfit-300-normal-7.woff2',
  '/fonts/Outfit-300-normal-8.woff2',
  '/fonts/Outfit-300-normal-9.woff2',
  '/fonts/PlayfairDisplay-400-italic-11.woff2',
  '/fonts/PlayfairDisplay-400-italic-12.woff2',
  '/fonts/PlayfairDisplay-400-italic-13.woff2',
  '/fonts/PlayfairDisplay-400-italic-14.woff2',
  '/fonts/PlayfairDisplay-400-normal-15.woff2',
  '/fonts/PlayfairDisplay-400-normal-16.woff2',
  '/fonts/PlayfairDisplay-400-normal-17.woff2',
  '/fonts/PlayfairDisplay-400-normal-18.woff2',
  '/fonts/PlayfairDisplay-400-normal-19.woff2',
  '/fonts/PlayfairDisplay-400-normal-20.woff2',
  '/fonts/PlayfairDisplay-400-normal-21.woff2',
  '/fonts/PlayfairDisplay-400-normal-22.woff2',
  '/fonts/Rubik-400-italic-23.woff2',
  '/fonts/Rubik-400-italic-24.woff2',
  '/fonts/Rubik-400-italic-25.woff2',
  '/fonts/Rubik-400-italic-26.woff2',
  '/fonts/Rubik-400-italic-27.woff2',
  '/fonts/Rubik-400-italic-28.woff2',
  '/fonts/Rubik-400-normal-29.woff2',
  '/fonts/Rubik-400-normal-30.woff2',
  '/fonts/Rubik-400-normal-31.woff2',
  '/fonts/Rubik-400-normal-32.woff2',
  '/fonts/Rubik-400-normal-33.woff2',
  '/fonts/Rubik-400-normal-34.woff2',
  '/fonts/Rubik-400-normal-35.woff2',
  '/fonts/Rubik-400-normal-36.woff2',
  '/fonts/Rubik-400-normal-37.woff2',
  '/fonts/Rubik-400-normal-38.woff2',
  '/fonts/Rubik-400-normal-39.woff2',
  '/fonts/Rubik-400-normal-40.woff2',
  '/fonts/Rubik-400-normal-41.woff2',
  '/fonts/Rubik-400-normal-42.woff2',
  '/fonts/Rubik-400-normal-43.woff2',
  '/fonts/Rubik-400-normal-44.woff2',
  '/fonts/Rubik-400-normal-45.woff2',
  '/fonts/Rubik-400-normal-46.woff2',
  '/fonts/Rubik-400-normal-47.woff2',
  '/fonts/Rubik-400-normal-48.woff2',
  '/fonts/Rubik-400-normal-49.woff2',
  '/fonts/Rubik-400-normal-50.woff2',
  '/fonts/Rubik-400-normal-51.woff2',
  '/fonts/Rubik-400-normal-52.woff2'
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
