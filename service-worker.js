const CACHE = "dmb-static-v5";

const BASE = self.location.pathname.replace(/[^/]+$/, "");

const ASSETS = [
  "index.htm",
  "404.html",
  "frontend/CSS/general.css",
  "frontend/CSS/base.css",
  "frontend/CSS/tokens.css",
  "frontend/CSS/animation.css",
  "frontend/CSS/images.css",
  "frontend/CSS/components/ui.css",
  "frontend/CSS/components/auth.css",
  "frontend/CSS/components/polaroid.css",
  "frontend/CSS/components/chips.css",
  "frontend/CSS/components/modal.css",
  "frontend/CSS/components/forms.css",
  "frontend/CSS/components/memory-card.css",
  "frontend/CSS/components/uploader.css",
  "frontend/CSS/components/theme-picker.css",
  "frontend/CSS/components/landing.css",
  "frontend/javascript/main.js",
  "frontend/javascript/paths.js",
  "frontend/javascript/router.js",
  "frontend/javascript/shell.js",
  "frontend/javascript/state.js",
  "frontend/javascript/api.js",
  "frontend/javascript/db.js",
  "frontend/javascript/config.js",
  "frontend/javascript/logger.js",
  "frontend/javascript/utils.js",
  "frontend/javascript/authGuard.js",
  "frontend/javascript/animation.js",
  "frontend/javascript/themePicker.js",
  "frontend/javascript/landingHero.js",
  "frontend/javascript/views/landing.js",
  "frontend/javascript/views/auth.js",
  "frontend/javascript/views/feed.js",
  "frontend/javascript/views/memoryDetail.js",
  "frontend/javascript/views/memoryEditor.js",
  "frontend/javascript/views/profile.js",
  "frontend/javascript/views/messages.js",
  "frontend/javascript/components/uploader.js",
  "frontend/javascript/components/memoryCard.js",
  "frontend/javascript/components/modal.js",
  "frontend/javascript/components/chips.js",
  "frontend/javascript/components/polaroid.js",
];

const PRECACHE = ASSETS.map((path) => `${BASE}${path}`);

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
          if (response.ok && url.pathname.match(/\.(js|css|htm|html|jpg|jpeg|png|webp)$/)) {
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
