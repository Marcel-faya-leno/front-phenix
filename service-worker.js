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
                        // Vérifier la validité du cache en arrière-plan
                        checkCacheValidity(cache, request);
                        return response;
                    }

                    // Si pas en cache, essayer le réseau
                    return fetch(request).then((networkResponse) => {
                        // Sauvegarder la réponse en cache avec timestamp
                        if (networkResponse.ok) {
                            const responseToCache = networkResponse.clone();
                            cache.put(request, new Response(
                                responseToCache.body,
                                {
                                    status: networkResponse.status,
                                    statusText: networkResponse.statusText,
                                    headers: new Headers(networkResponse.headers)
                                }
                            )).then(() => {
                                console.log('💾 Image cachée:', url.href);
                            });
                        }
                        return networkResponse;
                    }).catch((error) => {
                        console.error('❌ Erreur réseau pour image:', url.href);
                        // Retourner l'image en cache même obsolète si le réseau échoue
                        return cache.match(request);
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
                        // Mettre à jour le cache en arrière-plan
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, response.clone());
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
                return fetch(request).then((response) => {
                    if (request.method === 'GET' && response.ok) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, response.clone());
                        });
                    }
                    return response;
                });
            })
            .catch(() => {
                console.log('❌ Ressource non disponible hors ligne');
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
