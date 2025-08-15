'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { AdvancedSidebar } from '../ui/advanced-sidebar'
import { FuzzySearch, useFuzzySearch } from '../ui/fuzzy-search'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { useCurrentUser, useEnhancedLogout } from '../../hooks/use-auth-store'
import { 
  Bell, 
  Settings, 
  LogOut, 
  User, 
  Shield, 
  Loader2, 
  AlertTriangle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  showBreadcrumb?: boolean
  actions?: React.ReactNode
}

export function AdminLayout({ 
  children, 
  title, 
  description, 
  showBreadcrumb = true, 
  actions 
}: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isSimpleMode, setIsSimpleMode] = useState(false)
  const { user, isAuthenticated, isLoading, isAdmin } = useCurrentUser()
  const { mutate: logout, isPending: isLoggingOut } = useEnhancedLogout()
  const { isOpen: isSearchOpen, open: openSearch, close: closeSearch } = useFuzzySearch()
  const router = useRouter()

  // Check authentication and admin access
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, isAdmin, router])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Sidebar toggle with Ctrl/Cmd + B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        setSidebarCollapsed(prev => !prev)
      }
      
      // Search with Ctrl/Cmd + K (will be handled by search component)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        // TODO: Open search modal
        console.log('Open search modal')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogout = () => {
    logout()
  }

  const toggleDashboardMode = () => {
    setIsSimpleMode(prev => !prev)
    // TODO: Implement simple dashboard mode
    console.log('Toggle dashboard mode:', !isSimpleMode)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  // Show access denied if not admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">Administrator privileges required to access this area.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const contentVariants = {
    expanded: { marginLeft: 280 },
    collapsed: { marginLeft: 80 }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <AdvancedSidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="fixed left-0 top-0 z-40"
      />

      {/* Main Content */}
      <motion.div
        initial="expanded"
        animate={sidebarCollapsed ? "collapsed" : "expanded"}
        variants={contentVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen"
      >
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {title && (
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {title}
                    </h1>
                    {isSimpleMode && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Simple Mode
                      </Badge>
                    )}
                  </div>
                  {description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {description}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Dashboard Mode Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDashboardMode}
                className="flex items-center space-x-2"
              >
                {isSimpleMode ? (
                  <ToggleRight className="w-4 h-4 text-green-600" />
                ) : (
                  <ToggleLeft className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {isSimpleMode ? 'Advanced' : 'Simple'} Mode
                </span>
              </Button>

              {/* Actions */}
              {actions}

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.image || undefined} alt={user?.name || 'Admin'} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                        {user?.name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name || 'Admin User'}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <div className="flex items-center space-x-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div className="flex items-center space-x-2 cursor-pointer">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-red-600 dark:text-red-400 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      {isLoggingOut ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                      <span>Log out</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </motion.div>

      {/* Fuzzy Search Modal */}
      <FuzzySearch isOpen={isSearchOpen} onClose={closeSearch} />
    </div>
  )
}