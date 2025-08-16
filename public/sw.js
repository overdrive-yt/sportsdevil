// Sports Devil Service Worker - Ultra-fast background caching
const CACHE_NAME = 'sports-devil-v9.12-performance'
const STATIC_CACHE_NAME = 'sports-devil-static-v9.12'

// Critical resources to cache immediately (only files that actually exist)
const CRITICAL_ASSETS = [
  '/',
  '/favicon.ico',
  '/images/site_hero.jpeg',
  '/images/logo-rect-black.jpg',
  '/images/logo-rect-white.jpg',
  '/images/sports-devil-og-image.jpg',
]

// API endpoints to cache
const API_CACHE_ENDPOINTS = [
  '/api/google-reviews',
  '/api/auth/session',
]

// Cache strategies
const CACHE_STRATEGIES = {
  // Images: Cache first, network fallback
  images: 'cache-first',
  // API: Network first, cache fallback
  api: 'network-first',
  // Static assets: Cache first
  static: 'cache-first',
  // Pages: Network first, cache fallback
  pages: 'network-first'
}

// Install event - pre-cache critical resources
self.addEventListener('install', (event) => {
  console.log('🚀 Sports Devil Service Worker installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache critical static assets
      caches.open(STATIC_CACHE_NAME).then(async (cache) => {
        console.log('📦 Caching critical static assets')
        
        // Add assets one by one to handle failures gracefully
        for (const asset of CRITICAL_ASSETS) {
          try {
            const response = await fetch(asset)
            if (response.ok) {
              await cache.put(asset, response)
              console.log(`✅ Cached: ${asset}`)
            } else {
              console.log(`⚠️ Failed to cache ${asset}: ${response.status}`)
            }
          } catch (error) {
            console.log(`⚠️ Failed to cache ${asset}:`, error.message)
          }
        }
      }),
      
      // Pre-warm API cache
      caches.open(CACHE_NAME).then(async (cache) => {
        console.log('🔥 Pre-warming API cache')
        for (const endpoint of API_CACHE_ENDPOINTS) {
          try {
            const response = await fetch(endpoint)
            if (response.ok) {
              await cache.put(endpoint, response.clone())
              console.log(`✅ Pre-cached: ${endpoint}`)
            } else {
              console.log(`⚠️ Failed to pre-cache ${endpoint}: ${response.status}`)
            }
          } catch (error) {
            console.log(`⚠️ Failed to pre-cache: ${endpoint}`, error.message)
          }
        }
      })
    ]).then(() => {
      console.log('✅ Service Worker installation complete')
      // Skip waiting to activate immediately
      self.skipWaiting()
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Sports Devil Service Worker activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(cacheName => 
            !cacheName.includes('v9.12') && 
            (cacheName.includes('sports-devil') || cacheName.includes('w3-sports'))
          )
          .map(cacheName => {
            console.log(`🗑️ Deleting old cache: ${cacheName}`)
            return caches.delete(cacheName)
          })
      )
    }).then(() => {
      console.log('✅ Service Worker activated')
      // Take control of all clients immediately
      return self.clients.claim()
    })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Only handle same-origin requests and specific external APIs
  if (url.origin !== self.location.origin && !url.hostname.includes('googleapis.com')) {
    return
  }
  
  // Determine cache strategy based on request type
  let strategy = CACHE_STRATEGIES.pages // default
  
  if (url.pathname.startsWith('/api/')) {
    strategy = CACHE_STRATEGIES.api
  } else if (url.pathname.startsWith('/images/') || url.pathname.includes('static')) {
    strategy = CACHE_STRATEGIES.static
  } else if (url.pathname.includes('_next/static')) {
    strategy = CACHE_STRATEGIES.static
  }
  
  event.respondWith(handleRequest(request, strategy))
})

// Handle different caching strategies
async function handleRequest(request, strategy) {
  const url = new URL(request.url)
  const cacheKey = getCacheKey(request)
  
  try {
    switch (strategy) {
      case 'cache-first':
        return await cacheFirst(request, cacheKey)
      
      case 'network-first':
        return await networkFirst(request, cacheKey)
      
      case 'static':
        return await staticCache(request, cacheKey)
      
      default:
        return await networkFirst(request, cacheKey)
    }
  } catch (error) {
    console.log(`❌ Cache strategy failed for ${url.pathname}:`, error)
    return fetch(request)
  }
}

// Cache first strategy (for images, static assets)
async function cacheFirst(request, cacheKey) {
  const cache = await caches.open(STATIC_CACHE_NAME)
  const cachedResponse = await cache.match(cacheKey)
  
  if (cachedResponse) {
    // Background update
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(cacheKey, response.clone())
      }
    }).catch(() => {})
    
    return cachedResponse
  }
  
  const networkResponse = await fetch(request)
  if (networkResponse.ok) {
    await cache.put(cacheKey, networkResponse.clone())
  }
  
  return networkResponse
}

// Network first strategy (for APIs, pages)
async function networkFirst(request, cacheKey) {
  const cache = await caches.open(CACHE_NAME)
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful responses
      await cache.put(cacheKey, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(cacheKey)
    if (cachedResponse) {
      console.log(`📋 Serving cached response for: ${request.url}`)
      return cachedResponse
    }
    
    // No cache available, let it fail
    throw error
  }
}

// Static cache strategy (for Next.js static assets)
async function staticCache(request, cacheKey) {
  const cache = await caches.open(STATIC_CACHE_NAME)
  const cachedResponse = await cache.match(cacheKey)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  const networkResponse = await fetch(request)
  if (networkResponse.ok) {
    // Cache static assets aggressively
    await cache.put(cacheKey, networkResponse.clone())
  }
  
  return networkResponse
}

// Generate cache key (handle query parameters for APIs)
function getCacheKey(request) {
  const url = new URL(request.url)
  
  // For API requests, include relevant query parameters
  if (url.pathname.startsWith('/api/')) {
    return request.url
  }
  
  // For static assets, ignore query parameters (for cache efficiency)
  return `${url.origin}${url.pathname}`
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'CLEAR_CACHE':
        clearAllCaches()
        break
      case 'WARM_CACHE':
        warmCriticalResources()
        break
      case 'SKIP_WAITING':
        self.skipWaiting()
        break
    }
  }
})

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(
    cacheNames.map(cacheName => {
      console.log(`🗑️ Clearing cache: ${cacheName}`)
      return caches.delete(cacheName)
    })
  )
  console.log('✅ All caches cleared')
}

// Warm critical resources
async function warmCriticalResources() {
  console.log('🔥 Warming critical resources...')
  const cache = await caches.open(CACHE_NAME)
  
  const warmupPromises = API_CACHE_ENDPOINTS.map(async (endpoint) => {
    try {
      const response = await fetch(endpoint)
      if (response.ok) {
        await cache.put(endpoint, response.clone())
        console.log(`🔥 Warmed: ${endpoint}`)
      }
    } catch (error) {
      console.log(`❌ Failed to warm: ${endpoint}`)
    }
  })
  
  await Promise.all(warmupPromises)
  console.log('✅ Critical resources warmed')
}