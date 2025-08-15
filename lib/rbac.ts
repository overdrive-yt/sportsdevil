/**
 * Role-Based Access Control (RBAC) System
 * Enhanced security with granular permissions and audit logging
 */

import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'
import { NextRequest } from 'next/server'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

// Define all possible permissions in the system
const PERMISSIONS = {
  // User Management
  'users:read': 'View user information',
  'users:create': 'Create new users',
  'users:update': 'Update user information',
  'users:delete': 'Delete users',
  'users:impersonate': 'Impersonate other users',

  // Product Management  
  'products:read': 'View products',
  'products:create': 'Create new products',
  'products:update': 'Update product information',
  'products:delete': 'Delete products',
  'products:bulk': 'Bulk product operations',

  // Order Management
  'orders:read': 'View orders',
  'orders:update': 'Update order status',
  'orders:refund': 'Process refunds',
  'orders:cancel': 'Cancel orders',

  // Admin Management
  'admins:read': 'View admin information',
  'admins:create': 'Create new admins',
  'admins:update': 'Update admin information',
  'admins:delete': 'Delete admin accounts',

  // System Management
  'system:logs': 'View system logs',
  'system:backup': 'Create system backups',
  'system:maintenance': 'System maintenance mode',
  'system:settings': 'Update system settings',

  // Security & Audit
  'security:events': 'View security events',
  'security:audit': 'Access audit trails',
  'security:monitoring': 'Security monitoring dashboard',

  // Financial
  'finance:reports': 'View financial reports',
  'finance:coupons': 'Manage discount coupons',
  'finance:loyalty': 'Manage loyalty programs',

  // Notifications
  'notifications:view': 'View notifications',
  
  // Settings
  'settings:view': 'View settings',
} as const

export type Permission = keyof typeof PERMISSIONS

// Define Role type
export type Role = 'super_admin' | 'admin' | 'manager' | 'family_member' | 'viewer'

// Role definitions mapping
export const ROLE_DEFINITIONS: Record<Role, { displayName: string; description?: string }> = {
  super_admin: { displayName: 'Super Administrator', description: 'Full system access' },
  admin: { displayName: 'Administrator', description: 'Administrative access' }, 
  manager: { displayName: 'Manager', description: 'Management access' },
  family_member: { displayName: 'Family Member', description: 'Family access' },
  viewer: { displayName: 'Viewer', description: 'Read-only access' }
}

// Role definitions with default permissions
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    'users:read',
    'products:read', 'products:create', 'products:update',
    'orders:read', 'orders:update',
    'finance:coupons', 'finance:loyalty',
  ],
  SUPER_ADMIN: [
    // All ADMIN permissions plus:
    'users:create', 'users:update', 'users:delete',
    'products:delete', 'products:bulk',
    'orders:refund', 'orders:cancel',
    'admins:read', 'admins:create', 'admins:update',
    'security:events', 'security:audit',
    'finance:reports',
    'system:logs', 'system:settings',
  ],
  OWNER: [
    // All permissions (full system access)
    ...Object.keys(PERMISSIONS) as Permission[]
  ]
}

// Flatten role permissions (include inherited permissions)
function getFlattenedPermissions(role: string): Permission[] {
  const basePermissions = ROLE_PERMISSIONS[role] || []
  
  // SUPER_ADMIN inherits all ADMIN permissions
  if (role === 'SUPER_ADMIN') {
    return [...new Set([...ROLE_PERMISSIONS.ADMIN, ...basePermissions])]
  }
  
  // OWNER inherits all permissions
  if (role === 'OWNER') {
    return Object.keys(PERMISSIONS) as Permission[]
  }
  
  return basePermissions
}

// User context interface
export interface UserContext {
  id: string
  email: string
  name?: string
  role: string
  userType: 'ADMIN' | 'CUSTOMER'
  permissions: Permission[]
  adminLevel?: string
  department?: string
}

