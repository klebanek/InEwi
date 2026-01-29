// INOVIT Service Worker v4.0
const CACHE_NAME = 'inovit-cache-v4';
const OFFLINE_URL = '/inewi/';

const urlsToCache = [
    '/inewi/',
    '/inewi/index.html',
    '/inewi/app.js',
    '/inewi/style.css',
    '/inewi/manifest.json',
    '/inewi/icon-72.png',
    '/inewi/icon-96.png',
    '/inewi/icon-128.png',
    '/inewi/icon-144.png',
    '/inewi/icon-152.png',
    '/inewi/icon-180.png',
    '/inewi/icon-192.png',
    '/inewi/icon-384.png',
    '/inewi/icon-512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('INOVIT: Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('INOVIT: Removing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached version
                    return cachedResponse;
                }

                // Fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the fetched response
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // If both cache and network fail, show offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});

// Handle push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Czas na przerwę!',
        icon: 'icon-192.png',
        badge: 'icon-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            { action: 'break', title: 'Rozpocznij przerwę' },
            { action: 'dismiss', title: 'Przypomnij później' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('INOVIT', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'break') {
        // Open app and start break
        event.waitUntil(
            clients.openWindow('/inewi/?action=break')
        );
    } else {
        // Just open the app
        event.waitUntil(
            clients.openWindow('/inewi/')
        );
    }
});

// Background sync for offline data
self.addEventListener('sync', event => {
    if (event.tag === 'sync-work-data') {
        event.waitUntil(
            // Future: sync data with server
            Promise.resolve()
        );
    }
});
