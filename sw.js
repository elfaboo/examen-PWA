const CACHE_NAME = "caba-encuesta-cache-v2";
const FILES_TO_CACHE = [
  "/",
  "/encuestas.html",
  "/style.css",
  "/app.js",
  "/db.js",
  "/componentes/rating.js",
  "/componentes/listaComentarios.js",
  "/manifest.json",
  "assets/foto-limpieza.jpg",
  "assets/foto-transporte.jpg",
  "assets/foto-espacio-verde.jpg",
  "assets/foto-evento-gratis.jpeg",
  "assets/foto-subte.jpg",
  "assets/foto-seguridad.jpg",
  "assets/foto-accesibilidad.jpg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});