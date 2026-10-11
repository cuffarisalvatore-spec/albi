/* Service worker di Albi in Box: apre l'app anche senza rete.
   Cambia VERSION quando pubblichi una nuova versione dei file. */
var VERSION = 'v1';
var SHELL = 'albi-shell-' + VERSION;
var RUNTIME = 'albi-runtime-v1';
var FILES = ['./', 'index.html', 'config.js', 'vendor/supabase.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SHELL).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('albi-shell-') === 0 && k !== SHELL; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function swr(req, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin === self.location.origin) {
    e.respondWith(req.mode === 'navigate'
      ? caches.open(SHELL).then(function (c) { return c.match('index.html'); }).then(function (hit) {
          fetch(req).then(function (res) { if (res && res.ok) caches.open(SHELL).then(function (c) { c.put('index.html', res); }); }).catch(function () {});
          return hit || fetch(req);
        })
      : swr(req, SHELL));
    return;
  }
  // copertine su Supabase e caratteri Google: dalla cache, aggiornate in sottofondo
  if (url.pathname.indexOf('/storage/v1/object/public/covers/') >= 0 || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(swr(req, RUNTIME));
  }
});
