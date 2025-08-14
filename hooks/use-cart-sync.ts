import { useEffect, useRef } from 'react'
import { useCurrentUser } from '@/hooks/use-auth-store'
import { useCartStore } from '@/stores/cart-store'
import { toast } from 'sonner'

/**
 * Hook to manage cart synchronization across authentication state changes
 * Automatically syncs cart when user logs in/out
 */
export function useCartSync() {
  const { user, isAuthenticated, isLoading } = useCurrentUser()
  
  // Safely access cart store with error handling
  let cartState
  try {
    cartState = useCartStore()
  } catch (error) {
    console.error('Error accessing cart store:', error)
    cartState = {}
  }
  
  // Safely destructure with defaults
  const { 
    syncWithDatabase, 
    syncWithDatabaseDebounced,
    syncToDatabase, 
    loadFromDatabase, 
    items = [], 
    isSyncing = false,
    lastSyncAt 
  } = cartState || {}
  
  const prevAuthState = useRef<string | null>(null)
  const hasSyncedOnLogin = useRef(false)

  // Track authentication state changes
  useEffect(() => {
    if (isLoading) return

    const currentAuthState = user?.id || null
    const prevState = prevAuthState.current

    // FIXED: Add additional checks to prevent excessive syncing on navigation
    // Only sync when authentication state actually changes, not on every render
    
    // User just logged in
    if (!prevState && currentAuthState && !hasSyncedOnLogin.current) {
      console.log('🔄 AUTH STATE CHANGE: User logged in, triggering sync')
      handleLoginSync(currentAuthState)
      hasSyncedOnLogin.current = true
    }
    
    // User logged out
    else if (prevState && !currentAuthState) {
      console.log('🔄 AUTH STATE CHANGE: User logged out')
      handleLogoutSync(prevState)
      hasSyncedOnLogin.current = false
    }
    
    // User switched accounts
    else if (prevState && currentAuthState && prevState !== currentAuthState) {
      console.log('🔄 AUTH STATE CHANGE: Account switched')
      handleAccountSwitch(prevState, currentAuthState)
    }
    
    // FIXED: Skip sync if user is already authenticated and we've already synced
    else if (prevState === currentAuthState && currentAuthState && hasSyncedOnLogin.current) {
      console.log('🔄 AUTH STATE: No change detected, skipping sync')
    }

    prevAuthState.current = currentAuthState
  }, [user?.id, isLoading])

  // Sync cart on login
  const handleLoginSync = async (userId: string) => {
    try {
      console.log('🔄 User logged in, syncing cart...')
      
      if (items && items.length > 0) {
        // User has items in local cart, perform smart merge
        // FIXED: Use debounced sync to prevent rapid successive syncs
        if (syncWithDatabaseDebounced) {
          syncWithDatabaseDebounced(userId, 500) // 500ms delay on login
          
          // Show toast immediately for better UX
          toast.success('Welcome back! Syncing your cart...', {
            description: 'Items from different devices will be merged shortly.',
          })
        }
      } else {
        // No local items, just load from database
        if (loadFromDatabase) {
          await loadFromDatabase(userId)
          
          // Safely get item count from store
          try {
            const storeState = useCartStore.getState()
            const newItemCount = storeState?.items?.length || 0
            if (newItemCount > 0) {
              toast.success(`Welcome back! ${newItemCount} items restored to your cart.`)
            }
          } catch (error) {
            console.error('Error getting cart item count:', error)
          }
        }
      }
    } catch (error) {
      console.error('Cart sync on login failed:', error)
      toast.error('Failed to sync your cart. Please refresh the page.')
    }
  }

  // Save cart to database before logout
  const handleLogoutSync = async (userId: string) => {
    try {
      if (items && items.length > 0 && syncToDatabase) {
        console.log('💾 Saving cart to database before logout...')
        await syncToDatabase(userId)
        console.log('✅ Cart saved successfully')
      }
    } catch (error) {
      console.error('Failed to save cart before logout:', error)
      // Don't show error to user during logout process
    }
  }

  // Handle account switching
  const handleAccountSwitch = async (oldUserId: string, newUserId: string) => {
    try {
      console.log('🔄 Account switched, managing cart transition...')
      
      // Save current cart for old user
      if (items && items.length > 0 && syncToDatabase) {
        await syncToDatabase(oldUserId)
      }
      
      // Load cart for new user
      if (loadFromDatabase) {
        await loadFromDatabase(newUserId)
      }
      
      toast.success('Account switched. Cart updated for current user.')
    } catch (error) {
      console.error('Account switch cart sync failed:', error)
      toast.error('Failed to sync cart for new account.')
    }
  }

  // Manual sync function for user-triggered syncs
  const manualSync = async () => {
    if (!user?.id) {
      toast.error('Please log in to sync your cart.')
      return
    }

    if (!syncWithDatabaseDebounced) {
      toast.error('Cart sync not available.')
      return
    }

    // FIXED: Use debounced sync for manual syncs too
    syncWithDatabaseDebounced(user.id, 100) // Shorter delay for manual sync
    toast.success('Cart sync requested!')
  }

  // Periodic sync disabled temporarily to fix infinite refresh
  /* 
  useEffect(() => {
    if (!user?.id || isSyncing) return

    const syncInterval = setInterval(async () => {
      try {
        await syncWithDatabase(user.id)
        console.log('🔄 Periodic cart sync completed')
      } catch (error) {
        console.error('Periodic cart sync failed:', error)
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(syncInterval)
  }, [user?.id, isSyncing])

  // Sync on page visibility change disabled temporarily
  useEffect(() => {
    if (!user?.id) return

    const handleVisibilityChange = async () => {
      if (!document.hidden && !isSyncing) {
        try {
          await syncWithDatabase(user.id)
          console.log('🔄 Visibility change cart sync completed')
        } catch (error) {
          console.error('Visibility change cart sync failed:', error)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user?.id, isSyncing])
  */

  return {
    isSyncing: isSyncing || false,
    lastSyncAt,
    isAuthenticated,
    manualSync,
    hasLocalItems: (items && items.length > 0) || false,
  }
}

// Utility hook for cart sync status display
export function useCartSyncStatus() {
  const { isSyncing, lastSyncAt, isAuthenticated } = useCartSync()
  
  const getSyncStatusText = () => {
    if (!isAuthenticated) return 'Sign in to sync cart across devices'
    if (isSyncing) return 'Syncing cart...'
    if (lastSyncAt) {
      const syncDate = new Date(lastSyncAt)
      const now = new Date()
      const diffMinutes = Math.floor((now.getTime() - syncDate.getTime()) / (1000 * 60))
      
      if (diffMinutes < 1) return 'Cart synced just now'
      if (diffMinutes < 60) return `Cart synced ${diffMinutes}m ago`
      
      const diffHours = Math.floor(diffMinutes / 60)
      if (diffHours < 24) return `Cart synced ${diffHours}h ago`
      
      return `Cart synced ${Math.floor(diffHours / 24)}d ago`
    }
    return 'Cart not synced yet'
  }

  const getSyncStatusColor = () => {
    if (!isAuthenticated) return 'text-muted-foreground'
    if (isSyncing) return 'text-blue-600'
    if (lastSyncAt) return 'text-green-600'
    return 'text-orange-600'
  }

  return {
    statusText: getSyncStatusText(),
    statusColor: getSyncStatusColor(),
    isSyncing,
    isAuthenticated,
  }
}