import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getSession } from 'next-auth/react'

// User interface now matches NextAuth session user exactly
export interface User {
  id: string
  email: string
  name?: string | null
  role?: string
  image?: string | null
  userType?: 'ADMIN' | 'CUSTOMER'
  
  // Admin-specific fields
  adminLevel?: string
  department?: string | null
  permissions?: string[]
  
  // Customer-specific fields
  loyaltyPoints?: number
  totalSpent?: string
}

interface UIStore {
  // UI-specific state only (no authentication data duplication)
  isMenuOpen: boolean
  currentAdminTab: string
  notificationPreferences: {
    email: boolean
    sms: boolean
    push: boolean
  }
  
  // UI Actions
  setMenuOpen: (open: boolean) => void
  setAdminTab: (tab: string) => void
  setNotificationPreference: (type: 'email' | 'sms' | 'push', enabled: boolean) => void
  
  // Computed values that derive from NextAuth session (no data duplication)
  getUser: () => Promise<User | null>
  getUserRole: () => Promise<string | null>
  getUserType: () => Promise<'ADMIN' | 'CUSTOMER' | null>
  isAdmin: () => Promise<boolean>
  isSuperAdmin: () => Promise<boolean>
  isCustomer: () => Promise<boolean>
  hasPermission: (permission: string) => Promise<boolean>
  getAdminLevel: () => Promise<string | null>
  isAuthenticated: () => Promise<boolean>
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // UI-specific state only
      isMenuOpen: false,
      currentAdminTab: 'overview',
      notificationPreferences: {
        email: true,
        sms: false,
        push: true,
      },

      // UI Actions
      setMenuOpen: (open: boolean) => {
        set({ isMenuOpen: open })
      },

      setAdminTab: (tab: string) => {
        set({ currentAdminTab: tab })
      },

      setNotificationPreference: (type: 'email' | 'sms' | 'push', enabled: boolean) => {
        set(state => ({
          notificationPreferences: {
            ...state.notificationPreferences,
            [type]: enabled
          }
        }))
      },

      // Computed values that derive from NextAuth session (async for performance)
      getUser: async () => {
        const session = await getSession()
        return session?.user as User || null
      },

      getUserRole: async () => {
        const session = await getSession()
        return session?.user?.role || null
      },

      getUserType: async () => {
        const session = await getSession()
        const userType = session?.user?.userType
        return (userType === 'ADMIN' || userType === 'CUSTOMER') ? userType : null
      },

      isAdmin: async () => {
        const session = await getSession()
        return session?.user?.userType === 'ADMIN'
      },

      isSuperAdmin: async () => {
        const session = await getSession()
        const user = session?.user
        return user?.userType === 'ADMIN' && (user?.adminLevel === 'SUPER_ADMIN' || user?.adminLevel === 'OWNER')
      },

      isCustomer: async () => {
        const session = await getSession()
        return session?.user?.userType === 'CUSTOMER'
      },

      hasPermission: async (permission: string) => {
        const session = await getSession()
        const user = session?.user
        if (user?.userType !== 'ADMIN') return false
        if (user?.adminLevel === 'OWNER') return true // Owner has all permissions
        return user?.permissions?.includes(permission) || false
      },

      getAdminLevel: async () => {
        const session = await getSession()
        const user = session?.user
        return user?.userType === 'ADMIN' ? user?.adminLevel || null : null
      },

      isAuthenticated: async () => {
        const session = await getSession()
        return !!session?.user
      },
    }),
    {
      name: 'sports-devil-ui-state',
      // Only persist UI preferences, not authentication data
      partialize: (state) => ({
        isMenuOpen: state.isMenuOpen,
        currentAdminTab: state.currentAdminTab,
        notificationPreferences: state.notificationPreferences,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('🔄 UI STORE: Rehydrated UI preferences')
        }
      },
    }
  )
)