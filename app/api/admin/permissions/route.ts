import { NextRequest } from 'next/server'
import { requirePermission, requireSuperAdmin, getAllPermissions, getRolePermissions, updateAdminPermissions, isValidPermission, Permission } from '@/lib/rbac'
import { prisma } from '../../lib/prisma'
import { createSuccessResponse, createErrorResponse } from '../../lib/api/responses'
import { checkRateLimit, getRateLimitIdentifier } from '../../lib/api/middleware'
import { z } from 'zod'

const updatePermissionsSchema = z.object({
  adminId: z.string(),
  permissions: z.array(z.string()),
})

const createAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  level: z.enum(['ADMIN', 'SUPER_ADMIN', 'OWNER']),
  department: z.string().optional(),
  permissions: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 50, 60000, request)) {
      return createErrorResponse('Rate limit exceeded', 429)
    }

    // Require admins:read permission
    const currentUser = await requirePermission('admins:read', request)
    
    const searchParams = new URL(request.url).searchParams
    const action = searchParams.get('action')
    
    switch (action) {
      case 'permissions':
        // Get all available permissions
        const allPermissions = getAllPermissions()
        return createSuccessResponse(allPermissions, 'Permissions retrieved successfully')
      
      case 'roles':
        // Get role-based permissions
        const rolePermissions = {
          ADMIN: getRolePermissions('ADMIN'),
          SUPER_ADMIN: getRolePermissions('SUPER_ADMIN'),
          OWNER: getRolePermissions('OWNER'),
        }
        return createSuccessResponse(rolePermissions, 'Role permissions retrieved successfully')
      
      case 'admins':
        // Get all admins with their permissions
        const admins = await prisma.admin.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            level: true,
            department: true,
            permissions: true,
            isActive: true,
            lastLoginAt: true,
            loginCount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' }
        })

        // Parse permissions JSON for each admin
        const adminsWithPermissions = admins.map(admin => ({
          ...admin,
          permissions: admin.permissions ? JSON.parse(admin.permissions) : getRolePermissions(admin.level),
        }))

        // Log admin access
        await prisma.adminLog.create({
          data: {
            adminId: currentUser.id,
            action: 'VIEW_ADMINS',
            details: JSON.stringify({
              totalAdmins: admins.length,
            }),
          }
        }).catch(() => {})

        return createSuccessResponse(adminsWithPermissions, 'Admins retrieved successfully')
      
      default:
        return createErrorResponse('Invalid action parameter. Use: permissions, roles, or admins', 400)
    }
    
  } catch (error) {
    console.error('Permissions API error:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      error instanceof Error && error.message.includes('Permission denied') ? 403 : 500
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 10, 60000, request)) {
      return createErrorResponse('Rate limit exceeded', 429)
    }

    // Require super admin access for permission updates
    const currentUser = await requireSuperAdmin(request)
    
    const body = await request.json()
    const { adminId, permissions } = updatePermissionsSchema.parse(body)

    // Validate all permissions exist
    const invalidPermissions = permissions.filter(p => !isValidPermission(p))
    if (invalidPermissions.length > 0) {
      return createErrorResponse(
        `Invalid permissions: ${invalidPermissions.join(', ')}`,
        400
      )
    }

    // Check if target admin exists
    const targetAdmin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, level: true }
    })

    if (!targetAdmin) {
      return createErrorResponse('Admin not found', 404)
    }

    // Prevent non-owner from modifying owner permissions
    if (targetAdmin.level === 'OWNER' && currentUser.adminLevel !== 'OWNER') {
      return createErrorResponse('Only owners can modify owner permissions', 403)
    }

    // Update permissions
    await updateAdminPermissions(adminId, permissions as Permission[], currentUser.id)

    // Get updated admin data
    const updatedAdmin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        level: true,
        permissions: true,
      }
    })

    return createSuccessResponse({
      admin: updatedAdmin,
      updatedPermissions: permissions
    }, 'Admin permissions updated successfully')
    
  } catch (error) {
    console.error('Update permissions error:', error)
    
    if (error instanceof z.ZodError) {
      return createErrorResponse('Invalid data provided', 400, error.errors)
    }
    
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      error instanceof Error && error.message.includes('Permission denied') ? 403 : 500
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 5, 60000, request)) {
      return createErrorResponse('Rate limit exceeded', 429)
    }

    // Require super admin access for creating admins
    const currentUser = await requireSuperAdmin(request)
    
    const body = await request.json()
    const validatedData = createAdminSchema.parse(body)

    // Only owners can create other owners
    if (validatedData.level === 'OWNER' && currentUser.adminLevel !== 'OWNER') {
      return createErrorResponse('Only owners can create other owners', 403)
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: validatedData.email }
    })

    if (existingAdmin) {
      return createErrorResponse('Admin with this email already exists', 400)
    }

    // Hash password
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Validate permissions if provided
    if (validatedData.permissions) {
      const invalidPermissions = validatedData.permissions.filter(p => !isValidPermission(p))
      if (invalidPermissions.length > 0) {
        return createErrorResponse(
          `Invalid permissions: ${invalidPermissions.join(', ')}`,
          400
        )
      }
    }

    // Create admin
    const newAdmin = await prisma.admin.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        level: validatedData.level,
        department: validatedData.department,
        permissions: validatedData.permissions ? 
          JSON.stringify(validatedData.permissions) : 
          JSON.stringify(getRolePermissions(validatedData.level)),
      },
      select: {
        id: true,
        name: true,
        email: true,
        level: true,
        department: true,
        permissions: true,
        createdAt: true,
      }
    })

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: currentUser.id,
        action: 'CREATE_ADMIN',
        resource: newAdmin.id,
        details: JSON.stringify({
          adminEmail: newAdmin.email,
          adminLevel: newAdmin.level,
          department: newAdmin.department,
        }),
      }
    }).catch(() => {})

    return createSuccessResponse({
      ...newAdmin,
      permissions: JSON.parse(newAdmin.permissions || '[]')
    }, 'Admin created successfully', 201)
    
  } catch (error) {
    console.error('Create admin error:', error)
    
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
    if (!checkRateLimit(identifier, 3, 60000, request)) {
      return createErrorResponse('Rate limit exceeded', 429)
    }

    // Require super admin access for deleting admins
    const currentUser = await requireSuperAdmin(request)
    
    const searchParams = new URL(request.url).searchParams
    const adminId = searchParams.get('adminId')
    
    if (!adminId) {
      return createErrorResponse('Admin ID is required', 400)
    }

    // Prevent self-deletion
    if (adminId === currentUser.id) {
      return createErrorResponse('Cannot delete your own admin account', 400)
    }

    // Check if target admin exists
    const targetAdmin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { 
        id: true, 
        email: true, 
        name: true,
        level: true 
      }
    })

    if (!targetAdmin) {
      return createErrorResponse('Admin not found', 404)
    }

    // Only owners can delete other admins
    if (currentUser.adminLevel !== 'OWNER') {
      return createErrorResponse('Only owners can delete admin accounts', 403)
    }

    // Prevent deletion of the last owner
    if (targetAdmin.level === 'OWNER') {
      const ownerCount = await prisma.admin.count({
        where: { level: 'OWNER', isActive: true }
      })
      
      if (ownerCount <= 1) {
        return createErrorResponse('Cannot delete the last owner account', 400)
      }
    }

    // Delete admin (will cascade to related records)
    await prisma.admin.delete({
      where: { id: adminId }
    })

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: currentUser.id,
        action: 'DELETE_ADMIN',
        resource: adminId,
        details: JSON.stringify({
          adminEmail: targetAdmin.email,
          adminName: targetAdmin.name,
          adminLevel: targetAdmin.level,
        }),
      }
    }).catch(() => {})

    return createSuccessResponse(
      { deletedAdminId: adminId },
      'Admin deleted successfully'
    )
    
  } catch (error) {
    console.error('Delete admin error:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      error instanceof Error && error.message.includes('Permission denied') ? 403 : 500
    )
  }
}