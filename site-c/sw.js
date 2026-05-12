// Rabah — Service Worker v2
const CACHE = 'rabah-v2';
const SHELL = [
  '/index.html',
  '/musiciens.html',
  '/evenements.html',
  '/communaute.html',
  '/boutique.html',
  '/messages.html',
  '/404.html',
  '/rabah.css',
  '/chat-widget.js',
  '/manifest.json',
  '/assets/favicon.svg',
  '/assets/rabah-logo.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Navigation : cache-first avec fallback 404
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match(e.request).then(cached => cached ||
        fetch(e.request).catch(() => caches.match('/404.html'))
      )
    );
    return;
  }

  // Assets : stale-while-revalidate
  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      });
      return cached || net;
    })
  );
});
