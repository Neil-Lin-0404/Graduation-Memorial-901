const CACHE = "dmb-static-v2";

const PRECACHE = [
  "./index.htm",
  "./CSS/general.css",
  "./CSS/base.css",
  "./CSS/tokens.css",
  "./CSS/animation.css",
  "./javascript/main.js",
  "./javascript/router.js",
  "./javascript/shell.js",
  "./javascript/state.js",
  "./javascript/api.js",
  "./javascript/db.js",
  "./javascript/config.js",
  "./javascript/logger.js",
  "./javascript/utils.js",
  "./javascript/authGuard.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok && url.pathname.match(/\.(js|css|htm)$/)) {
            const clone = response.clone();
            caches.open(CACHE).then((c) => c.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
