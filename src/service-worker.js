var CACHE_NAME = 'mdc-v1';
var urlsToCache = [
  '/',
  '/mdc.js',
  '/css/reset.css',
  '/css/styles.css',
];


self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fromCache(event.request));

  event.waitUntil(update(event.request).then(refresh));
});

function fromCache(request) {
  return caches.open(CACHE_NAME).then((cache) => {
    return cache.match(request);
  });
}

function update(request) {
  return caches.open(CACHE_NAME).then((cache) => {
    return fetch(request).then((response) => {
      return cache.put(request, response.clone()).then(() => response);
    });
  });
}

function refresh(response) {
  return self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      const message = {
        type: 'refresh',
        url: response.url,
        etag: response.headers.get('ETag'),
      };
      client.postMessage(JSON.stringify(message));
    });
  });
}
