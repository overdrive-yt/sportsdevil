import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'

/**
 * User Validation Service
 * 
 * Handles JWT/Database inconsistency where users have valid JWT tokens
 * but their records don't exist in the database (e.g., after database resets).
 * 
 * This can happen because:
 * - JWT tokens are stored in browser cookies and survive database resets
 * - Database sessions would prevent this but JWT is used for performance
 */

export interface ValidationResult {
  success: boolean
  user?: {
    id: string
    email: string
    name: string | null
  }
  error?: string
  shouldLogout?: boolean
}

/**
 * Validates that a user with a valid JWT session actually exists in the database
 * 
 * @param request - The incoming NextRequest
 * @returns ValidationResult with user data or error information
 */
export async function validateSessionUser(request: NextRequest): Promise<ValidationResult> {
  try {
    // Get the JWT session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'No valid session found',
        shouldLogout: false
      }
    }

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
      }
    })

    if (!user) {
      // JWT exists but user doesn't exist in database
      // This happens after database resets with JWT strategy
      return {
        success: false,
        error: 'User session invalid - user no longer exists',
        shouldLogout: true
      }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }

  } catch (error) {
    console.error('Error validating session user:', error)
    return {
      success: false,
      error: 'Session validation failed',
      shouldLogout: false
    }
  }
}

/**
 * Middleware wrapper for API routes that require authenticated users
 * 
 * Usage:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const validation = await requireValidUser(request)
 *   if (!validation.success) {
 *     return validation.response
 *   }
 *   
 *   const user = validation.user
 *   // Continue with API logic...
 * }
 * ```
 */
export async function requireValidUser(request: NextRequest): Promise<{
  success: boolean
  user?: {
    id: string
    email: string
    name: string | null
  }
  response?: NextResponse
}> {
  const validation = await validateSessionUser(request)
  
  if (!validation.success) {
    if (validation.shouldLogout) {
      // User has JWT but doesn't exist in database
      // Return 401 with logout instruction
      return {
        success: false,
        response: NextResponse.json(
          { 
            error: validation.error,
            shouldLogout: true,
            message: 'Please log in again' 
          },
          { status: 401 }
        )
      }
    } else if (validation.error === 'No valid session found') {
      // No session at all
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
    } else {
      // Other validation errors
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Session validation failed' },
          { status: 500 }
        )
      }
    }
  }

  return {
    success: true,
    user: validation.user
  }
}

/**
 * Legacy validation for existing code that expects user lookup
 * 
 * @param email - User email from session
 * @returns User object or null
 */
export async function findValidUser(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        loyaltyPoints: true,
        totalSpent: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        country: true,
      }
    })
  } catch (error) {
    console.error('Error finding valid user:', error)
    return null
  }
}