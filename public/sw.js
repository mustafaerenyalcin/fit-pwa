/**
 * Fit PWA Service Worker v2.2.0 (FIT. ATELIER - ELITE ATHLETE & SQUAD WAGERS)
 * Offline-first caching with stale-while-revalidate for static assets
 * and immediate network-first for document navigation.
 */

const CACHE_NAME = 'fit-atelier-v3.2.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/gizlilik.html',
  '/kosullar.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/images/workout-bg.jpg',
  '/images/nutrition-bg.jpg',
  '/images/recovery-bg.jpg',
  '/images/programs/abs-beginner.jpg',
  '/images/programs/abs-intermediate.jpg',
  '/images/programs/abs-advanced.jpg',
  '/images/programs/chest-beginner.jpg',
  '/images/programs/chest-intermediate.jpg',
  '/images/programs/chest-advanced.jpg',
  '/images/programs/arm-beginner.jpg',
  '/images/programs/arm-intermediate.jpg',
  '/images/programs/leg-beginner.jpg',
  '/images/programs/leg-advanced.jpg',
  '/images/programs/back-beginner.jpg',
  '/images/programs/back-advanced.jpg',
  '/images/tools/fasting-v2.jpg',
  '/images/tools/hydration.jpg',
  '/images/tools/buddy-squad.svg',
  '/images/tools/1rm-plates.svg',
  '/images/tools/tabata-hiit.svg',
  '/images/tools/adonis-ratio.svg',
  '/images/tools/metabolic-tdee.svg',
  '/images/tools/recovery-hrv.svg',
  '/images/tools/body-morph.svg',
  '/images/tools/form-biomech.svg',
  '/images/tools/genetic-ceiling.svg',
  '/images/tools/coach-ai.svg'
];

// Install: Cache critical application shell resiliently & skip waiting immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(STATIC_ASSETS.map((asset) => cache.add(asset)))
    )
  );
});

// Activate: Purge ALL old caches immediately and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: Strategic offline-first routing
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Bypass Supabase API, Edge Functions, and external analytics
  if (url.origin !== self.location.origin || url.pathname.includes('/functions/')) {
    return;
  }

  // 1. Navigation requests (HTML): Network first with offline cache fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
          }
          return response;
        })
        .catch(async () => {
          const match = await caches.match('/');
          if (match) return match;
          return (await caches.match('/index.html')) || Response.error();
        })
    );
    return;
  }

  // 2. Static assets (JS, CSS, Images): Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});