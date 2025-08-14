import { signOut } from 'next-auth/react'

/**
 * Client-side authentication utilities
 * 
 * Handles automatic logout when NextAuth detects session issues
 * Note: In hybrid architecture, NextAuth handles session management
 */

/**
 * Enhanced API fetch wrapper that handles authentication errors
 * 
 * Automatically logs out user if server responds with shouldLogout: true
 * This happens when user has valid JWT but doesn't exist in database
 */
export async function authenticatedFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // Check if response indicates user should be logged out
    if (!response.ok && response.status === 401) {
      try {
        const errorData = await response.clone().json()
        if (errorData.shouldLogout) {
          console.warn('Session invalid - logging out user:', errorData.message)
          // Clear our custom auth store
          // In hybrid architecture, NextAuth handles session cleanup
          await signOut({ redirect: false })
          // Also call NextAuth signOut for API cleanup
          await signOut({ 
            callbackUrl: '/login',
            redirect: true 
          })
          return response
        }
      } catch (parseError) {
        // Response might not be JSON, continue normally
      }
    }

    return response

  } catch (error) {
    console.error('Authenticated fetch error:', error)
    throw error
  }
}

/**
 * Handle API error responses that may require logout
 * 
 * @param response - API response
 * @returns Promise that resolves when logout is complete (if needed)
 */
export async function handleAuthResponse(response: Response): Promise<void> {
  if (!response.ok && response.status === 401) {
    try {
      const errorData = await response.json()
      if (errorData.shouldLogout) {
        console.warn('Session invalid - logging out user:', errorData.message)
        // Clear our custom auth store
        // In hybrid architecture, NextAuth handles session cleanup
        await signOut({ redirect: false })
        // Also call NextAuth signOut for API cleanup
        await signOut({ 
          callbackUrl: '/login',
          redirect: true 
        })
      }
    } catch (parseError) {
      // Response might not be JSON, ignore
    }
  }
}

/**
 * React Query error handler for authentication errors
 * 
 * Use this with React Query's global error handling or per-query
 */
export async function handleQueryAuthError(error: any): Promise<void> {
  if (error?.status === 401 && error?.shouldLogout) {
    console.warn('Session invalid - logging out user:', error.message)
    // In hybrid architecture, NextAuth handles session cleanup
    await signOut({ 
      callbackUrl: '/login',
      redirect: true 
    })
  }
}