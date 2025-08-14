/**
 * Performance optimization utilities for Sports Devil Cricket Equipment
 * Handles caching, preloading, and performance monitoring
 */

import { unstable_cache } from 'next/cache'

// Cache keys for Sports Devil data
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  INVENTORY: 'inventory',
  ANALYTICS: 'analytics',
  REVIEWS: 'reviews',
  ORDERS: 'orders',
} as const

// Cache durations (in seconds)
export const CACHE_DURATIONS = {
  STATIC: 3600, // 1 hour for relatively static data
  DYNAMIC: 300, // 5 minutes for dynamic data
  ANALYTICS: 900, // 15 minutes for analytics
  USER_DATA: 60, // 1 minute for user-specific data
  INVENTORY: 180, // 3 minutes for inventory data
} as const

/**
 * Enhanced caching wrapper with tag-based invalidation
 */
export function createCachedFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyPrefix: string,
  duration: number,
  tags?: string[]
) {
  return unstable_cache(
    fn,
    [keyPrefix],
    {
      revalidate: duration,
      tags: tags || [keyPrefix],
    }
  )
}

/**
 * Sports Devil specific cached functions
 */
export const CachedFunctions = {
  // Products with cricket equipment focus
  getProducts: createCachedFunction(
    async (category?: string, featured?: boolean) => {
      // This would be your actual product fetching logic
      return { products: [], category, featured }
    },
    CACHE_KEYS.PRODUCTS,
    CACHE_DURATIONS.STATIC,
    ['products', 'cricket-equipment']
  ),

  // Categories for cricket equipment
  getCategories: createCachedFunction(
    async () => {
      // This would be your actual category fetching logic
      return { categories: [] }
    },
    CACHE_KEYS.CATEGORIES,
    CACHE_DURATIONS.STATIC,
    ['categories']
  ),

  // Inventory data with frequent updates
  getInventoryData: createCachedFunction(
    async () => {
      // This would be your actual inventory fetching logic
      return { inventory: [] }
    },
    CACHE_KEYS.INVENTORY,
    CACHE_DURATIONS.INVENTORY,
    ['inventory', 'stock']
  ),

  // Analytics with moderate caching
  getAnalytics: createCachedFunction(
    async (period: string) => {
      // This would be your actual analytics fetching logic
      return { analytics: {}, period }
    },
    CACHE_KEYS.ANALYTICS,
    CACHE_DURATIONS.ANALYTICS,
    ['analytics', 'sales']
  ),
}

/**
 * Preload critical resources for cricket equipment pages
 */
export const PreloadManager = {
  // Preload critical cricket equipment images
  preloadCriticalImages: () => {
    if (typeof window !== 'undefined') {
      const criticalImages = [
        '/images/cricket-bat-hero.webp',
        '/images/batting-pads-featured.webp',
        '/images/cricket-helmet-safety.webp',
        '/images/sports-devil-logo.webp',
      ]

      criticalImages.forEach(src => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = src
        link.type = 'image/webp'
        document.head.appendChild(link)
      })
    }
  },

  // Fonts are handled via 'geist/font' npm package, no preloading needed
  preloadFonts: () => {
    // Geist fonts are automatically handled via npm package imports
    // No manual preloading needed - this prevents 404 errors
    if (typeof window !== 'undefined') {
      console.log('Geist fonts loaded via npm package')
    }
  },

  // Preload critical API routes
  preloadApiRoutes: () => {
    if (typeof window !== 'undefined') {
      const criticalRoutes = [
        '/api/products?featured=true',
        '/api/categories',
        '/api/cart',
      ]

      criticalRoutes.forEach(href => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = href
        document.head.appendChild(link)
      })
    }
  },
}

/**
 * Performance monitoring utilities
 */
