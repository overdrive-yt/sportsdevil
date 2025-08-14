// V9.13.4: Role-Based Access Control System
import React from 'react'
import { User } from '@prisma/client'

export type Role = 'super_admin' | 'admin' | 'manager' | 'family_member' | 'viewer'

export type Permission = 
  | 'dashboard:view'
  | 'dashboard:advanced'
  | 'orders:view'
  | 'orders:edit'
  | 'orders:delete'
  | 'products:view'
  | 'products:edit'
  | 'products:delete'
  | 'customers:view'
  | 'customers:edit'
  | 'customers:delete'
  | 'analytics:view'
  | 'analytics:advanced'
  | 'integrations:view'
  | 'integrations:manage'
  | 'social:view'
  | 'social:post'
  | 'social:manage'
  | 'notifications:view'
  | 'notifications:manage'
  | 'settings:view'
  | 'settings:edit'
  | 'system:health'
  | 'system:logs'
  | 'api_keys:view'
  | 'api_keys:manage'
  | 'users:view'
  | 'users:manage'
  | 'reports:view'
  | 'reports:export'

export interface RoleDefinition {
  name: Role
  displayName: string
  description: string
  permissions: Permission[]
  dashboardType: 'simple' | 'advanced'
  color: string
}

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  super_admin: {
    name: 'super_admin',
    displayName: 'Super Admin',
    description: 'Full system access with all permissions',
    permissions: [
      'dashboard:view',
      'dashboard:advanced',
      'orders:view',
      'orders:edit',
      'orders:delete',
      'products:view',
      'products:edit',
      'products:delete',
      'customers:view',
      'customers:edit',
      'customers:delete',
      'analytics:view',
      'analytics:advanced',
      'integrations:view',
      'integrations:manage',
      'social:view',
      'social:post',
      'social:manage',
      'notifications:view',
      'notifications:manage',
      'settings:view',
      'settings:edit',
      'system:health',
      'system:logs',
      'api_keys:view',
      'api_keys:manage',
      'users:view',
      'users:manage',
      'reports:view',
      'reports:export'
    ],
    dashboardType: 'advanced',
    color: 'red'
  },
  admin: {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full business management access',
    permissions: [
      'dashboard:view',
      'dashboard:advanced',
      'orders:view',
      'orders:edit',
      'orders:delete',
      'products:view',
      'products:edit',
      'products:delete',
      'customers:view',
      'customers:edit',
      'analytics:view',
      'analytics:advanced',
      'integrations:view',
      'integrations:manage',
      'social:view',
      'social:post',
      'social:manage',
      'notifications:view',
      'notifications:manage',
      'settings:view',
      'settings:edit',
      'system:health',
      'api_keys:view',
      'reports:view',
      'reports:export'
    ],
    dashboardType: 'advanced',
    color: 'orange'
  },
  manager: {
    name: 'manager',
    displayName: 'Manager',
    description: 'Business operations and customer management',
    permissions: [
      'dashboard:view',
      'dashboard:advanced',
      'orders:view',
      'orders:edit',
      'products:view',
      'products:edit',
      'customers:view',
      'customers:edit',
      'analytics:view',
      'integrations:view',
      'social:view',
      'social:post',
      'notifications:view',
      'reports:view'
    ],
    dashboardType: 'advanced',
    color: 'blue'
  },
  family_member: {
    name: 'family_member',
    displayName: 'Family Member',
    description: 'Simple dashboard with basic business overview',
    permissions: [
      'dashboard:view',
      'orders:view',
      'products:view',
      'customers:view',
      'analytics:view',
      'social:view',
      'notifications:view'
    ],
    dashboardType: 'simple',
    color: 'green'
  },
  viewer: {
    name: 'viewer',
    displayName: 'Viewer',
    description: 'Read-only access to basic information',
    permissions: [
      'dashboard:view',
      'orders:view',
      'products:view',
      'analytics:view'
    ],
    dashboardType: 'simple',
    color: 'gray'
  }
}

