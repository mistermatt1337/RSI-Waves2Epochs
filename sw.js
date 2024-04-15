const CACHE_NAME = `rsi-waves2epochs-v0.2`;
const OFFLINE_URL = `/offline.html`;

// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    cache.addAll([
      '/',
      '/index.html',
      '/offline.html',
      '/js/content.js',
      '/css/styles.css',
      '/css/footer.css',
      OFFLINE_URL
    ]);
  })());
});

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    try {
      // Try to get the response from the network
      const fetchResponse = await fetch(event.request);
      
      // If the fetch was successful, put the new resource in the cache
      const cache = await caches.open(CACHE_NAME);
      cache.put(event.request, fetchResponse.clone());

      return fetchResponse;
    } catch (e) {
      // The network request failed, try to get the result from the cache
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);

      if (cachedResponse) {
        // Return the cached response if available
        return cachedResponse;
      } else {
        // If the requested resource is not in the cache, try to serve index.html
        const cachedIndex = await cache.match('/index.html');
        if (cachedIndex) {
          return cachedIndex;
        } else {
          // If index.html is not in the cache, return the offline page
          return caches.match(OFFLINE_URL);
        }
      }
    }
  })());
});