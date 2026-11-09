const CACHE_NAME = 'knowledge-base-v3';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon.svg',
];

// 1. Įdiegimas (Install)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. Aktyvavimas (Activate) - išvalome senus podėlius
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. Užklausų perėmimas (Fetch)
self.addEventListener('fetch', (event) => {
  // Apeiname API ir Next.js serverio užklausas (jos turi būti dinaminės)
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('/_next/') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Jei radome podėlyje, grąžiname
      if (response) {
        return response;
      }
      // Kitu atveju einame į tinklą
      return fetch(event.request);
    })
  );
});