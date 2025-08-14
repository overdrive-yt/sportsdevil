'use client'

import { useEffect } from 'react'

interface WebVital {
  name: string
  value: number
  id: string
  rating: 'good' | 'needs-improvement' | 'poor'
}

/**
 * Performance monitoring component that tracks Core Web Vitals
 */
export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    // Track Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const lcp = entry.startTime
          const rating = lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs-improvement' : 'poor'
          
          console.log(`🎯 LCP: ${Math.round(lcp)}ms (${rating})`)
          
          // Send to analytics if available
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'web_vital', {
              name: 'LCP',
              value: Math.round(lcp),
              rating: rating,
            })
          }
        }
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      console.warn('LCP monitoring not available:', error)
    }

    // Track First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = (entry as any).processingStart ? (entry as any).processingStart - entry.startTime : entry.duration
          const rating = fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor'
          
          console.log(`⚡ FID: ${Math.round(fid)}ms (${rating})`)
          
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'web_vital', {
              name: 'FID',
              value: Math.round(fid),
              rating: rating,
            })
          }
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
    } catch (error) {
      console.warn('FID monitoring not available:', error)
    }

    // Track Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        
        const rating = clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor'
        console.log(`📐 CLS: ${clsValue.toFixed(3)} (${rating})`)
        
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'web_vital', {
              name: 'CLS',
              value: Math.round(clsValue * 1000) / 1000,
              rating: rating,
            })
          }
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('CLS monitoring not available:', error)
    }

    // Track Time to First Byte (TTFB) - server response time
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart
        const rating = ttfb <= 800 ? 'good' : ttfb <= 1800 ? 'needs-improvement' : 'poor'
        
        console.log(`🚀 TTFB: ${Math.round(ttfb)}ms (${rating})`)
        
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'web_vital', {
              name: 'TTFB',
              value: Math.round(ttfb),
              rating: rating,
            })
          }
      }
    } catch (error) {
      console.warn('TTFB monitoring not available:', error)
    }

    // Track Total Blocking Time (TBT) approximation
    try {
      let totalBlockingTime = 0
      const tbtObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const duration = entry.duration
          if (duration > 50) {
            totalBlockingTime += duration - 50
          }
        }
        
        const rating = totalBlockingTime <= 200 ? 'good' : totalBlockingTime <= 600 ? 'needs-improvement' : 'poor'
        console.log(`⏱️ TBT: ${Math.round(totalBlockingTime)}ms (${rating})`)
        
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'web_vital', {
              name: 'TBT',
              value: Math.round(totalBlockingTime),
              rating: rating,
            })
          }
      })
      tbtObserver.observe({ entryTypes: ['longtask'] })
    } catch (error) {
      console.warn('TBT monitoring not available:', error)
    }

    // Page Load Performance Summary
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          const navigationStart = navigation.fetchStart || 0
          const loadTime = navigation.loadEventEnd - navigationStart
          const domContent = navigation.domContentLoadedEventEnd - navigationStart
          
          console.log(`📊 Performance Summary:`)
          console.log(`   📄 DOM Content Loaded: ${Math.round(domContent)}ms`)
          console.log(`   🏁 Full Page Load: ${Math.round(loadTime)}ms`)
          console.log(`   📦 DNS Lookup: ${Math.round(navigation.domainLookupEnd - navigation.domainLookupStart)}ms`)
          console.log(`   🔗 Connection: ${Math.round(navigation.connectEnd - navigation.connectStart)}ms`)
          console.log(`   📡 Server Response: ${Math.round(navigation.responseEnd - navigation.requestStart)}ms`)
          console.log(`   🎨 DOM Processing: ${Math.round(navigation.domComplete - navigation.responseEnd)}ms`)
        }
      }, 1000)
    })

    // Memory Usage Monitoring (Chrome only)
    if ('memory' in performance) {
      const memory = (performance as any).memory
      console.log(`💾 Memory Usage:`)
      console.log(`   🎯 Used: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`)
      console.log(`   📊 Total: ${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`)
      console.log(`   🔒 Limit: ${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`)
    }

  }, [])

  // This component doesn't render anything visible
  return null
}

// Helper function to manually report custom metrics
export function reportPerformanceMetric(name: string, value: number, rating?: string) {
  console.log(`📈 Custom Metric - ${name}: ${value}ms ${rating ? `(${rating})` : ''}`)
  
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'custom_metric', {
        name,
        value: Math.round(value),
        rating: rating || 'unknown',
      })
    }
}

// Performance measurement utilities
export const perf = {
  // Mark the start of a performance measurement
  start(name: string) {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-start`)
    }
  },

  // Mark the end and calculate duration
  end(name: string) {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
      
      const measure = performance.getEntriesByName(name)[0]
      if (measure) {
        console.log(`⏱️ ${name}: ${Math.round(measure.duration)}ms`)
        return measure.duration
      }
    }
    return 0
  },

  // Get current performance timing
  now() {
    return typeof window !== 'undefined' && 'performance' in window 
      ? performance.now() 
      : Date.now()
  }
}