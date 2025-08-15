// V9.15: Role-Based Admin Layout - White Theme & Sports Devil Branding
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Bell,
  Activity,
  Zap,
  Settings,
  TrendingUp,
  Users,
  Menu,
  X,
  LogOut,
  User,
  Shield,
  ChevronDown,
  Home,
  AlertTriangle
} from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { RBACService, Role, useRBAC } from '../../lib/rbac'

interface RoleBasedAdminLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
  currentUser?: {
    name: string
    email: string
    role: Role
    avatar?: string
  }
}

const iconMap = {
  BarChart3,
  TrendingUp,
  Zap,
  Users,
  Bell,
  Activity,
  Settings,
  Home
}

export function RoleBasedAdminLayout({
  children,
  title = "Dashboard",
  description,
  actions,
  currentUser = {
    name: "Admin User",
    email: "admin@sportsdevil.co.uk",
    role: "admin" as Role
  }
}: RoleBasedAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const rbac = useRBAC()
  const allowedNavigation = RBACService.getAllowedNavigation(rbac.user)
  const dashboardType = RBACService.getDashboardType(rbac.user)
  const roleDefinition = RBACService.getRoleDefinition(currentUser.role)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logging out...')
  }

  const getRoleColor = (role: Role) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-800 border-red-200',
      admin: 'bg-orange-100 text-orange-800 border-orange-200',
      manager: 'bg-blue-100 text-blue-800 border-blue-200',
      family_member: 'bg-green-100 text-green-800 border-green-200',
      viewer: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[role] || colors.viewer
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const userDisplayInfo = RBACService.getUserDisplayInfo(rbac.user)

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-gray-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SD</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">Sports Devil</h1>
              {dashboardType === 'user' && (
                <p className="text-xs text-gray-500">Family Dashboard</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-red-500 text-white">
                {currentUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {getGreeting()}, {currentUser.name.split(' ')[0]}!
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs ${getRoleColor(currentUser.role)}`} variant="secondary">
                  <Shield className="h-3 w-3 mr-1" />
                  {userDisplayInfo.role}
                </Badge>
              </div>
            </div>
          </div>
          
          {dashboardType === 'user' && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium">Family Access</p>
              <p className="text-xs text-green-700 mt-1">
                Simplified view with essential business information
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {allowedNavigation.map((item: any) => {
              const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Home
              return (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <IconComponent className="h-5 w-5" />
                  {item.name}
                </motion.a>
              )
            })}
          </div>
        </nav>

        {/* System Status (for family members) */}
        {dashboardType === 'user' && (
          <div className="mt-6 mx-3">
            <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-300">System Status</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-300">All systems operational</span>
              </div>
              <p className="text-xs text-blue-400 mt-1">
                Last updated: {currentTime.toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-auto p-6 border-t border-gray-700">
          <div className="bg-gradient-to-r from-blue-900/30 to-red-900/30 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">?</span>
              </div>
              <span className="text-sm font-medium text-white">Need Help?</span>
            </div>
            <p className="text-xs text-gray-300 mb-3">
              {dashboardType === 'user' 
                ? 'Family support available'
                : 'Technical support available'
              }
            </p>
            <Button size="sm" variant="outline" className="w-full text-xs">
              Contact Support
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top header */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-600">{description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {actions}
              
              {/* Notifications */}
              {rbac.hasPermission('notifications:view') && (
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    3
                  </Badge>
                </Button>
              )}

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-red-500 text-white text-sm">
                        {userDisplayInfo.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">{userDisplayInfo.name}</p>
                      <p className="text-xs text-gray-600">{userDisplayInfo.role}</p>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{userDisplayInfo.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                    <Badge className={`text-xs mt-1 ${getRoleColor(currentUser.role)}`} variant="secondary">
                      {userDisplayInfo.role}
                    </Badge>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {rbac.hasPermission('settings:view') && (
                    <DropdownMenuItem className="gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 min-h-0">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}