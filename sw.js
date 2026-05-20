const CACHE_NAME = 'naldoa-play-v1';
const urlsToCache = [
  '/naldoa/',
  '/naldoa/index.html',
  '/naldoa/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});