// Get current user context from session
async function getCurrentUser(request?: NextRequest): Promise<UserContext | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return null
    }

    const user = session.user as any
    
    // Get permissions based on role
    let permissions: Permission[] = []
    if (user.userType === 'ADMIN') {
      // Get permissions from admin record if available
      if (user.permissions && Array.isArray(user.permissions)) {
        permissions = user.permissions
      } else {
        // Fallback to role-based permissions
        permissions = getFlattenedPermissions(user.adminLevel || user.role)
      }
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      userType: user.userType || 'CUSTOMER',
      permissions,
      adminLevel: user.adminLevel,
      department: user.department,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Check if user has specific permission
function hasPermission(user: UserContext | null, permission: Permission): boolean {
  if (!user) return false
  
  // OWNER has all permissions
  if (user.adminLevel === 'OWNER' || user.role === 'OWNER') {
    return true
  }
  
  return user.permissions.includes(permission)
}

// Check if user has any of the specified permissions
function hasAnyPermission(user: UserContext | null, permissions: Permission[]): boolean {
  if (!user) return false
  
  return permissions.some(permission => hasPermission(user, permission))
}

// Check if user has all specified permissions
function hasAllPermissions(user: UserContext | null, permissions: Permission[]): boolean {
  if (!user) return false
  
  return permissions.every(permission => hasPermission(user, permission))
}

// Require specific permission (throws error if not authorized)
async function requirePermission(
  permission: Permission,
  request?: NextRequest
): Promise<UserContext> {
  const user = await getCurrentUser(request)
  
  if (!user) {
    await logSecurityEvent('UNAUTHORIZED_ACCESS', request, {
      requiredPermission: permission,
      reason: 'No user session'
    })
    throw new Error('Authentication required')
  }
  
  if (!hasPermission(user, permission)) {
    await logSecurityEvent('PERMISSION_DENIED', request, {
      userId: user.id,
      userRole: user.role,
      requiredPermission: permission,
      userPermissions: user.permissions
    })
    throw new Error(`Permission denied: ${permission}`)
  }
  
  return user
}

// Require any of the specified permissions
async function requireAnyPermission(
  permissions: Permission[],
  request?: NextRequest
): Promise<UserContext> {
  const user = await getCurrentUser(request)
  
  if (!user) {
    await logSecurityEvent('UNAUTHORIZED_ACCESS', request, {
      requiredPermissions: permissions,
      reason: 'No user session'
    })
    throw new Error('Authentication required')
  }
  
  if (!hasAnyPermission(user, permissions)) {
    await logSecurityEvent('PERMISSION_DENIED', request, {
      userId: user.id,
      userRole: user.role,
      requiredPermissions: permissions,
      userPermissions: user.permissions
    })
    throw new Error(`Permission denied: requires one of ${permissions.join(', ')}`)
  }
  
  return user
}

// Admin level checks
async function requireAdmin(request?: NextRequest): Promise<UserContext> {
  return await requireAnyPermission(['users:read', 'products:read'], request)
}

async function requireSuperAdmin(request?: NextRequest): Promise<UserContext> {
  return await requireAnyPermission(['admins:read', 'security:events'], request)
}

async function requireOwner(request?: NextRequest): Promise<UserContext> {
  const user = await getCurrentUser(request)
  
  if (!user || user.adminLevel !== 'OWNER') {
    await logSecurityEvent('OWNER_ACCESS_DENIED', request, {
      userId: user?.id,
      userRole: user?.role,
      adminLevel: user?.adminLevel
    })
    throw new Error('Owner access required')
  }
  
  return user
}

// Security event logging
async function logSecurityEvent(
  eventType: string,
  request?: NextRequest,
  details?: Record<string, any>
) {
  try {
    const ip = request?.headers.get('x-forwarded-for') || 
               request?.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request?.headers.get('user-agent')
    const path = request?.nextUrl?.pathname

    // In production, this would go to a security log service
    console.warn('🔒 RBAC Security Event:', {
      event: eventType,
      ip,
      userAgent,
      path,
      timestamp: new Date().toISOString(),
      ...details
    })
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}

// Permission management utilities
async function updateAdminPermissions(
  adminId: string,
  permissions: Permission[],
  updatedBy: string
): Promise<void> {
  try {
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        permissions: JSON.stringify(permissions),
        updatedAt: new Date(),
      }
    })

    // Log permission change
    await prisma.adminLog.create({
      data: {
        adminId: updatedBy,
        action: 'UPDATE_PERMISSIONS',
        resource: adminId,
        details: JSON.stringify({
          newPermissions: permissions,
          timestamp: new Date()
        }),
      }
    })
  } catch (error) {
    console.error('Failed to update admin permissions:', error)
    throw new Error('Permission update failed')
  }
}

// Get all available permissions (for admin UI)
function getAllPermissions(): Record<string, string> {
  return PERMISSIONS
}

// Get permissions for a specific role
function getRolePermissions(role: string): Permission[] {
  return getFlattenedPermissions(role)
}

// Validate permission exists
function isValidPermission(permission: string): permission is Permission {
  return permission in PERMISSIONS
}

// Create permission-based middleware
function createPermissionMiddleware(requiredPermissions: Permission[]) {
  return async (request: NextRequest) => {
    try {
      await requireAnyPermission(requiredPermissions, request)
      return true
    } catch (error) {
      return false
    }
  }
}

// Resource-based access control (for specific resources)
async function canAccessResource(
  user: UserContext | null,
  resourceType: string,
  resourceId: string,
  action: 'read' | 'update' | 'delete'
): Promise<boolean> {
  if (!user) return false
  
  // Check basic permission first
  const permission = `${resourceType}:${action}` as Permission
  if (!hasPermission(user, permission)) {
    return false
  }
  
  // Additional resource-specific checks could go here
  // For example, checking if user owns the resource
  
  return true
}

