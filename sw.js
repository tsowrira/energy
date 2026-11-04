// Network first, cache fallback: the page opens offline, but a fresh deploy wins.
var C = 'energy-v5';
self.addEventListener('install', function(e){ self.skipWaiting(); e.waitUntil(caches.open(C).then(function(c){ return c.addAll(['./', './index.html']); })); });
self.addEventListener('activate', function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== C; }).map(function(k){ return caches.delete(k); })); })); });
self.addEventListener('fetch', function(e){
 if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
 e.respondWith(fetch(e.request).then(function(r){ var cp = r.clone(); caches.open(C).then(function(c){ c.put(e.request, cp); }); return r; }).catch(function(){ return caches.match(e.request); }));
});
