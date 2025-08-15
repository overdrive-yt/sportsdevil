/**
 * CSRF Protection Middleware
 * Provides Cross-Site Request Forgery protection for all mutating operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

// CSRF token store (in production, use Redis or database)
const tokenStore = new Map<string, { token: string, expires: number }>()

// Clean up expired tokens every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of tokenStore.entries()) {
    if (value.expires < now) {
      tokenStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Generate a CSRF token for the current session
 */
export async function generateCSRFToken(request: NextRequest): Promise<string> {
  const session = await getServerSession(authOptions)
  const sessionId = session?.user?.id || 'anonymous'
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  
  // Create a unique token based on session and IP
  const tokenData = `${sessionId}:${ipAddress}:${Date.now()}:${randomBytes(16).toString('hex')}`
  const token = createHash('sha256').update(tokenData).digest('hex')
  
  // Store token with 1 hour expiration
  const expires = Date.now() + (60 * 60 * 1000)
  tokenStore.set(token, { token, expires })
  
  return token
}

/**
 * Validate CSRF token
 */
export async function validateCSRFToken(request: NextRequest, token: string): Promise<boolean> {
  if (!token) {
    return false
  }

  const storedToken = tokenStore.get(token)
  if (!storedToken || storedToken.expires < Date.now()) {
    tokenStore.delete(token)
    return false
  }

  // Token is valid, remove it (one-time use)
  tokenStore.delete(token)
  return true
}

/**
 * CSRF Protection Middleware
 */
export async function csrfProtection(request: NextRequest): Promise<NextResponse | null> {
  const method = request.method
  const pathname = request.nextUrl.pathname

  // Only protect mutating methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return null
  }

  // Skip CSRF for certain safe endpoints
  const skipCSRF = [
    '/api/auth/',
    '/api/webhooks/',
    '/api/health',
    '/api/test',
  ]

  if (skipCSRF.some(path => pathname.startsWith(path))) {
    return null
  }

  // Check Origin header for same-origin requests
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  const referer = request.headers.get('referer')

  // Verify same-origin request
  if (origin) {
    const originHost = new URL(origin).host
    if (originHost !== host) {
      console.warn('CSRF: Origin mismatch', { origin: originHost, host })
      return new NextResponse(
        JSON.stringify({
          error: 'Forbidden',
          message: 'Invalid origin',
          code: 'CSRF_ORIGIN_MISMATCH'
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  } else if (referer) {
    const refererHost = new URL(referer).host
    if (refererHost !== host) {
      console.warn('CSRF: Referer mismatch', { referer: refererHost, host })
      return new NextResponse(
        JSON.stringify({
          error: 'Forbidden',
          message: 'Invalid referer',
          code: 'CSRF_REFERER_MISMATCH'
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }

  // Check CSRF token in header or body
  let csrfToken = request.headers.get('x-csrf-token')
  
  if (!csrfToken && request.headers.get('content-type')?.includes('application/json')) {
    try {
      const body = await request.text()
      const parsedBody = JSON.parse(body)
      csrfToken = parsedBody.csrfToken
      
      // Recreate request with original body
      const newRequest = new NextRequest(request, {
        method: request.method,
        headers: request.headers,
        body: body,
      })
      
      // Validate token
      const isValidToken = csrfToken ? await validateCSRFToken(newRequest, csrfToken) : false
      if (!isValidToken) {
        console.warn('CSRF: Invalid token', { pathname, method })
        return new NextResponse(
          JSON.stringify({
            error: 'Forbidden',
            message: 'Invalid CSRF token',
            code: 'CSRF_TOKEN_INVALID'
          }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      return null // Allow request
    } catch (error) {
      console.warn('CSRF: Error parsing request body', error)
    }
  }

  if (!csrfToken) {
    console.warn('CSRF: Missing token', { pathname, method })
    return new NextResponse(
      JSON.stringify({
        error: 'Forbidden',
        message: 'CSRF token required',
        code: 'CSRF_TOKEN_MISSING'
      }),
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  const isValidToken = await validateCSRFToken(request, csrfToken)
  if (!isValidToken) {
    console.warn('CSRF: Invalid token', { pathname, method })
    return new NextResponse(
      JSON.stringify({
        error: 'Forbidden',
        message: 'Invalid CSRF token',
        code: 'CSRF_TOKEN_INVALID'
      }),
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  return null // Allow request
}

/**
 * API endpoint to generate CSRF tokens
 */
export async function getCSRFToken(request: NextRequest): Promise<NextResponse> {
  try {
    const token = await generateCSRFToken(request)
    return NextResponse.json({ csrfToken: token })
  } catch (error) {
    console.error('Error generating CSRF token:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}