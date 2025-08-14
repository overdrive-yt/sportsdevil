'use client'

import { ReactNode } from 'react'
import { useCartSync } from '@/hooks/use-cart-sync'

interface CartSyncProviderProps {
  children: ReactNode
}

/**
 * Provider component that manages cart synchronization across the application
 * This should be wrapped around the app to enable automatic cart sync on auth changes
 */
export function CartSyncProvider({ children }: CartSyncProviderProps) {
  // Wrap hook in try-catch to prevent crashes
  try {
    useCartSync()
  } catch (error) {
    console.error('Cart sync error:', error)
    // Continue rendering children even if sync fails
  }

  // This provider doesn't render anything - it's just for side effects
  return <>{children}</>
}