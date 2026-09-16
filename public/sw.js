const CACHE = "cadastros-conexao-v4";
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/favicon.png",
  "/logos/logo-horizontal-branco.png",
  "/logos/logo-horizontal-preto.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Ignorar requisições do Vite dev server e HMR
  if (
    url.hostname === "localhost" &&
    (url.port === "5173" || url.port === "5174" || url.port === "3000")
  ) {
    return;
  }

  // Ignorar requisições não-HTTP (ex: chrome-extension://)
  if (!url.protocol.startsWith("http")) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("/")));
    return;
  }
  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => cached || fetch(event.request)),
  );
});
