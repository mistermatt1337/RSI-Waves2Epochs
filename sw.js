const CACHE_NAME = `rsi-waves2epochs`;

// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      // Fetch the manifest file
      const response = await fetch('./manifest.webmanifest');
      const manifest = await response.json();

      const cache = await caches.open(CACHE_NAME);
      await cache.addAll([
        './index.html',
        './js/content.js',
        './css/styles.css',
        './css/footer.css',
        './img/16.png',
        './img/32.png',
        './img/48.png',
        './img/64.png',
        './img/128.png',
        './img/192.png',
        './img/256.png',
        './img/512.png',
        'https://img.shields.io/badge/SC--Open-gold?style=for-the-badge&link=https%3A%2F%2Fgithub.com%2FSC-Open',
        'https://img.shields.io/badge/RSI--Waves2Epochs-blue?style=for-the-badge&logo=github&link=https%3A%2F%2Fgithub.com%2FSC-Open%2FRSI-Waves2Epochs',
        'https://img.shields.io/github/license/sc-open/RSI-Waves2Epochs?style=for-the-badge',
        'https://img.shields.io/github/sponsors/mistermatt1337?style=for-the-badge&logo=githubsponsors&link=https%3A%2F%2Fbit.ly%2F3TP4yKD',
        'https://img.shields.io/badge/Patreon-Support_us!-orange?style=for-the-badge&logo=patreon&link=https%3A%2F%2Fbit.ly%2FSCOpenDevPatreon',
        'https://img.shields.io/badge/RSI-Enlist_now!-blue?style=for-the-badge&logo=spaceship&link=https%3A%2F%2Fbit.ly%2FSCBonus5K',
        'https://img.shields.io/discord/1113924866580684911?style=for-the-badge&logo=discord&logoColor=white&label=SC%20Open&color=gold&link=https%3A%2F%2Fbit.ly%2FSCOpen-Discord',
      ]);
    } catch (err) {
      console.error('Error during service worker installation:', err);
    }
  })());
});

async function evaluateAndCache(request, event) {
  // Use event if provided, otherwise use the global event
  event = event || self;
  // Try to get the response from the network
  const fetchResponse = await fetch(event.request);
  // Try to get the response from the cache
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(event.request);

  if (cachedResponse) {
    // Compare the network response with the cached response
    const fetchResponseClone = fetchResponse.clone();
    const fetchResponseText = await fetchResponseClone.text();
    const cachedResponseClone = cachedResponse.clone();
    const cachedResponseText = await cachedResponseClone.text();

    if (fetchResponseText !== cachedResponseText) {
      // If the network response is different from the cached response, update the cache
      await cache.put(request, fetchResponse.clone());
    }
  } else {
    // If the response is not in the cache, put it in the cache
    await cache.put(request, fetchResponse.clone());
  }

  // Preserve the contentType
  const url = new URL(request.url);
  const extension = url.pathname.split('.').pop();
  let contentType = '';
  switch (extension) {
    case 'html':
      contentType = 'text/html';
      break;
    case 'css':
      contentType = 'text/css';
      break;
    case 'js':
      contentType = 'application/javascript';
      break;
    case 'png':
      contentType = 'image/png';
      break;
    // Add more cases as needed
  }
  // This code seeks to solve some content header issues
  const newResponse = new Response(fetchResponse.body, {
    status: fetchResponse.status,
    statusText: fetchResponse.statusText,
    headers: {'Content-Type': contentType}
  });

  return newResponse;
}

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    try {
      const fetchResponse = await evaluateAndCache(event.request, event);
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
        const cachedIndex = await cache.match('./index.html');
        if (cachedIndex) {
          return cachedIndex;
        }
      }
    }
  })());
});

// Background Sync Functionality
async function fetchNewContent(event) {
  // Fetch and parse the manifest.json file
  const manifestResponse = await fetch('./manifest.json');
  const manifest = await manifestResponse.json();

  // Extract the resources you want to fetch from the manifest
  const resources = [manifest.start_url, ...manifest.icons.map(icon => icon.src)];

  const cache = await caches.open(CACHE_NAME);

  // Fetch all resources in parallel
  await Promise.all(resources.map(async resource => {
    try {
      const request = new Request(resource);
      await evaluateAndCache(request, event);
    } catch (e) {
      console.error(`Failed to fetch ${resource}: ${e}`);
    }
  }));
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'fetch-new-content') {
    event.waitUntil(fetchNewContent(event));
  }
});