export const PerformanceMonitor = {
  // Measure Core Web Vitals
  measureWebVitals: () => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.log('LCP:', entry.startTime)
            // In production, send to analytics
            // analytics.track('web_vital', { metric: 'LCP', value: entry.startTime })
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // First Input Delay (FID)
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.log('FID:', (entry as any).processingStart - entry.startTime)
            // In production, send to analytics
            // analytics.track('web_vital', { metric: 'FID', value: (entry as any).processingStart - entry.startTime })
          }
        }).observe({ entryTypes: ['first-input'] })

        // Cumulative Layout Shift (CLS)
        let clsValue = 0
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShiftEntry = entry as any // LayoutShift interface not available in base PerformanceEntry
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value
            }
          }
          console.log('CLS:', clsValue)
          // In production, send to analytics
          // analytics.track('web_vital', { metric: 'CLS', value: clsValue })
        }).observe({ entryTypes: ['layout-shift'] })

      } catch (error) {
        console.warn('Performance monitoring not available:', error)
      }
    }
  },

  // Measure page load performance
  measurePageLoad: (pageName: string) => {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const metrics = {
          page: pageName,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          totalTime: navigation.loadEventEnd - navigation.fetchStart,
          ttfb: navigation.responseStart - navigation.requestStart,
        }
        
        console.log('Page Performance:', metrics)
        // In production, send to analytics
        // analytics.track('page_performance', metrics)
      })
    }
  },

  // Monitor API performance
  measureApiCall: async <T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const startTime = performance.now()
    
    try {
      const result = await apiCall()
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`API Performance [${endpoint}]:`, duration + 'ms')
      // In production, send to analytics
      // analytics.track('api_performance', { endpoint, duration, status: 'success' })
      
      return result
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.error(`API Error [${endpoint}]:`, duration + 'ms', error)
      // In production, send to analytics
      // analytics.track('api_performance', { endpoint, duration, status: 'error' })
      
      throw error
    }
  },
}

/**
 * Resource hints for better performance
 */
export const ResourceHints = {
  addDnsPrefetch: (domains: string[]) => {
    if (typeof window !== 'undefined') {
      domains.forEach(domain => {
        const link = document.createElement('link')
        link.rel = 'dns-prefetch'
        link.href = `//${domain}`
        document.head.appendChild(link)
      })
    }
  },

  addPreconnect: (domains: string[]) => {
    if (typeof window !== 'undefined') {
      domains.forEach(domain => {
        const link = document.createElement('link')
        link.rel = 'preconnect'
        link.href = `//${domain}`
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)
      })
    }
  },
}

/**
 * Sports Devil specific performance initialization
 */
export const initializeSportsDevilPerformance = () => {
  // Preload critical resources
  PreloadManager.preloadCriticalImages()
  PreloadManager.preloadFonts()
  
  // Add DNS prefetch for external domains (removed unsplash as not using external images)
  ResourceHints.addDnsPrefetch([
    'fonts.googleapis.com',
    'api.stripe.com',
  ])
  
  // Add preconnect for critical domains
  ResourceHints.addPreconnect([
    'fonts.gstatic.com',
  ])
  
  // Initialize performance monitoring
  PerformanceMonitor.measureWebVitals()
  PerformanceMonitor.measurePageLoad('cricket-equipment-site')
}

/**
 * Image optimization utilities
 */
export const ImageOptimization = {
  // Generate optimized image props for Next.js Image component
  getOptimizedImageProps: (src: string, alt: string, priority = false) => ({
    src,
    alt,
    priority,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    style: { width: '100%', height: 'auto' },
    quality: 85,
    placeholder: 'blur' as const,
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  }),

  // Generate cricket equipment specific image props
  getCricketEquipmentImageProps: (equipmentType: string, alt: string, priority = false) => {
    const cricketImageMap = {
      'bat': '/images/cricket-bat-placeholder.webp',
      'pads': '/images/batting-pads-placeholder.webp',
      'gloves': '/images/batting-gloves-placeholder.webp',
      'helmet': '/images/cricket-helmet-placeholder.webp',
      'ball': '/images/cricket-ball-placeholder.webp',
    }

    const src = cricketImageMap[equipmentType as keyof typeof cricketImageMap] || '/images/cricket-equipment-placeholder.webp'
    
    return ImageOptimization.getOptimizedImageProps(src, alt, priority)
  },
}

export default {
  CachedFunctions,
  PreloadManager,
  PerformanceMonitor,
  ResourceHints,
  ImageOptimization,
  initializeSportsDevilPerformance,
}