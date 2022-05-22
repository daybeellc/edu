'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "f31f6ab903d89ef8e06c084dbe0f8f6a",
"assets/assets/fonts/sansBold.ttf": "5bc6b8360236a197d59e55f72b02d4bf",
"assets/assets/fonts/sansLight.ttf": "3dd221ea976bc4c617c40d366580bfe8",
"assets/assets/fonts/sansRegular.ttf": "47dbe5824a2d82b794ef1f52809699a5",
"assets/assets/fonts/sansSemiBold.ttf": "09ad953751e1109778ece9318df70540",
"assets/assets/image/assignment.png": "bbd53d9cde122ec144a5d87dabcd2d55",
"assets/assets/image/bord.png": "f26b79e3e4e9c145e9fc3a47fdb1d487",
"assets/assets/image/chem.png": "1e253a95f7b0f77ea20f3d495d554e4a",
"assets/assets/image/corona.png": "cd8bda8203f4e33452f6dd92587b02de",
"assets/assets/image/freelance.jpg": "9497670197d027b26647b1b672eec0c4",
"assets/assets/image/help.png": "9b8bc568e8972b5b884e232e9340d821",
"assets/assets/image/home.jpg": "fb75563249e98a45bb3250459f6115b4",
"assets/assets/image/homework.png": "d635d6d0d193807acd793b1b2c64a1d2",
"assets/assets/image/logo.png": "9069f16b5d0aa5f77829a8da2c7a72b2",
"assets/assets/image/map.png": "a70a6634c561e32fafda1323eb48700d",
"assets/assets/image/math.png": "def0135b260335af49d4915b6579a432",
"assets/assets/image/phy.png": "5a330692df8fb5cc518200ea1e35c879",
"assets/assets/image/td.png": "785e08e120a93247a21f1b0b614d6ad4",
"assets/assets/image/telegram.png": "6c5166109ad1783e160299654cfa23b1",
"assets/assets/image/whatsapp.png": "714d7ad16da2c6f2dd09ad6c71c7cb08",
"assets/assets/image/writing.png": "f0f8564de6764f0d85040c4f82774c9a",
"assets/FontManifest.json": "2bfaf5f9159eca7b85de556ddc92eedf",
"assets/fonts/MaterialIcons-Regular.otf": "7e7a6cccddf6d7b20012a548461d5d81",
"assets/NOTICES": "9600e130e568d37d15219c3d142f9317",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"canvaskit/canvaskit.js": "c2b4e5f3d7a3d82aed024e7249a78487",
"canvaskit/canvaskit.wasm": "4b83d89d9fecbea8ca46f2f760c5a9ba",
"canvaskit/profiling/canvaskit.js": "ae2949af4efc61d28a4a80fffa1db900",
"canvaskit/profiling/canvaskit.wasm": "95e736ab31147d1b2c7b25f11d4c32cd",
"favicon.png": "dd3ae0117178de181d6cd59be282bf1a",
"icons/Icon-192.png": "3a2b1a878af7e86c9782550d508930ba",
"icons/Icon-512.png": "faada68012b3d4b3497c1b16b85abfc5",
"icons/Icon-maskable-192.png": "3a2b1a878af7e86c9782550d508930ba",
"icons/Icon-maskable-512.png": "faada68012b3d4b3497c1b16b85abfc5",
"index.html": "3351ab6f79579d1fe68f235885a50198",
"/": "3351ab6f79579d1fe68f235885a50198",
"main.dart.js": "638cc9e618b605f0fc1b1818f777015d",
"manifest.json": "135d90b4629c363992a76313f570cecd",
"version.json": "82ba3050c2a0633628c3facb57988a43"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
