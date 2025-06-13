// Minimal Service Worker for Offline Support
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('tenant-room-v1').then(cache =>
      cache.addAll(['.', 'index.html', 'style.css', 'app.js', 'manifest.json'])
    )
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});