export class RBACService {
  /**
   * Check if a user has a specific permission
   */
  static hasPermission(userRole: Role, permission: Permission): boolean {
    const roleDefinition = ROLE_DEFINITIONS[userRole]
    return roleDefinition?.permissions.includes(permission) || false
  }

  /**
   * Check if a user has any of the specified permissions
   */
  static hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission))
  }

  /**
   * Check if a user has all of the specified permissions
   */
  static hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission))
  }

  /**
   * Get all permissions for a role
   */
  static getRolePermissions(role: Role): Permission[] {
    return ROLE_DEFINITIONS[role]?.permissions || []
  }

  /**
   * Get role definition
   */
  static getRoleDefinition(role: Role): RoleDefinition | null {
    return ROLE_DEFINITIONS[role] || null
  }

  /**
   * Get dashboard type for a role
   */
  static getDashboardType(role: Role): 'simple' | 'advanced' {
    return ROLE_DEFINITIONS[role]?.dashboardType || 'simple'
  }

  /**
   * Get all available roles
   */
  static getAllRoles(): RoleDefinition[] {
    return Object.values(ROLE_DEFINITIONS)
  }

  /**
   * Get roles that can be assigned by a user
   */
  static getAssignableRoles(userRole: Role): RoleDefinition[] {
    const roleHierarchy: Record<Role, Role[]> = {
      super_admin: ['super_admin', 'admin', 'manager', 'family_member', 'viewer'],
      admin: ['manager', 'family_member', 'viewer'],
      manager: ['family_member', 'viewer'],
      family_member: [],
      viewer: []
    }

    const assignableRoles = roleHierarchy[userRole] || []
    return assignableRoles.map(role => ROLE_DEFINITIONS[role]).filter(Boolean)
  }

  /**
   * Check if a user can manage another user based on roles
   */
  static canManageUser(managerRole: Role, targetRole: Role): boolean {
    const roleHierarchy: Record<Role, number> = {
      super_admin: 5,
      admin: 4,
      manager: 3,
      family_member: 2,
      viewer: 1
    }

    return roleHierarchy[managerRole] > roleHierarchy[targetRole]
  }

  /**
   * Filter data based on permissions
   */
  static filterDataByPermissions<T>(
    data: T[],
    userRole: Role,
    requiredPermission: Permission
  ): T[] {
    if (this.hasPermission(userRole, requiredPermission)) {
      return data
    }
    return []
  }

  /**
   * Get allowed navigation items based on role
   */
  static getAllowedNavigation(role: Role): Array<{
    name: string
    href: string
    permission: Permission
    icon: string
  }> {
    const navigationItems = [
      { name: 'Overview', href: '/admin/overview', permission: 'dashboard:view' as Permission, icon: 'BarChart3' },
      { name: 'Analytics', href: '/admin/analytics', permission: 'analytics:view' as Permission, icon: 'TrendingUp' },
      { name: 'Integrations', href: '/admin/integrations', permission: 'integrations:view' as Permission, icon: 'Zap' },
      { name: 'Social Media', href: '/admin/social', permission: 'social:view' as Permission, icon: 'Users' },
      { name: 'Notifications', href: '/admin/notifications', permission: 'notifications:view' as Permission, icon: 'Bell' },
      { name: 'System Health', href: '/admin/health', permission: 'system:health' as Permission, icon: 'Activity' },
      { name: 'Settings', href: '/admin/settings', permission: 'settings:view' as Permission, icon: 'Settings' }
    ]

    return navigationItems.filter(item => this.hasPermission(role, item.permission))
  }

  /**
   * Get user display info based on user object
   */
  static getUserDisplayInfo(user: { name?: string; email?: string; role: Role }): {
    name: string
    role: string
    roleColor: string
    permissions: Permission[]
  } {
    const role = user.role || 'viewer'
    const roleDefinition = ROLE_DEFINITIONS[role]

    return {
      name: user.name || user.email || 'Unknown User',
      role: roleDefinition?.displayName || 'Viewer',
      roleColor: roleDefinition?.color || 'gray',
      permissions: roleDefinition?.permissions || []
    }
  }

  /**
   * Check if a user can assign a specific role
   */
  static canAssignRole(assignerRole: Role, targetRole: Role): { valid: boolean; error?: string } {
    if (!this.canManageUser(assignerRole, targetRole)) {
      return {
        valid: false,
        error: 'You do not have permission to assign this role'
      }
    }

    const assignableRoles = this.getAssignableRoles(assignerRole)
    const canAssign = assignableRoles.some(role => role.name === targetRole)

    if (!canAssign) {
      return {
        valid: false,
        error: 'This role cannot be assigned by your current role'
      }
    }

    return { valid: true }
  }

  /**
   * Validate role assignment (alias for canAssignRole)
   */
  static validateRoleAssignment(
    assignerRole: Role,
    targetRole: Role
  ): { valid: boolean; error?: string } {
    return this.canAssignRole(assignerRole, targetRole)
  }
}

