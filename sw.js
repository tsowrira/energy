// Network first with a short timeout, cache fallback: the page opens offline, and a fresh deploy wins.
var C = 'energy-v36';
function fresh(req){ return new Promise(function(res, rej){ var t = setTimeout(function(){ rej(new Error('slow')); }, 3500); fetch(req, { cache:'no-cache' }).then(function(r){ clearTimeout(t); res(r); }, function(e){ clearTimeout(t); rej(e); }); }); }
self.addEventListener('install', function(e){ self.skipWaiting(); e.waitUntil(caches.open(C).then(function(c){ return Promise.all(['./', './index.html'].map(function(u){ return fetch(u, { cache:'reload' }).then(function(r){ if (r.ok) return c.put(u, r); }); })); })); });
self.addEventListener('activate', function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== C; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch', function(e){
 if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
 e.respondWith(fresh(e.request).then(function(r){
  if (r.ok){ var cp = r.clone(); e.waitUntil(caches.open(C).then(function(c){ return c.put(e.request, cp); })); }
  return r;
 }).catch(function(){ return caches.match(e.request).then(function(m){ return m || caches.match('./index.html'); }); }));
});
