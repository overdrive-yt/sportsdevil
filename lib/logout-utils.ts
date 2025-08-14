/**
 * Complete logout utility functions for secure session management
 */

/**
 * Clears any stale authentication data when the app initializes
 * This should be called when the app starts to ensure no old sessions persist
 */
export function clearStaleAuthData(): void {
  if (typeof window === 'undefined') return

  try {
    // Check if there's any auth data that shouldn't exist on fresh load
    const hasAuthData = Object.keys(localStorage).some(key =>
      key.includes('next-auth') || 
      key.includes('session') || 
      key.includes('token') ||
      key.includes('user-store') ||
      key.includes('sports-devil-auth')
    )

    const hasAuthCookies = document.cookie
      .split(';')
      .some(cookie => 
        cookie.includes('next-auth') || 
        cookie.includes('session-token') ||
        cookie.includes('csrf-token')
      )

    // If we find stale auth data, clear it
    if (hasAuthData || hasAuthCookies) {
      console.warn('🧹 Found stale authentication data, clearing...')
      clearAllAuthData()
      
      // Don't refresh automatically - just log the cleanup
      console.log('✅ Stale authentication data cleared')
    }
  } catch (error) {
    console.warn('⚠️ Error clearing stale auth data:', error)
  }
}

/**
 * Completely clears all authentication-related data from the browser
 * This ensures no residual session data remains after logout
 */
export function clearAllAuthData(): void {
  if (typeof window === 'undefined') return

  try {
    // Clear localStorage completely
    localStorage.clear()
    
    // Clear sessionStorage completely  
    sessionStorage.clear()
    
    // Clear IndexedDB data (if any exists)
    if ('indexedDB' in window) {
      try {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name)
            }
          })
        }).catch(() => {
          // Ignore errors - IndexedDB cleanup is best effort
        })
      } catch (error) {
        // Ignore errors - IndexedDB cleanup is best effort
      }
    }
    
    // Clear all authentication and session related cookies (comprehensive approach)
    const authCookiePrefixes = [
      'next-auth', '__Secure-next-auth', '__Host-next-auth', 'authjs',
      'session', 'token', 'user', 'login', 'auth', 'csrf'
    ]
    document.cookie.split(";").forEach(function(cookie) { 
      const eqPos = cookie.indexOf("=")
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
      
      // Clear cookies that match authentication patterns OR have session-related names
      const isAuthCookie = authCookiePrefixes.some(prefix => 
        name.toLowerCase().includes(prefix.toLowerCase())
      )
      if (!isAuthCookie) return
      
      // Clear cookie for current domain with multiple path variations
      const pathVariations = ['/', '/login', '/dashboard', '/api']
      pathVariations.forEach(path => {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${window.location.hostname}`
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};secure`
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};samesite=lax`
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};samesite=strict`
      })
      
      // Clear cookie for parent domain (if applicable)
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
      
      // Clear cookie for all subdomains
      const parts = window.location.hostname.split('.')
      if (parts.length > 1) {
        const domain = '.' + parts.slice(-2).join('.')
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`
      }
    })
    
    // Force clear specific NextAuth.js cookies by name
    const nextAuthCookies = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token',
      'authjs.session-token',
      'authjs.csrf-token'
    ]
    
    nextAuthCookies.forEach(cookieName => {
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;secure`
    })
    
    console.log('✅ Complete auth data clearing successful')
  } catch (error) {
    console.warn('⚠️ Error clearing auth data:', error)
  }
}

/**
 * Clear Zustand store data selectively (preserving cart for database sync)
 * This ensures only non-cart store state is cleared during logout
 */