/**
 * React hook for role-based access control
 */
export function useRBAC(userRole: Role): {
  currentRole: Role;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  getDashboardType: () => 'simple' | 'advanced';
  getAllowedNavigation: () => Array<{
    name: string;
    href: string;
    icon?: string;
    permission: Permission;
    subItems?: Array<{ name: string; href: string; permission: Permission; }>;
  }>;
  canManageUser: (targetRole: Role) => boolean;
  canAssignRole: (newRole: Role) => { valid: boolean; error?: string; };
  getAssignableRoles: () => RoleDefinition[];
  getUserDisplayInfo: (user?: { name?: string; email?: string; role: Role }) => { name: string; role: string; roleColor: string; permissions: Permission[] };
  roleDefinition: RoleDefinition;
} {
  return {
    currentRole: userRole,
    hasPermission: (permission: Permission) => RBACService.hasPermission(userRole, permission),
    hasAnyPermission: (permissions: Permission[]) => RBACService.hasAnyPermission(userRole, permissions),
    hasAllPermissions: (permissions: Permission[]) => RBACService.hasAllPermissions(userRole, permissions),
    getDashboardType: () => RBACService.getDashboardType(userRole),
    getAllowedNavigation: () => RBACService.getAllowedNavigation(userRole),
    canManageUser: (targetRole: Role) => RBACService.canManageUser(userRole, targetRole),
    canAssignRole: (newRole: Role) => RBACService.canAssignRole(userRole, newRole),
    getAssignableRoles: () => RBACService.getAssignableRoles(userRole),
    getUserDisplayInfo: (user?: { name?: string; email?: string; role: Role }) => user ? RBACService.getUserDisplayInfo(user) : { 
      name: 'Unknown', 
      role: RBACService.getRoleDefinition(userRole)?.displayName || 'Unknown', 
      roleColor: RBACService.getRoleDefinition(userRole)?.color || 'gray', 
      permissions: RBACService.getRolePermissions(userRole) 
    },
    roleDefinition: RBACService.getRoleDefinition(userRole)!
  }
}

/**
 * Permission guard component
 */
export function PermissionGuard({
  userRole,
  requiredPermission,
  fallback = null,
  children
}: {
  userRole: Role
  requiredPermission: Permission
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  if (!RBACService.hasPermission(userRole, requiredPermission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Role guard component
 */
export function RoleGuard({
  userRole,
  allowedRoles,
  fallback = null,
  children
}: {
  userRole: Role
  allowedRoles: Role[]
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  if (!allowedRoles.includes(userRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Dashboard type selector
 */
export function DashboardTypeSelector({ 
  userRole, 
  advancedDashboard, 
  simpleDashboard 
}: {
  userRole: Role
  advancedDashboard: React.ReactNode
  simpleDashboard: React.ReactNode
}) {
  const dashboardType = RBACService.getDashboardType(userRole)
  return dashboardType === 'advanced' ? advancedDashboard : simpleDashboard
}