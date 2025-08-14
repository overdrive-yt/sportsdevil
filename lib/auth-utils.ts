import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export interface SessionUser {
  id: string
  email: string
  name?: string | null
  role?: string
  image?: string | null
}

export interface AuthSession {
  user: SessionUser
}

/**
 * Get server session with error handling
 */
export async function getAuthSession(): Promise<AuthSession | null> {
  try {
    const session = await getServerSession(authOptions)
    return session as AuthSession | null
  } catch (error) {
    console.error('Session retrieval error:', error)
    return null
  }
}

/**
 * Require authentication for server components
 * Redirects to login if not authenticated
 */
export async function requireAuth(callbackUrl?: string): Promise<AuthSession> {
  const session = await getAuthSession()
  
  if (!session) {
    const redirectUrl = callbackUrl 
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : '/login'
    redirect(redirectUrl)
  }
  
  return session
}

/**
 * Require admin privileges for server components
 * Redirects to login with error if not admin
 */
export async function requireAdmin(callbackUrl?: string): Promise<AuthSession> {
  const session = await getAuthSession()
  
  if (!session) {
    const redirectUrl = `/login?error=access_denied&message=Admin access required${
      callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ''
    }`
    redirect(redirectUrl)
  }
  
  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    const redirectUrl = `/login?error=insufficient_permissions&message=Admin privileges required${
      callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ''
    }`
    redirect(redirectUrl)
  }
  
  return session
}

/**
 * Check if user is authenticated (non-redirecting)
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getAuthSession()
  return !!session
}

/**
 * Check if user is admin (non-redirecting)
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getAuthSession()
  return !!(session?.user.role === 'ADMIN' || session?.user.role === 'SUPER_ADMIN')
}

/**
 * Get current user ID for server components
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getAuthSession()
  return session?.user.id || null
}

/**
 * Validate session for API routes
 */
export async function validateApiSession(requiredRole?: 'ADMIN' | 'SUPER_ADMIN') {
  const session = await getAuthSession()
  
  if (!session) {
    return {
      error: 'Unauthorized',
      message: 'Authentication required',
      status: 401
    }
  }
  
  if (requiredRole && session.user.role !== requiredRole && session.user.role !== 'SUPER_ADMIN') {
    return {
      error: 'Forbidden',
      message: `${requiredRole} access required`,
      status: 403
    }
  }
  
  return { session }
}

/**
 * Create API error response
 */
export function createApiErrorResponse(error: string, message: string, status: number) {
  return new Response(
    JSON.stringify({ error, message }),
    { 
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}