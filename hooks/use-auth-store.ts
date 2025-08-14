import { useMutation } from '@tanstack/react-query'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { useUIStore, User } from '@/stores/auth-store'

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
  subscribeNewsletter?: boolean
}

// Enhanced login hook using NextAuth directly
export function useEnhancedLogin() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: LoginData) => {
      console.log('🔐 ENHANCED LOGIN: Starting NextAuth login process...')
      
      // Use NextAuth for complete authentication
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error('Invalid email or password')
      }

      if (!result?.ok) {
        throw new Error('Login failed')
      }

      // Session retrieval with retry logic and proper delay
      let session = null
      let retries = 0
      const maxRetries = 5
      
      while (!session?.user && retries < maxRetries) {
        // Wait before each attempt (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, retries)))
        
        try {
          const response = await fetch('/api/auth/session', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache'
            }
          })
          
          if (response.ok) {
            session = await response.json()
            console.log(`🔄 ENHANCED LOGIN: Session attempt ${retries + 1}:`, session?.user ? 'Success' : 'No user data')
          }
        } catch (error) {
          console.warn(`⚠️ ENHANCED LOGIN: Session fetch attempt ${retries + 1} failed:`, error)
        }
        
        retries++
      }
      
      if (!session?.user) {
        console.error('❌ ENHANCED LOGIN: Failed to retrieve session after', maxRetries, 'attempts')
        throw new Error('Authentication successful but session could not be established. Please try refreshing the page.')
      }
      
      console.log('✅ ENHANCED LOGIN: NextAuth session established')
      console.log('👤 User type:', session.user.userType)
      console.log('🔑 User role:', session.user.role)
      
      return { success: true, user: session.user }
    },
    onSuccess: (result) => {
      const { user } = result
      
      toast({
        title: 'Welcome back!',
        description: `You have successfully signed in to Sports Devil${user.userType === 'ADMIN' ? ' Admin Panel' : ''}.`,
      })

      console.log('🔄 ENHANCED LOGIN: Redirecting based on user type...')
      
      // Role-based redirect
      if (user.userType === 'ADMIN') {
        console.log('👑 Redirecting admin to admin dashboard')
        router.push('/admin')
      } else {
        console.log('👤 Redirecting customer to homepage')
        router.push('/')
      }
    },
    onError: (error: Error) => {
      console.error('❌ ENHANCED LOGIN: Login failed:', error)
      toast({
        title: 'Sign in failed',
        description: error.message || 'Please check your credentials and try again.',
        variant: 'destructive',
      })
    },
  })
}

// Enhanced logout hook using NextAuth directly
export function useEnhancedLogout() {
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      console.log('🔓 ENHANCED LOGOUT: Starting NextAuth logout process...')
      
      // Use NextAuth for complete session cleanup
      await signOut({ redirect: false })
      console.log('✅ ENHANCED LOGOUT: NextAuth signOut completed')
      
      return { success: true }
    },
    onSuccess: () => {
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      })
      
      console.log('🔄 ENHANCED LOGOUT: Redirecting to homepage...')
      router.push('/')
    },
    onError: (error) => {
      console.error('❌ ENHANCED LOGOUT: Logout failed:', error)
      
      toast({
        title: 'Logout Error',
        description: 'An error occurred during logout, but you have been signed out.',
        variant: 'destructive',
      })
      
      router.push('/')
    }
  })
}

// Enhanced registration hook
export function useEnhancedRegister() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      console.log('📝 STORE REGISTER: Starting registration...')
      
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      // Register user via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          password: data.password,
          agreeToTerms: data.agreeToTerms,
          subscribeNewsletter: data.subscribeNewsletter,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }

      return response.json()
    },
    onSuccess: () => {
      toast({
        title: 'Account created successfully!',
        description: 'Please sign in with your new credentials.',
      })

      // Redirect to login page
      router.push('/login')
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Enhanced hook combining NextAuth session with UI store
export function useCurrentUser() {
  const { data: session, status } = useSession()
  const uiStore = useUIStore()
  
  const user = session?.user as User | null
  const isLoading = status === 'loading'
  const isAuthenticated = !!session?.user
  
  return {
    // NextAuth session data (primary source of truth)
    user,
    isLoading,
    isAuthenticated,
    status,
    
    // Computed authentication helpers (synchronous for better performance)
    role: user?.role || null,
    userType: user?.userType || null,
    isAdmin: user?.userType === 'ADMIN',
    isSuperAdmin: user?.userType === 'ADMIN' && (user?.adminLevel === 'SUPER_ADMIN' || user?.adminLevel === 'OWNER'),
    isCustomer: user?.userType === 'CUSTOMER',
    adminLevel: user?.userType === 'ADMIN' ? user?.adminLevel || null : null,
    
    // Permission helper (synchronous)
    hasPermission: (permission: string) => {
      if (user?.userType !== 'ADMIN') return false
      if (user?.adminLevel === 'OWNER') return true // Owner has all permissions
      return user?.permissions?.includes(permission) || false
    },
    
    // UI state from store
    isMenuOpen: uiStore.isMenuOpen,
    currentAdminTab: uiStore.currentAdminTab,
    notificationPreferences: uiStore.notificationPreferences,
    
    // UI actions
    setMenuOpen: uiStore.setMenuOpen,
    setAdminTab: uiStore.setAdminTab,
    setNotificationPreference: uiStore.setNotificationPreference,
  }
}

// Legacy hook for backward compatibility (deprecated - use useCurrentUser instead)
export function useCurrentUserStore() {
  console.warn('⚠️ useCurrentUserStore is deprecated. Use useCurrentUser instead for better performance.')
  return useCurrentUser()
}

// Hook to check if user has specific role (enhanced)
export function useHasRole(role: string) {
  const { user } = useCurrentUser()
  return user?.role === role
}

// Legacy hook for backward compatibility (deprecated)
export function useHasRoleStore(role: string) {
  console.warn('⚠️ useHasRoleStore is deprecated. Use useHasRole instead.')
  return useHasRole(role)
}