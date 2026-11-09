const CACHE_NAME = 'knowledge-base-v5';
const urlsToCache = [
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
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('/_next/') ||
    event.request.method !== 'GET' ||
    event.request.destination === 'image'
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).then((response) => {
      // ✅ NEIŠSAUGOME peradresuotų atsakymų
      if (response.redirected || response.status !== 200) {
        return response;
      }

      // Talpiname tik sėkmingus (200) atsakymus
      const responseToCache = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, responseToCache);
      });

      return response;
    }).catch(() => {
      // Jei tinklas neveikia, bandome iš podėlio
      return caches.match(event.request);
    })
  );
});