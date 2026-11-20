// À chaque nouvelle version de l'appli : change VERSION ici (et APP_VERSION dans index.html).
// Ce changement permet à l'appli installée de détecter la mise à jour et de prévenir l'utilisateur.
const VERSION = "1.2";
const C = "musique-" + VERSION;
const FILES = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => clients.claim())
  );
});

// Réseau d'abord (toujours la dernière version en ligne), cache en secours hors connexion.
// L'API Jamendo et l'audio ne sont jamais interceptés.
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: "no-cache" })
      .then(r => {
        const copy = r.clone();
        caches.open(C).then(c => c.put(e.request, copy));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
