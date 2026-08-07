// Service Worker mínimo. Su única función por ahora es cumplir el requisito
// técnico que piden los navegadores (Chrome/Android) para considerar el
// sitio "instalable" como app — no cachea nada todavía. Si más adelante
// quieren que la app funcione offline, acá es donde se agregaría esa lógica.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Sin caché por ahora: dejamos pasar todos los pedidos directo a la red.
});