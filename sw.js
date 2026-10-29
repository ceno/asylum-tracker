// Network first, so every load gets the latest deploy instead of a copy that
// GitHub Pages lets the browser reuse for 10 minutes. The cache is only used
// when the network fails, so the app still opens offline.
const CACHE = "asylum-tracker";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET" || new URL(request.url).origin !== location.origin) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(request.url, { cache: "no-cache" });
      if (res.ok) await caches.open(CACHE).then((c) => c.put(request.url, res.clone())).catch(() => {});
      return res;
    } catch (_) {
      return (await caches.match(request.url)) || Response.error();
    }
  })());
});
