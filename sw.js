/* Service worker di inBOX: apre l'app anche senza rete.
   Cambia VERSION quando pubblichi una nuova versione dei file. */
var VERSION = 'v32';
var SHELL = 'albi-shell-' + VERSION;
/* v3: svuota le copertine salvate dalle versioni precedenti, che potevano contenere risposte d'errore */
var RUNTIME = 'albi-runtime-v3';
var FILES = ['./', 'index.html', 'config.js', 'vendor/supabase.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SHELL).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return (k.indexOf('albi-shell-') === 0 && k !== SHELL) || (k.indexOf('albi-runtime-') === 0 && k !== RUNTIME); }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

/* dalla cache, aggiornati in sottofondo; si salvano solo risposte andate a buon fine
   (per i caratteri Google anche quelle «opache», che non si possono controllare) */
function swr(req, cacheName, allowOpaque) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && (res.ok || (allowOpaque && res.type === 'opaque'))) cache.put(req, res.clone()).catch(function () {});
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  });
}

/* copertine: ogni file su Supabase ha un nome unico e non cambia mai, quindi se è già in cache
   non serve richiederlo di nuovo. Si scarica in modalità CORS per sapere se la risposta è buona,
   e si salva solo se lo è: un errore temporaneo del server non sostituisce più una copertina buona. */
function coverFirst(req, url) {
  var key = url.origin + url.pathname;
  return caches.open(RUNTIME).then(function (cache) {
    return cache.match(key).then(function (hit) {
      if (hit) return hit;
      return fetch(key, { mode: 'cors', credentials: 'omit' }).then(function (res) {
        if (res && res.ok) cache.put(key, res.clone()).catch(function () {});
        return res;
      }, function () {
        /* CORS non disponibile o rete assente: si prova la richiesta normale, senza salvarla */
        return fetch(req);
      });
    });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  var url = new URL(req.url);
  // immagine condivisa dal menu «Condividi» del telefono: la teniamo da parte e riapriamo l'app
  if (req.method === 'POST' && url.origin === self.location.origin && /share-target$/.test(url.pathname)) {
    e.respondWith((async function () {
      try {
        var fd = await req.formData();
        var f = fd.get('image');
        if (f && f.size) {
          var cache = await caches.open('albi-share');
          await cache.put('shared-image', new Response(f, { headers: { 'Content-Type': f.type || 'image/jpeg' } }));
        }
      } catch (err) { /* l'app mostrerà che non è arrivato nulla */ }
      return Response.redirect(new URL('./?shared=1', self.registration.scope).href, 303);
    })());
    return;
  }
  if (req.method !== 'GET') return;
  if (url.origin === self.location.origin) {
    e.respondWith(req.mode === 'navigate'
      ? caches.open(SHELL).then(function (c) { return c.match('index.html'); }).then(function (hit) {
          fetch(req).then(function (res) { if (res && res.ok) caches.open(SHELL).then(function (c) { c.put('index.html', res); }); }).catch(function () {});
          return hit || fetch(req);
        })
      : swr(req, SHELL));
    return;
  }
  // copertine su Supabase: dalla cache se ci sono, altrimenti dalla rete
  if (url.pathname.indexOf('/storage/v1/object/public/covers/') >= 0) {
    e.respondWith(coverFirst(req, url));
    return;
  }
  // caratteri Google: dalla cache, aggiornati in sottofondo
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(swr(req, RUNTIME, true));
  }
});
