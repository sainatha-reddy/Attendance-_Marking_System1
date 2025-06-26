// Service Worker for Attendance Marking System
const CACHE_NAME = 'attendance-system-v1';
const urlsToCache = [
  '/',
  '/index.html'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Only handle navigation requests
  if (
    event.request.mode === 'navigate' &&
    !event.request.url.includes('/api/')
  ) {
    event.respondWith(
      fetch('/index.html')
    );
    return; // Prevent further handling
  }
  // For all other requests, do nothing (let default browser/network handle)
});

// Background sync for offline attendance marking
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle background sync for attendance marking
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Attendance marked successfully!',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now()
    }
  };

  event.waitUntil(
    self.registration.showNotification('Attendance System', options)
  );
}); 