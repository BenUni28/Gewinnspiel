'use strict';

const CACHE = 'gw-v3';
const PRECACHE = ['/', '/style.css', '/app.js', '/manifest.json', '/icons/icon.svg'];

// Install: cache static shell immediately
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

// Activate: delete stale caches from previous versions
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip cross-origin requests (Unsplash images, Google Fonts, etc.) —
  // the browser's own HTTP cache handles these correctly.
  if (url.origin !== self.location.origin) return;

  // API calls: always network-first; fall back to empty list so UI doesn't break
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(request).catch(() =>
        new Response('[]', { headers: { 'Content-Type': 'application/json' } })
      )
    );
    return;
  }

  // Navigation (HTML): network-first so users always get fresh contest data;
  // serve cached shell if offline
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() => caches.match('/'))
    );
    return;
  }

  // Static assets (CSS, JS, icons, fonts): cache-first, add to cache on miss
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          caches.open(CACHE).then(c => c.put(request, response.clone()));
        }
        return response;
      });
    })
  );
});
