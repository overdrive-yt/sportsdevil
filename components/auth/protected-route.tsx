'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Loader2, Shield, Lock } from 'lucide-react'
import { useCurrentUser } from '../../hooks/use-auth-store'
import Link from 'next/link'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  fallbackComponent?: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  fallbackComponent,
  redirectTo 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        const currentPath = window.location.pathname
        const loginUrl = `/login?callbackUrl=${encodeURIComponent(currentPath)}`
        if (redirectTo) {
          router.push(redirectTo)
        } else {
          router.push(loginUrl)
        }
        return
      }

      if (requireAdmin && (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN'))) {
        const loginUrl = `/login?error=insufficient_permissions&message=Admin access required`
        router.push(loginUrl)
        return
      }
    }
  }, [user, isLoading, isAuthenticated, requireAuth, requireAdmin, router, redirectTo])

  // Loading state
  if (isLoading) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">🏏 Verifying Access</h3>
                <p className="text-sm text-muted-foreground">
                  Checking your Sports Devil credentials...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Auth required but not authenticated
  if (requireAuth && !isAuthenticated) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl">🏏 Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to access your Sports Devil dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href={`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`}>
                Sign In to Continue
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/register">Create New Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin required but not admin
  if (requireAdmin && (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN'))) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-red-700">🏏 Admin Access Required</CardTitle>
            <CardDescription>
              You need administrator privileges to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Return to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // All checks passed, render children
  return <>{children}</>
}

// Convenience wrapper for admin-only pages
export function AdminProtectedRoute({ 
  children, 
  fallbackComponent 
}: { 
  children: React.ReactNode
  fallbackComponent?: React.ReactNode 
}) {
  return (
    <ProtectedRoute 
      requireAuth={true} 
      requireAdmin={true} 
      fallbackComponent={fallbackComponent}
    >
      {children}
    </ProtectedRoute>
  )
}

// Convenience wrapper for auth-required pages
export function AuthProtectedRoute({ 
  children, 
  fallbackComponent 
}: { 
  children: React.ReactNode
  fallbackComponent?: React.ReactNode 
}) {
  return (
    <ProtectedRoute 
      requireAuth={true} 
      requireAdmin={false} 
      fallbackComponent={fallbackComponent}
    >
      {children}
    </ProtectedRoute>
  )
}