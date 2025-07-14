self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('fetch', function (event) {
  // Allow all requests to go through
});