export function clearZustandStores(): void {
  if (typeof window === 'undefined') return

  try {
    // Clear all Zustand persist storage EXCEPT cart store
    const zustandKeys = Object.keys(localStorage).filter(key => 
      (key.includes('user-store') ||
       key.includes('recently-viewed-store') ||
       key.includes('search-store')) &&
      !key.includes('cart-store') // Preserve cart store for database sync
    )

    zustandKeys.forEach(key => {
      localStorage.removeItem(key)
      console.log(`🗑️ Cleared Zustand store: ${key}`)
    })

    // Also clear any sessionStorage Zustand data (except cart)
    const sessionZustandKeys = Object.keys(sessionStorage).filter(key => 
      (key.includes('user-store') ||
       key.includes('recently-viewed-store') ||
       key.includes('search-store')) &&
      !key.includes('cart-store') // Preserve cart store
    )

    sessionZustandKeys.forEach(key => {
      sessionStorage.removeItem(key)
      console.log(`🗑️ Cleared session Zustand store: ${key}`)
    })

    console.log('✅ Non-cart Zustand stores cleared successfully')
    console.log('💾 Cart store preserved for database synchronization')
  } catch (error) {
    console.warn('⚠️ Error clearing Zustand stores:', error)
  }
}

/**
 * Clear cart store specifically (used only after successful database sync)
 */
export function clearCartStore(): void {
  if (typeof window === 'undefined') return

  try {
    const cartKeys = Object.keys(localStorage).filter(key => 
      key.includes('cart-store')
    )

    cartKeys.forEach(key => {
      localStorage.removeItem(key)
      console.log(`🗑️ Cleared cart store: ${key}`)
    })

    // Also clear sessionStorage cart data
    const sessionCartKeys = Object.keys(sessionStorage).filter(key => 
      key.includes('cart-store')
    )

    sessionCartKeys.forEach(key => {
      sessionStorage.removeItem(key)
      console.log(`🗑️ Cleared session cart store: ${key}`)
    })

    console.log('✅ Cart store cleared after database sync')
  } catch (error) {
    console.warn('⚠️ Error clearing cart store:', error)
  }
}

/**
 * Forces a complete browser cache clear and reload
 * This ensures no cached authentication state persists
 */
export function forceCompleteRefresh(): void {
  if (typeof window === 'undefined') return

  try {
    // Clear Zustand stores before refresh
    clearZustandStores()

    // Clear ALL browser caches to ensure no auth state persists
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName)
        })
      }).catch(() => {
        // Ignore cache clearing errors
      })
    }

    // Clear any remaining browser storage that might hold auth state
    try {
      if (window.performance && window.performance.clearResourceTimings) {
        window.performance.clearResourceTimings()
      }
    } catch (e) {
      // Ignore performance API errors
    }

    // Clear all possible NextAuth cookies one more time before redirect
    const allCookies = document.cookie.split(';')
    allCookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim()
      if (name.includes('next-auth') || name.includes('session') || name.includes('token')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
      }
    })

    console.log('🔄 Performing immediate hard redirect to prevent session restoration...')

    // Force a hard navigation to login page with cache busting to prevent auto-login
    const timestamp = Date.now()
    window.location.replace(`/login?logout=success&_t=${timestamp}`)
  } catch (error) {
    console.warn('⚠️ Error during force refresh:', error)
    // Fallback to hard reload with cache busting
    window.location.replace('/login?logout=fallback')
  }
}

/**
 * Validates that a user session is completely cleared
 * Returns true if session appears to be properly cleared
 */
export function validateSessionCleared(): boolean {
  if (typeof window === 'undefined') return true

  try {
    // Check for common NextAuth.js tokens in localStorage
    const nextAuthKeys = Object.keys(localStorage).filter(key => 
      key.includes('next-auth') || 
      key.includes('session') || 
      key.includes('token')
    )
    
    // Check for NextAuth.js cookies
    const nextAuthCookies = document.cookie
      .split(';')
      .map(cookie => cookie.trim())
      .filter(cookie => 
        cookie.includes('next-auth') || 
        cookie.includes('session-token') ||
        cookie.includes('csrf-token')
      )
    
    // Session is cleared if no auth-related data found
    const isCleared = nextAuthKeys.length === 0 && nextAuthCookies.length === 0
    
    if (!isCleared) {
      console.warn('❌ Session clearing validation failed:', {
        localStorageKeys: nextAuthKeys,
        cookies: nextAuthCookies
      })
    } else {
      console.log('✅ Session clearing validation passed')
    }
    
    return isCleared
  } catch (error) {
    console.warn('⚠️ Error validating session clearing:', error)
    return false
  }
}