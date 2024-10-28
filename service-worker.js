const cacheName = "proxima-sessao-cache";
const staticAssets = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./assets/icon-192.png",
    "./assets/icon-512.png"
];

self.addEventListener("install", async event => {
    const cache = await caches.open(cacheName);
    await cache.addAll(staticAssets);
});

self.addEventListener("fetch", event => {
    const req = event.request;
    event.respondWith(cacheFirst(req));
});

async function cacheFirst(req) {
    const cachedResponse = await caches.match(req);
    return cachedResponse || fetch(req);
}
