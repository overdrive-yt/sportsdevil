'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCurrentUser, useEnhancedLogin } from '@/hooks/use-auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Mail, Lock, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [redirectMessage, setRedirectMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const loginMutation = useEnhancedLogin()
  const { user, isAuthenticated, isLoading } = useCurrentUser()

  const callbackUrl = searchParams.get('callbackUrl')
  const error = searchParams.get('error')
  const message = searchParams.get('message')
  const logout = searchParams.get('logout')

  useEffect(() => {
    // Redirect authenticated users to homepage
    if (isAuthenticated && user) {
      console.log('🔄 LOGIN PAGE: User already authenticated, redirecting to homepage')
      router.push('/')
      return
    }
    
    // Set appropriate redirect messages based on URL parameters
    if (logout === 'success') {
      setRedirectMessage('You have been successfully signed out.')
    } else if (error && message) {
      switch (error) {
        case 'access_denied':
          setRedirectMessage(`Access denied: ${message}`)
          break
        case 'insufficient_permissions':
          setRedirectMessage(`Insufficient permissions: ${message}`)
          break
        default:
          setRedirectMessage(message)
      }
    } else if (callbackUrl) {
      setRedirectMessage(`Please sign in to continue to ${callbackUrl}`)
    }
  }, [error, message, callbackUrl, logout, isAuthenticated, user, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    console.log('🔐 LOGIN FORM: Submitting login form')
    await loginMutation.mutateAsync(data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center relative pt-16 pb-5">
          <Link href="/" className="absolute top-4 left-4 z-10 flex items-center bg-black text-white px-3 py-2 rounded-md hover:bg-gray-800 transition-colors shadow-lg">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Back to Website</span>
          </Link>
          <CardTitle className="text-2xl font-bold mb-3">Welcome Back to Sports Devil</CardTitle>
          <CardDescription className="text-base">
            Sign in to access your sports equipment orders and exclusive deals
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-6">
          {redirectMessage && (
            <Alert className={error === 'access_denied' || error === 'insufficient_permissions' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className={error === 'access_denied' || error === 'insufficient_permissions' ? 'text-red-800' : 'text-blue-800'}>
                {redirectMessage}
              </AlertDescription>
            </Alert>
          )}

          {loginMutation.error && (
            <Alert variant="destructive">
              <AlertDescription>
                {loginMutation.error.message || 'Invalid email or password'}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? 'Hide password' : 'Show password'}
                  </span>
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-11" disabled={isSubmitting || loginMutation.isPending}>
              {isSubmitting || loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-4">
            <Button variant="outline" disabled className="relative h-11">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
              <span className="text-xs text-muted-foreground absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">Coming Soon</span>
            </Button>
            <Button variant="outline" disabled className="relative h-11">
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
              Apple
              <span className="text-xs text-muted-foreground absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">Coming Soon</span>
            </Button>
          </div>

          <div className="text-center text-sm pt-2">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading login form...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}