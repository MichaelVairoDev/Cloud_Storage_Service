const CACHE_VERSION = 'v1';
const CACHE_NAME = `cloudstore-${CACHE_VERSION}`;
const OFFLINE_PAGE = '/offline.html';
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/login.html',
    '/register.html',
    '/offline.html',
    '/styles.css',
    '/js/register.js',
    '/dashboard/index.html',
    '/dashboard/files.html',
    '/dashboard/shared.html',
    '/dashboard/profile.html',
    '/dashboard/settings.html',
    '/dashboard/js/auth.js',
    '/dashboard/js/common.js',
    '/dashboard/js/dashboard.js',
    '/dashboard/js/fileOperations.js',
    '/dashboard/js/files.js',
    '/dashboard/js/shared.js',
    '/dashboard/js/profile.js',
    '/dashboard/js/settings.js',
    '/dashboard/js/worker.js'
];

// Install event - precache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName.startsWith('cloudstore-') && cacheName !== CACHE_NAME)
                        .map(cacheName => caches.delete(cacheName))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - handle network requests
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    // Handle API requests
    if (event.request.url.includes('/api/')) {
        event.respondWith(handleApiRequest(event.request));
        return;
    }

    // Handle file uploads
    if (event.request.method === 'POST' && event.request.url.includes('/upload')) {
        event.respondWith(handleFileUpload(event.request));
        return;
    }

    // Handle regular GET requests with cache-first strategy
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then(response => {
                        // Cache valid responses
                        if (response.ok && response.type === 'basic') {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, responseToCache));
                        }
                        return response;
                    })
                    .catch(() => {
                        // Return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_PAGE);
                        }
                        return new Response('Offline');
                    });
            })
    );
});

// Handle API requests
async function handleApiRequest(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            // Cache successful API responses
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
            return response;
        }
    } catch (error) {
        // Return cached response if available
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        // Queue failed requests for later
        await queueFailedRequest(request);
        return new Response(JSON.stringify({ error: 'Offline' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle file uploads
async function handleFileUpload(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            return response;
        }
    } catch (error) {
        // Queue failed uploads
        await queueFailedUpload(request);
        return new Response(JSON.stringify({ error: 'Upload queued' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Background sync for failed requests
self.addEventListener('sync', event => {
    if (event.tag === 'sync-failed-requests') {
        event.waitUntil(syncFailedRequests());
    } else if (event.tag === 'sync-uploads') {
        event.waitUntil(syncPendingUploads());
    }
});

// Process failed requests queue
async function syncFailedRequests() {
    const failedRequests = await getFailedRequests();
    
    return Promise.all(
        failedRequests.map(async request => {
            try {
                await fetch(request);
                await removeFromFailedRequests(request);
            } catch (error) {
                console.error('Sync failed for request:', error);
            }
        })
    );
}

// Process pending uploads
async function syncPendingUploads() {
    const pendingUploads = await getPendingUploads();
    
    return Promise.all(
        pendingUploads.map(async upload => {
            try {
                await fetch(upload.request);
                await removeFromPendingUploads(upload);
            } catch (error) {
                console.error('Upload sync failed:', error);
            }
        })
    );
}

// Queue failed request
async function queueFailedRequest(request) {
    // Store in IndexedDB
    const db = await openDatabase();
    const tx = db.transaction('failed-requests', 'readwrite');
    const store = tx.objectStore('failed-requests');
    await store.add({
        url: request.url,
        method: request.method,
        headers: Array.from(request.headers.entries()),
        body: await request.clone().text(),
        timestamp: Date.now()
    });
}

// Queue failed upload
async function queueFailedUpload(request) {
    // Store in IndexedDB
    const db = await openDatabase();
    const tx = db.transaction('pending-uploads', 'readwrite');
    const store = tx.objectStore('pending-uploads');
    await store.add({
        url: request.url,
        method: request.method,
        headers: Array.from(request.headers.entries()),
        body: await request.clone().text(),
        timestamp: Date.now()
    });
}

// Get failed requests from IndexedDB
async function getFailedRequests() {
    const db = await openDatabase();
    const tx = db.transaction('failed-requests', 'readonly');
    const store = tx.objectStore('failed-requests');
    return store.getAll();
}

// Get pending uploads from IndexedDB
async function getPendingUploads() {
    const db = await openDatabase();
    const tx = db.transaction('pending-uploads', 'readonly');
    const store = tx.objectStore('pending-uploads');
    return store.getAll();
}

// Remove request from failed requests
async function removeFromFailedRequests(request) {
    const db = await openDatabase();
    const tx = db.transaction('failed-requests', 'readwrite');
    const store = tx.objectStore('failed-requests');
    await store.delete(request.url);
}

// Remove upload from pending uploads
async function removeFromPendingUploads(upload) {
    const db = await openDatabase();
    const tx = db.transaction('pending-uploads', 'readwrite');
    const store = tx.objectStore('pending-uploads');
    await store.delete(upload.url);
}

// Open IndexedDB database
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('cloudstore', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create stores if they don't exist
            if (!db.objectStoreNames.contains('failed-requests')) {
                db.createObjectStore('failed-requests', { keyPath: 'url' });
            }
            if (!db.objectStoreNames.contains('pending-uploads')) {
                db.createObjectStore('pending-uploads', { keyPath: 'url' });
            }
        };
    });
}

// Push notification event
self.addEventListener('push', event => {
    const options = {
        body: event.data.text(),
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: {
            url: self.registration.scope
        }
    };

    event.waitUntil(
        self.registration.showNotification('CloudStore', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(windowClients => {
                // Focus existing window if available
                for (const client of windowClients) {
                    if (client.url === event.notification.data.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window if none exists
                if (clients.openWindow) {
                    return clients.openWindow(event.notification.data.url);
                }
            })
    );
});

// Periodic sync for background updates
self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-content') {
        event.waitUntil(updateContent());
    }
});

// Update cached content
async function updateContent() {
    const cache = await caches.open(CACHE_NAME);
    
    // Update static assets
    await cache.addAll(PRECACHE_URLS);
    
    // Update dynamic content
    const dynamicUrls = [
        '/api/user/storage',
        '/api/files/recent',
        '/api/notifications'
    ];
    
    await Promise.all(
        dynamicUrls.map(async url => {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    await cache.put(url, response);
                }
            } catch (error) {
                console.error('Failed to update:', url, error);
            }
        })
    );
}

// Message event for communication with main thread
self.addEventListener('message', event => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Helper function to serialize requests
function serializeRequest(request) {
    return {
        url: request.url,
        method: request.method,
        headers: Array.from(request.headers.entries()),
        body: request.body ? request.body.toString() : null
    };
}

// Helper function to deserialize requests
function deserializeRequest(data) {
    return new Request(data.url, {
        method: data.method,
        headers: new Headers(data.headers),
        body: data.body
    });
}