'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from './ui/button'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

export class ChunkErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null, retryCount: 0 }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ChunkErrorBoundary caught an error:', error, errorInfo)
    
    // Check if this is a chunk loading error
    if (this.isChunkLoadError(error)) {
      console.log('📦 Detected chunk loading error, will auto-retry in 2 seconds...')
      
      // Prevent infinite loops - max 3 retries
      if (this.state.retryCount >= 3) {
        console.error('❌ Maximum chunk loading retries exceeded, showing error UI')
        this.setState({
          error,
          errorInfo,
          retryCount: this.state.retryCount + 1,
        })
        return
      }
      
      // Auto-retry for chunk load errors with exponential backoff
      const delay = Math.min(2000 * Math.pow(2, this.state.retryCount), 10000)
      this.retryTimeout = setTimeout(() => {
        this.handleRetry()
      }, delay)
    }

    this.setState({
      error,
      errorInfo,
    })
  }

  public componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  private isChunkLoadError(error: Error): boolean {
    const errorMessage = error.message?.toLowerCase() || ''
    const errorStack = error.stack?.toLowerCase() || ''
    const errorName = error.name?.toLowerCase() || ''
    
    return (
      errorName === 'chunkloaderror' ||
      errorMessage.includes('loading chunk') ||
      errorMessage.includes('chunkloaderror') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('unexpected eof') ||
      errorMessage.includes('network error') ||
      errorMessage.includes('syntax error') ||
      errorStack.includes('chunk') ||
      errorStack.includes('webpack') ||
      // Layout-specific error detection
      errorMessage.includes('app/layout') ||
      errorMessage.includes('layout.js') ||
      errorStack.includes('layout.js')
    )
  }

  private handleRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }

    // Increment retry count
    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1
    }))

    // For chunk load errors, try to reload the page
    if (this.state.error && this.isChunkLoadError(this.state.error)) {
      // Clear comprehensive cache for chunk errors
      if (typeof window !== 'undefined') {
        // Clear module cache
        if ('webpackChunkName' in window) {
          delete (window as any).webpackChunkName
        }
        
        // Clear webpack require cache if available
        if ((window as any).__webpack_require__?.cache) {
          Object.keys((window as any).__webpack_require__.cache).forEach(key => {
            delete (window as any).__webpack_require__.cache[key]
          })
        }
        
        // Clear browser caches for Next.js chunks
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
        
        // Reload the page to get fresh chunks
        console.log('🔄 Reloading page to recover from chunk loading error...')
        window.location.reload()
        return
      }
    }

    // For other errors, just reset the error boundary
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  private handleManualRetry = () => {
    this.handleRetry()
  }

  public render() {
    if (this.state.hasError) {
      const isChunkError = this.state.error && this.isChunkLoadError(this.state.error)
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              {isChunkError ? (
                <RefreshCw className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
              ) : (
                <AlertTriangle className="h-12 w-12 text-red-600 mx-auto" />
              )}
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isChunkError ? 'Loading Issue' : 'Something Went Wrong'}
            </h2>
            
            <p className="text-gray-600 mb-4">
              {isChunkError 
                ? 'The website is updating. Please wait a moment while we refresh...'
                : 'An unexpected error occurred. Please try refreshing the page.'
              }
            </p>

            {isChunkError && this.state.retryCount > 0 && (
              <p className="text-sm text-blue-600 mb-4">
                Retry attempt {this.state.retryCount}/3...
              </p>
            )}

            {!isChunkError && (
              <details className="text-left mb-4">
                <summary className="text-sm text-gray-500 cursor-pointer">
                  Technical Details
                </summary>
                <pre className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-32">
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="space-y-2">
              {this.state.retryCount < 3 && (
                <Button 
                  onClick={this.handleManualRetry}
                  className="w-full"
                  disabled={Boolean(isChunkError && this.retryTimeout !== null)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}