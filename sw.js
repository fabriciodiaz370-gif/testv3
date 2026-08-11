// Service Worker. Además de cumplir el requisito técnico que piden los
// navegadores (Chrome/Android) para considerar el sitio "instalable" como
// app, ahora también escucha las notificaciones push que llegan del
// servidor (ver supabase/functions/enviar-notificacion) y las muestra en el
// sistema operativo, incluso con la app cerrada.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Sin caché por ahora: dejamos pasar todos los pedidos directo a la red.
});

// ============================================================
// Notificaciones push
// ============================================================
// Cuando llega un push, lo mostramos tal cual como notificación del sistema
// operativo. No guardamos nada acá: la notificación vive únicamente en el
// centro de notificaciones del teléfono, y cuando la persona la toca o la
// desliza, desaparece sola — no queda ningún registro en la app.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Training y Pádel Miramar', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Training y Pádel Miramar';
  const options = {
    body: data.body || '',
    icon: 'logo.png',
    badge: 'logo.png',
    data: { url: data.url || './index.html' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Al tocar la notificación: si ya hay una pestaña/ventana de la app abierta,
// la enfoca; si no, abre una nueva en la URL indicada.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './index.html';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});