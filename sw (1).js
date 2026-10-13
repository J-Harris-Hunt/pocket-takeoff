// Pocket Takeoff offline cache. Bump VERSION when you upload a new index.html.
var VERSION = "pt-v2";
var CORE = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return Promise.all(CORE.map(function (u) { return c.add(new Request(u, { mode: u.indexOf("http") === 0 ? "no-cors" : "same-origin" })).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Network first so updates show up right away; fall back to the cache when offline.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(function (r) {
    var copy = r.clone();
    caches.open(VERSION).then(function (c) { c.put(e.request, copy); }).catch(function () {});
    return r;
  }).catch(function () {
    return caches.match(e.request).then(function (m) { if (m) return m;
      if (e.request.mode === "navigate") return caches.match("index.html");
      return Response.error(); });
  }));
});
