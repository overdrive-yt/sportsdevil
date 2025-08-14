import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UnauthorizedError, ForbiddenError, ValidationError } from './errors'
import { ZodSchema } from 'zod'

// Security audit logging
interface SecurityEvent {
  timestamp: Date
  event: 'AUTH_FAILURE' | 'UNAUTHORIZED_ACCESS' | 'ADMIN_ACCESS' | 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_ACTIVITY'
  userId?: string
  ip: string
  userAgent?: string
  path: string
  details?: Record<string, any>
}

const securityEvents: SecurityEvent[] = []

function logSecurityEvent(event: SecurityEvent) {
  securityEvents.push(event)
  console.warn('🔒 Security Event:', event)
  
  // Keep only last 1000 events in memory
  if (securityEvents.length > 1000) {
    securityEvents.shift()
  }
}

export function getSecurityEvents(): SecurityEvent[] {
  return [...securityEvents]
}

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string
    email: string
    name?: string | null
    role?: string
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthenticatedRequest['user']> {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    // Log failed authentication attempt
    logSecurityEvent({
      timestamp: new Date(),
      event: 'AUTH_FAILURE',
      ip: getRateLimitIdentifier(request),
      userAgent: request.headers.get('user-agent') || undefined,
      path: request.nextUrl.pathname,
    })
    
    throw new UnauthorizedError('Authentication required')
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  }
}

export async function requireAdmin(request: NextRequest): Promise<AuthenticatedRequest['user']> {
  const user = await requireAuth(request)

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    // Log unauthorized admin access attempt
    logSecurityEvent({
      timestamp: new Date(),
      event: 'UNAUTHORIZED_ACCESS',
      userId: user.id,
      ip: getRateLimitIdentifier(request),
      userAgent: request.headers.get('user-agent') || undefined,
      path: request.nextUrl.pathname,
      details: { 
        attemptedRole: 'ADMIN',
        userRole: user.role,
        userEmail: user.email
      }
    })
    
    throw new ForbiddenError('Admin access required')
  }

  // Log successful admin access
  logSecurityEvent({
    timestamp: new Date(),
    event: 'ADMIN_ACCESS',
    userId: user.id,
    ip: getRateLimitIdentifier(request),
    userAgent: request.headers.get('user-agent') || undefined,
    path: request.nextUrl.pathname,
    details: { 
      userRole: user.role,
      userEmail: user.email
    }
  })

  return user
}

export async function requireSuperAdmin(request: NextRequest): Promise<AuthenticatedRequest['user']> {
  const user = await requireAuth(request)

  if (user.role !== 'SUPER_ADMIN') {
    throw new ForbiddenError('Super admin access required')
  }

  return user
}

export function validateRequest<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    throw error // ZodError will be handled by handleApiError
  }
}

export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json()
    return validateRequest(schema, body)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ValidationError('Invalid JSON in request body')
    }
    throw error
  }
}

export function validateSearchParams<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): T {
  const params: Record<string, string | string[]> = {}
  
  for (const [key, value] of searchParams.entries()) {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value)
      } else {
        params[key] = [params[key] as string, value]
      }
    } else {
      params[key] = value
    }
  }

  return validateRequest(schema, params)
}

export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

export function buildWhereClause(filters: Record<string, any>) {
  const where: Record<string, any> = {}

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'search') {
        where.OR = [
          { name: { contains: value } },
          { description: { contains: value } },
          { shortDescription: { contains: value } },
        ]
      } else if (key === 'minPrice') {
        where.price = { ...where.price, gte: value }
      } else if (key === 'maxPrice') {
        where.price = { ...where.price, lte: value }
      } else if (key === 'inStock') {
        if (value) {
          where.stockQuantity = { gt: 0 }
        }
      } else if (Array.isArray(value) && value.length > 0) {
        where[key] = { in: value }
      } else {
        where[key] = value
      }
    }
  })

  return where
}

export function buildOrderBy(sortBy?: string, sortOrder?: 'asc' | 'desc') {
  if (!sortBy) {
    return { createdAt: 'desc' }
  }

  return { [sortBy]: sortOrder || 'asc' }
}

// Rate limiting utilities (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60 * 1000, // 1 minute
  request?: NextRequest
): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    // Log rate limit exceeded
    if (request) {
      logSecurityEvent({
        timestamp: new Date(),
        event: 'RATE_LIMIT_EXCEEDED',
        ip: identifier,
        userAgent: request.headers.get('user-agent') || undefined,
        path: request.nextUrl.pathname,
        details: {
          maxRequests,
          currentCount: record.count,
          windowMs,
        }
      })
    }
    return false
  }

  record.count++
  return true
}

export function getRateLimitIdentifier(request: NextRequest): string {
  // Try to get user ID from session first, fallback to IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
  return ip
}