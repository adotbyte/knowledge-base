const CACHE_NAME = 'kb-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  // Čia gali pridėti pagrindinius CSS/JS failus, bet Next.js juos generuoja automatiškai
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});