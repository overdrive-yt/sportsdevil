'use client'

import { useEffect, ReactNode } from 'react'

interface ChunkLoadingProviderProps {
  children: ReactNode
}

declare global {
  interface Window {
    __webpack_require__?: any;
    webpackChunkName?: string;
  }
}

export function ChunkLoadingProvider({ children }: ChunkLoadingProviderProps) {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const setupChunkLoadingImprovements = () => {
      // Handle chunk load errors globally
      const handleChunkError = (event: ErrorEvent) => {
        if (event.error && isChunkLoadError(event.error)) {
          console.warn('🚨 Chunk load error detected:', event.error.message)
          
          // Prevent default error handling
          event.preventDefault()
          
          // Clear any cached modules
          clearWebpackCache()
          
          // Reload after a short delay
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      }

      // Handle unhandled promise rejections (chunk loading promises)
      const handleChunkRejection = (event: PromiseRejectionEvent) => {
        if (event.reason && isChunkLoadError(event.reason)) {
          console.warn('🚨 Chunk load promise rejection:', event.reason.message)
          
          // Prevent default error handling
          event.preventDefault()
          
          // Clear cache and reload
          clearWebpackCache()
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      }

      // Add event listeners
      window.addEventListener('error', handleChunkError)
      window.addEventListener('unhandledrejection', handleChunkRejection)

      console.log('🔧 Chunk loading improvements initialized')

      // Cleanup function
      return () => {
        window.removeEventListener('error', handleChunkError)
        window.removeEventListener('unhandledrejection', handleChunkRejection)
      }
    }

    const cleanup = setupChunkLoadingImprovements()

    // Return cleanup function
    return cleanup
  }, [])

  return <>{children}</>
}

function isChunkLoadError(error: any): boolean {
  if (!error) return false
  
  const errorStr = error.toString().toLowerCase()
  const messageStr = (error.message || '').toLowerCase()
  
  return (
    error.name === 'ChunkLoadError' ||
    errorStr.includes('loading chunk') ||
    errorStr.includes('chunkloaderror') ||
    messageStr.includes('loading chunk') ||
    messageStr.includes('timeout') ||
    messageStr.includes('network error') ||
    errorStr.includes('unexpected eof')
  )
}

function clearWebpackCache() {
  // Clear webpack module cache
  if (window.__webpack_require__ && window.__webpack_require__.cache) {
    Object.keys(window.__webpack_require__.cache).forEach(key => {
      delete window.__webpack_require__.cache[key]
    })
    console.log('🧹 Cleared webpack module cache')
  }
  
  // Clear chunk name cache
  if (window.webpackChunkName) {
    delete window.webpackChunkName
  }
  
  // Clear any Next.js specific caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('next') || name.includes('webpack')) {
          caches.delete(name)
        }
      })
    }).catch(err => {
      console.warn('Could not clear browser caches:', err)
    })
  }
}