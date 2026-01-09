const CACHE_NAME = 'elizabeth-cruz-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './img/banner-clinica.jpeg'
];

// Instala o Service Worker e salva os arquivos (Cache)
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Busca os arquivos: tenta a rede, se não der, pega do cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});