// RBAC Service class for component usage
export class RBACService {
  static getCurrentUser = getCurrentUser
  static hasPermission = hasPermission
  static hasAnyPermission = hasAnyPermission
  static hasAllPermissions = hasAllPermissions
  static requirePermission = requirePermission
  static requireAnyPermission = requireAnyPermission
  static requireAdmin = requireAdmin
  static requireSuperAdmin = requireSuperAdmin
  static requireOwner = requireOwner
  static updateAdminPermissions = updateAdminPermissions
  static getAllPermissions = getAllPermissions
  static getRolePermissions = getRolePermissions
  static isValidPermission = isValidPermission
  static createPermissionMiddleware = createPermissionMiddleware
  static canAccessResource = canAccessResource
  
  // Additional methods used by components
  static canManageUser = (currentUser: UserContext | null, targetUser: UserContext | null) => {
    if (!currentUser || !targetUser) return false
    return hasPermission(currentUser, 'users:update')
  }
  
  static getAllRoles = () => {
    return Object.keys(ROLE_DEFINITIONS) as Role[]
  }
  
  static getAssignableRoles = (currentUser: UserContext | null) => {
    if (!currentUser) return []
    // Super admins can assign any role, admins can assign roles below them
    const allRoles = Object.keys(ROLE_DEFINITIONS) as Role[]
    if (currentUser.role === 'super_admin') return allRoles
    if (currentUser.role === 'admin') return allRoles.filter(r => r !== 'super_admin')
    return []
  }
  
  static validateRoleAssignment = (currentUser: UserContext | null, targetRole: Role) => {
    const assignableRoles = RBACService.getAssignableRoles(currentUser)
    return assignableRoles.includes(targetRole)
  }

  // Additional methods for admin layout
  static getAllowedNavigation = (currentUser: UserContext | null) => {
    if (!currentUser) return []
    // Return navigation items based on user permissions
    const navItems = []
    if (hasPermission(currentUser, 'products:read')) navItems.push({
      name: 'Products',
      href: '/admin/products',
      icon: 'BarChart3'
    })
    if (hasPermission(currentUser, 'orders:read')) navItems.push({
      name: 'Orders',
      href: '/admin/orders',
      icon: 'TrendingUp'
    })
    if (hasPermission(currentUser, 'users:read')) navItems.push({
      name: 'Users',
      href: '/admin/users',
      icon: 'Users'
    })
    if (hasPermission(currentUser, 'admins:read')) navItems.push({
      name: 'Admins',
      href: '/admin/admins',
      icon: 'Settings'
    })
    if (hasPermission(currentUser, 'system:settings')) navItems.push({
      name: 'Settings',
      href: '/admin/settings',
      icon: 'Settings'
    })
    // Always include dashboard for authenticated users
    navItems.unshift({
      name: 'Dashboard',
      href: '/admin',
      icon: 'Home'
    })
    return navItems
  }

  static getDashboardType = (currentUser: UserContext | null) => {
    if (!currentUser) return 'public'
    if (currentUser.adminLevel === 'OWNER') return 'owner'
    if (currentUser.adminLevel === 'SUPER_ADMIN') return 'super_admin'
    if (currentUser.adminLevel === 'ADMIN') return 'admin'
    return 'user'
  }

  static getRoleDefinition = (role: Role) => {
    return ROLE_DEFINITIONS[role] || { displayName: role, description: 'Unknown role' }
  }

  static getUserDisplayInfo = (user: UserContext | null) => {
    if (!user) return { name: 'Anonymous', initials: 'AN', role: 'Guest' }
    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
    return {
      name: user.name || 'User',
      email: user.email,
      initials,
      role: ROLE_DEFINITIONS[user.role as Role]?.displayName || user.role
    }
  }
}

// React hook for client-side RBAC
function useRBAC() {
  const { data: session } = useSession()
  const [userContext, setUserContext] = useState<UserContext | null>(null)

  useEffect(() => {
    if (session?.user) {
      const user = session.user as any
      setUserContext({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        userType: user.userType || 'CUSTOMER',
        permissions: user.permissions || [],
        adminLevel: user.adminLevel,
        department: user.department,
      })
    } else {
      setUserContext(null)
    }
  }, [session])

  return {
    user: userContext,
    hasPermission: (permission: Permission) => hasPermission(userContext, permission),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(userContext, permissions),
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(userContext, permissions),
    isAdmin: userContext?.userType === 'ADMIN',
    isOwner: userContext?.adminLevel === 'OWNER',
    isSuperAdmin: userContext?.adminLevel === 'SUPER_ADMIN',
    loading: !session
  }
}

// Individual named exports for direct importing
export {
  getCurrentUser,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  requirePermission,
  requireAnyPermission,
  requireAdmin,
  requireSuperAdmin,
  requireOwner,
  updateAdminPermissions,
  getAllPermissions,
  getRolePermissions,
  isValidPermission,
  createPermissionMiddleware,
  canAccessResource,
  useRBAC,
  PERMISSIONS,
  ROLE_PERMISSIONS
}