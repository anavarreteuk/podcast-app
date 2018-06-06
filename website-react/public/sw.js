const dataCacheName = 'podcasts-data-v5'
const cacheName = 'podcasts-v5'
const filesToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
]

const getAllFilesToCache = async (filesToCache) => {
  let files

  try {
    files = await window.fetch('asset-manifest.json')
      .then(data => data.json())
  } catch (error) {
    console.log(`Asset Manifest Error: ${error}`)
  }

  const filepaths = files ? Object.values(files) : []
  return [...filepaths, ...filesToCache]
}

this.addEventListener('install', function (e) {
  console.log('[ServiceWorker] Install')
  e.waitUntil(
    getAllFilesToCache(filesToCache)
      .then(files => {
        window.caches.open(cacheName).then(cache => {
          console.log('[ServiceWorker] Caching app shell')
          return cache.addAll(files)
        })
      })
  )
})

this.addEventListener('activate', function (e) {
  console.log('[ServiceWorker] Activate')
  e.waitUntil(
    window.caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key)
          return window.caches.delete(key)
        }
      }))
    })
  )
  return this.clients.claim()
})

this.addEventListener('fetch', function (e) {
  console.log('[Service Worker] Fetch', e.request.url)
  // TODO last search!
  e.respondWith(
    window.caches.match(e.request).then(function (response) {
      return response || window.fetch(e.request)
    })
  )
})
