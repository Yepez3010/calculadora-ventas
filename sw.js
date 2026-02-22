// sw.js - Cotizador Pro (GitHub Pages / hosting estático)
// Nota: Para que funcione offline, sirve el sitio por HTTPS (GitHub Pages lo hace).
const CACHE = "cotizador-pro-v1";
const CORE = [
  "./",
  "./index.html",
  "./manifest.json"
];

// Install: cache core
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

// Activate: cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k !== CACHE) ? caches.delete(k) : null)))
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first for HTML, cache-first for assets
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if(url.origin !== location.origin) return;

  // HTML: network first
  if(req.mode === "navigate" || (req.headers.get("accept")||"").includes("text/html")){
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put("./index.html", copy)).catch(()=>{});
        return res;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Assets: cache first
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(cache => cache.put(req, copy)).catch(()=>{});
      return res;
    }))
  );
});
