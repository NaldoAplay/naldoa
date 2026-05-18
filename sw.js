// Service Worker básico para ativação do protocolo PWA da rádio
self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
    // Permite que o streaming passe direto sem travar o buffer no cache
    return;
});
