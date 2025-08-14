// Simple in-memory cache for analytics data
// This cache helps reduce database load for frequently requested data

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class AnalyticsCache {
  private cache = new Map<string, CacheItem<any>>()
  
  // Cache durations
  static readonly CACHE_TTL = {
    BEST_SELLERS: 60 * 60 * 1000, // 1 hour
    NEW_ARRIVALS: 30 * 60 * 1000, // 30 minutes  
    PRODUCT_LIST: 15 * 60 * 1000, // 15 minutes
  }
  
  set<T>(key: string, data: T, ttl: number = AnalyticsCache.CACHE_TTL.PRODUCT_LIST): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
    
    console.log(`📝 Cache SET: ${key} (TTL: ${Math.round(ttl / 1000 / 60)}min)`)
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      console.log(`❌ Cache MISS: ${key}`)
      return null
    }
    
    const now = Date.now()
    const isExpired = (now - item.timestamp) > item.ttl
    
    if (isExpired) {
      this.cache.delete(key)
      console.log(`⏰ Cache EXPIRED: ${key} (age: ${Math.round((now - item.timestamp) / 1000 / 60)}min)`)
      return null
    }
    
    const ageMinutes = Math.round((now - item.timestamp) / 1000 / 60)
    console.log(`✅ Cache HIT: ${key} (age: ${ageMinutes}min)`)
    return item.data as T
  }
  
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    
    const isExpired = (Date.now() - item.timestamp) > item.ttl
    if (isExpired) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }
  
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      console.log(`🗑️ Cache DELETE: ${key}`)
    }
    return deleted
  }
  
  clear(): void {
    const size = this.cache.size
    this.cache.clear()
    console.log(`🧹 Cache CLEAR: ${size} items removed`)
  }
  
  size(): number {
    return this.cache.size
  }
  
  // Get cache statistics
  getStats(): {
    totalItems: number
    items: Array<{
      key: string
      ageMinutes: number
      ttlMinutes: number
      expired: boolean
    }>
  } {
    const now = Date.now()
    const items: Array<{
      key: string
      ageMinutes: number
      ttlMinutes: number
      expired: boolean
    }> = []
    
    for (const [key, item] of this.cache.entries()) {
      const ageMinutes = Math.round((now - item.timestamp) / 1000 / 60)
      const ttlMinutes = Math.round(item.ttl / 1000 / 60)
      const expired = (now - item.timestamp) > item.ttl
      
      items.push({
        key,
        ageMinutes,
        ttlMinutes,
        expired
      })
    }
    
    return {
      totalItems: this.cache.size,
      items
    }
  }
  
  // Helper method to generate cache keys
  static generateKey(prefix: string, params: Record<string, any> = {}): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    
    return paramString ? `${prefix}:${paramString}` : prefix
  }
}

// Global cache instance
export const analyticsCache = new AnalyticsCache()

// Cache key generators for common use cases
export const CacheKeys = {
  bestSellers: (limit: number = 8, days: number = 30) => 
    AnalyticsCache.generateKey('best-sellers', { limit, days }),
    
  newArrivals: (limit: number = 8, days: number = 90) => 
    AnalyticsCache.generateKey('new-arrivals', { limit, days }),
}

export { AnalyticsCache }