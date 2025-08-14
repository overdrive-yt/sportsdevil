import { NextRequest } from 'next/server'
import { requirePermission, getCurrentUser } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse } from '@/lib/api/responses'
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/api/middleware'
import { z } from 'zod'

const userUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN', 'OWNER']).optional(),
  loyaltyPoints: z.number().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 100, 60000, request)) {
      return createErrorResponse('Rate limit exceeded', 429)
    }

    // Require users:read permission
    const currentUser = await requirePermission('users:read', request)
    
    const searchParams = new URL(request.url).searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '10', 10))
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }
    
    if (role) {
      where.role = role
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          loyaltyPoints: true,
          totalSpent: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    // Log admin access
    await prisma.adminLog.create({
      data: {
        adminId: currentUser.id,
        action: 'VIEW_USERS',
        details: JSON.stringify({
          page,
          limit,
          search,
          role,
          totalResults: total
        }),
      }
    }).catch(() => {}) // Silent fail for non-critical logging

    return createSuccessResponse({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Users retrieved successfully')
    
  } catch (error) {
    console.error('Users API error:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      error instanceof Error && error.message.includes('Permission denied') ? 403 : 500
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 10, 60000, request)) {
      return createErrorResponse('Rate limit exceeded', 429)
    }

    // Require users:create permission
    const currentUser = await requirePermission('users:create', request)
    
    const body = await request.json()
    const validatedData = userUpdateSchema.parse(body)

    // Additional validation
    if (!validatedData.email || !validatedData.name) {
      return createErrorResponse('Name and email are required', 400)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return createErrorResponse('User with this email already exists', 400)
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        loyaltyPoints: validatedData.loyaltyPoints || 0,
        emailVerified: new Date(), // Admin-created users are pre-verified
      },
      select: {
        id: true,
        name: true,
        email: true,
        loyaltyPoints: true,
        createdAt: true,
      }
    })

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: currentUser.id,
        action: 'CREATE_USER',
        resource: newUser.id,
        details: JSON.stringify({
          userEmail: newUser.email,
          userName: newUser.name,
        }),
      }
    }).catch(() => {}) // Silent fail for non-critical logging

    return createSuccessResponse(newUser, 'User created successfully', 201)
    
  } catch (error) {
    console.error('Create user error:', error)
    
    if (error instanceof z.ZodError) {
      return createErrorResponse('Invalid data provided', 400, error.errors)
    }
    
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      error instanceof Error && error.message.includes('Permission denied') ? 403 : 500
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 20, 60000, request)) {
      return createErrorResponse('Rate limit exceeded', 429)
    }

    // Require users:update permission
    const currentUser = await requirePermission('users:update', request)
    
    const body = await request.json()
    const { userId, ...updateData } = body
    
    if (!userId) {
      return createErrorResponse('User ID is required', 400)
    }

    const validatedData = userUpdateSchema.parse(updateData)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return createErrorResponse('User not found', 404)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        loyaltyPoints: true,
        totalSpent: true,
        updatedAt: true,
      }
    })

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: currentUser.id,
        action: 'UPDATE_USER',
        resource: userId,
        details: JSON.stringify({
          updatedFields: Object.keys(validatedData),
          userEmail: updatedUser.email,
        }),
      }
    }).catch(() => {}) // Silent fail for non-critical logging

    return createSuccessResponse(updatedUser, 'User updated successfully')
    
  } catch (error) {
    console.error('Update user error:', error)
    
    if (error instanceof z.ZodError) {
      return createErrorResponse('Invalid data provided', 400, error.errors)
    }
    
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      error instanceof Error && error.message.includes('Permission denied') ? 403 : 500
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 5, 60000, request)) {
      return createErrorResponse('Rate limit exceeded', 429)
    }

    // Require users:delete permission
    const currentUser = await requirePermission('users:delete', request)
    
    const searchParams = new URL(request.url).searchParams
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return createErrorResponse('User ID is required', 400)
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: {
            orders: true,
          }
        }
      }
    })

    if (!existingUser) {
      return createErrorResponse('User not found', 404)
    }

    // Prevent deletion if user has orders (business rule)
    if (existingUser._count.orders > 0) {
      return createErrorResponse(
        'Cannot delete user with existing orders. Consider deactivating instead.', 
        400
      )
    }

    // Delete user (will cascade to related records)
    await prisma.user.delete({
      where: { id: userId }
    })

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: currentUser.id,
        action: 'DELETE_USER',
        resource: userId,
        details: JSON.stringify({
          userEmail: existingUser.email,
          userName: existingUser.name,
        }),
      }
    }).catch(() => {}) // Silent fail for non-critical logging

    return createSuccessResponse(
      { deletedUserId: userId },
      'User deleted successfully'
    )
    
  } catch (error) {
    console.error('Delete user error:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      error instanceof Error && error.message.includes('Permission denied') ? 403 : 500
    )
  }
}