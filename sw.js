// Service Worker: speichert die App beim ersten Öffnen (mit Internet) auf dem Gerät,
// danach läuft sie ohne Internet. Bei Änderungen an der App: Versionsnummer erhöhen.
var CACHE = "vokabelfussball-v1";
var FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(FILES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Aus dem Speicher antworten; im Hintergrund (falls online) auffrischen.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (cached) {
      var net = fetch(e.request).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () {
        return cached || caches.match("index.html");
      });
      return cached || net;
    })
  );
});
