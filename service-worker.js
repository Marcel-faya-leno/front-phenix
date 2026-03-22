// Service Worker pour PHENIX-TECH-SERVICES
// Cache les images pendant 7 jours pour une persistance robuste

const CACHE_NAME = 'phenix-images-v1';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 jours en ms
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/responsive.css',
    '/css/font-awesome.min.css',
    '/theme.js',
    '/config.js',
    '/api.js'
];

// Installation du service worker
self.addEventListener('install', (event) => {
    console.log('🔧 Installation du Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('💾 Mise en cache des assets...');
            return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
                console.warn('Certains assets n\'ont pas pu être cachés:', error);
                // Ne pas échouer si certains assets ne sont pas disponibles
                return Promise.resolve();
            });
        })
    );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
    console.log('✨ Activation du Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Reprendre le contrôle immédiatement
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Stratégie pour les images: Cache First, Network Fallback
    if (request.destination === 'image') {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(request).then((response) => {
                    if (response) {
                        console.log('📦 Image du cache:', url.href);
                        return response;
                    }

                    // Si pas en cache, essayer le réseau
                    return fetch(request)
                        .then((networkResponse) => {
                            // Sauvegarder la réponse en cache si OK
                            if (networkResponse.ok && networkResponse.status === 200) {
                                const responseToCache = networkResponse.clone();
                                cache.put(request, responseToCache).catch((err) => {
                                    console.warn('⚠️ Erreur cache image:', err);
                                });
                            }
                            return networkResponse;
                        })
                        .catch((error) => {
                            console.error('❌ Erreur réseau pour image:', url.href, error);
                            // Retourner l'image en cache si le réseau échoue
                            return cache.match(request) || new Response('Image non disponible', { status: 404 });
                        });
                });
            })
        );
        return;
    }

    // Stratégie pour les pages HTML: Network First, Cache Fallback
    if (request.method === 'GET' && (url.pathname.endsWith('.html') || url.pathname === '/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok) {
                        // Mettre à jour le cache en arrière-plan avec un clone
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                        return response;
                    }
                    return caches.match(request);
                })
                .catch(() => {
                    console.log('⚠️ Mode hors ligne - récupération depuis cache');
                    return caches.match(request);
                })
        );
        return;
    }

    // Stratégie pour les API: Network Only (pour les données fraîches)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(fetch(request));
        return;
    }

    // Stratégie par défaut: Cache First pour les assets
    event.respondWith(
        caches.match(request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(request).then((networkResponse) => {
                    if (request.method === 'GET' && networkResponse.ok && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return networkResponse;
                });
            })
            .catch(() => {
                console.log('❌ Ressource non disponible hors ligne');
                return new Response('Ressource non disponible', { status: 503 });
            })
    );
});

// Message handler pour communication avec les clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('🗑️ Cache vidé');
            event.ports[0].postMessage({ success: true });
        });
    }
});

// Fonction pour vérifier la validité du cache
function checkCacheValidity(cache, request) {
    // Vérifier quotidiennement si les URLs de cache sont toujours valides
    fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
            } else {
                console.warn('⚠️ Image retournée en erreur, suppression du cache');
                cache.delete(request);
            }
        })
        .catch(() => {
            // Réseau indisponible, garder le cache
        });
}
