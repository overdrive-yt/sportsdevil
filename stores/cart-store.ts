import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  quantity: number
  selectedColor?: string
  selectedSize?: string
  product: {
    id: string
    name: string
    slug: string
    price: string
    primaryImage?: {
      url: string
      alt: string
    }
    stockQuantity: number
  }
}

export interface AppliedCoupon {
  code: string
  discountAmount: number
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  discountValue: number
  description?: string
}

interface CartStore {
  items: CartItem[]
  appliedCoupon: AppliedCoupon | null
  isLoading: boolean
  isSyncing: boolean
  isLocked: boolean // Lock cart during payment processing
  lastSyncAt: string | null
  
  // ADDED: Debouncing for sync operations
  syncTimeoutId: NodeJS.Timeout | null
  lastSyncRequestAt: string | null
  
  // ADDED: Sync locking to prevent concurrent operations
  syncLock: boolean
  syncOperationId: string | null
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  clearCartAfterPayment: () => void
  
  // Coupon actions
  applyCoupon: (coupon: AppliedCoupon) => void
  removeCoupon: () => void
  
  // Computed values
  getTotalItems: () => number
  getTotalPrice: () => number
  getSubtotal: () => number
  getDiscountAmount: () => number
  getFinalTotal: () => number
  getItemCount: (productId: string) => number
  
  // Database synchronization
  syncWithDatabase: (userId: string) => Promise<void>
  syncWithDatabaseDebounced: (userId: string, delayMs?: number) => void
  syncToDatabase: (userId: string) => Promise<void>
  loadFromDatabase: (userId: string) => Promise<void>
  
  // Cart locking for payment processing
  lockCart: () => void
  unlockCart: () => void
  
  // ADDED: Cart health and recovery
  validateAndCleanCart: () => void
  resetSuspiciousQuantities: () => void
  
  // Legacy API sync (kept for backwards compatibility)
  syncWithServer: (serverItems: CartItem[]) => void
  setLoading: (loading: boolean) => void
  setSyncing: (syncing: boolean) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      isLoading: false,
      isSyncing: false,
      isLocked: false,
      lastSyncAt: null,
      
      // ADDED: Initialize debouncing properties
      syncTimeoutId: null,
      lastSyncRequestAt: null,
      
      // ADDED: Initialize sync locking properties
      syncLock: false,
      syncOperationId: null,

      addItem: (item) => {
        const state = get()
        if (state?.isLocked) {
          console.warn('🔒 Cart is locked during payment processing - cannot add items')
          return
        }
        
        // Add debugging for quantity tracking
        console.log('🛒 Adding item to cart:', {
          productId: item.productId,
          productName: item.product?.name,
          requestedQuantity: item.quantity,
          productPrice: item.product?.price
        })
        
        // ENHANCED: Comprehensive quantity validation
        if (item.quantity <= 0) {
          console.error('🚨 INVALID QUANTITY: Cannot add zero or negative quantity:', item.quantity)
          return
        }
        
        if (item.quantity > 50) {
          console.error('🚨 SUSPICIOUS QUANTITY DETECTED:', item.quantity)
          console.error('🚨 This looks like a quantity accumulation bug - refusing to add')
          console.error('🚨 Product:', item.product?.name)
          
          // Show user-friendly error
          if (typeof window !== 'undefined') {
            // You could show a toast here, but avoiding importing toast in store
            console.log('🔧 Consider showing user error: "Invalid quantity. Please refresh the page."')
          }
          return
        }
        
        if (item.quantity > 10) {
          console.warn('⚠️ HIGH QUANTITY WARNING:', item.quantity, 'for product:', item.product?.name)
          console.warn('⚠️ This might indicate a quantity bug, but allowing with warning')
        }
        
        const items = state?.items || []
        const existingItem = items.find(
          (i) => 
            i.productId === item.productId &&
            i.selectedColor === item.selectedColor &&
            i.selectedSize === item.selectedSize
        )

        if (existingItem) {
          // Update existing item quantity
          const newQuantity = existingItem.quantity + item.quantity
          console.log('🔄 Updating existing cart item:', {
            productName: existingItem.product?.name,
            oldQuantity: existingItem.quantity,
            addingQuantity: item.quantity,
            newQuantity: newQuantity
          })
          
          // ENHANCED: Smart final quantity validation
          if (newQuantity > 50) {
            console.error('🚨 FINAL QUANTITY EXCEEDS SAFETY LIMIT:', newQuantity)
            console.error('🚨 This indicates a quantity accumulation bug')
            console.error('🚨 Product:', existingItem.product?.name)
            console.error('🚨 Resetting to safe quantity (1) instead of accumulating')
            
            // Reset to 1 instead of allowing accumulation
            set({
              items: items.map((i) =>
                i.id === existingItem.id
                  ? { ...i, quantity: 1 }
                  : i
              ),
            })
            
            // Log for debugging
            console.log('🔧 Quantity reset from', newQuantity, 'to 1 for', existingItem.product?.name)
          } else if (newQuantity > 20) {
            console.warn('⚠️ HIGH FINAL QUANTITY WARNING:', newQuantity)
            console.warn('⚠️ Capping at 20 as safety measure')
            
            set({
              items: items.map((i) =>
                i.id === existingItem.id
                  ? { ...i, quantity: Math.min(newQuantity, 20) }
                  : i
              ),
            })
          } else {
            set({
              items: items.map((i) =>
                i.id === existingItem.id
                  ? { ...i, quantity: newQuantity }
                  : i
              ),
            })
          }
        } else {
          // Add new item
          const newItem: CartItem = {
            ...item,
            id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          }
          console.log('➕ Adding new cart item:', {
            productName: newItem.product?.name,
            quantity: newItem.quantity,
            price: newItem.product?.price
          })
          set({ items: [...items, newItem] })
        }
      },

      updateQuantity: (id, quantity) => {
        const state = get()
        if (state?.isLocked) {
          console.warn('🔒 Cart is locked during payment processing - cannot update quantities')
          return
        }
        
        if (quantity <= 0) {
          if (state?.removeItem) {
            state.removeItem(id)
          }
          return
        }

        const items = state?.items || []
        set({
          items: items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        })
      },

      removeItem: (id) => {
        const state = get()
        if (state?.isLocked) {
          console.warn('🔒 Cart is locked during payment processing - cannot remove items')
          return
        }
        
        const items = state?.items || []
        set({
          items: items.filter((item) => item.id !== id),
        })
      },

      clearCart: () => {
        const state = get()
        if (state?.isLocked) {
          console.warn('🔒 Cart is locked during payment processing - cannot clear cart')
          return
        }
        
        set({ items: [], appliedCoupon: null })
      },

      // Special clear method for after successful payment (bypasses lock)
      clearCartAfterPayment: () => {
        console.log('✅ Clearing cart after successful payment (bypassing lock)')
        set({ items: [], appliedCoupon: null, isLocked: false })
      },

      // Coupon methods
      applyCoupon: (coupon) => {
        set({ appliedCoupon: coupon })
      },

      removeCoupon: () => {
        set({ appliedCoupon: null })
      },

      getTotalItems: () => {
        const state = get()
        const items = state?.items || []
        return items.reduce((total, item) => total + item.quantity, 0)
      },

      getSubtotal: () => {
        const state = get()
        const items = state?.items || []
        return items.reduce(
          (total, item) => total + parseFloat(item.product.price) * item.quantity,
          0
        )
      },

      getTotalPrice: () => {
        // Legacy method - keep for backward compatibility
        const state = get()
        return state?.getSubtotal ? state.getSubtotal() : 0
      },

      getDiscountAmount: () => {
        const state = get()
        const coupon = state?.appliedCoupon
        if (!coupon) return 0
        
        const currentSubtotal = state?.getSubtotal ? state.getSubtotal() : 0
        
        if (coupon.discountType === 'PERCENTAGE') {
          // Calculate percentage discount based on current subtotal
          return Math.round(currentSubtotal * (coupon.discountValue / 100) * 100) / 100
        } else if (coupon.discountType === 'FIXED_AMOUNT') {
          // Fixed amount discount (but don't exceed the subtotal)
          return Math.min(coupon.discountValue, currentSubtotal)
        }
        
        return 0
      },

      getFinalTotal: () => {
        const state = get()
        const subtotal = state?.getSubtotal ? state.getSubtotal() : 0
        const discount = state?.getDiscountAmount ? state.getDiscountAmount() : 0
        return Math.max(0, subtotal - discount)
      },

      getItemCount: (productId) => {
        const state = get()
        const items = state?.items || []
        return items
          .filter((item) => item.productId === productId)
          .reduce((total, item) => total + item.quantity, 0)
      },

      syncWithServer: (serverItems) => {
        set({ items: serverItems })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setSyncing: (syncing) => {
        set({ isSyncing: syncing })
      },

      // Cart locking methods
      lockCart: () => {
        console.log('🔒 Cart locked for payment processing')
        set({ isLocked: true })
      },

      unlockCart: () => {
        console.log('🔓 Cart unlocked after payment processing')
        set({ isLocked: false })
      },

      // ADDED: Debounced sync to prevent rapid successive syncs
      syncWithDatabaseDebounced: (userId: string, delayMs = 1000) => {
        const state = get()
        
        // Clear existing timeout if there is one
        if (state?.syncTimeoutId) {
          clearTimeout(state.syncTimeoutId)
        }
        
        // Set the last sync request timestamp
        set({ lastSyncRequestAt: new Date().toISOString() })
        
        // Create new debounced timeout
        const timeoutId = setTimeout(async () => {
          try {
            console.log('🔄 Debounced sync executing after delay...')
            await get().syncWithDatabase(userId)
          } catch (error) {
            console.error('Debounced sync failed:', error)
          } finally {
            set({ syncTimeoutId: null })
          }
        }, delayMs)
        
        set({ syncTimeoutId: timeoutId })
        console.log(`🔄 Debounced sync scheduled (${delayMs}ms delay)`)
      },

      // Smart sync: merge local and database cart with conflict resolution
      syncWithDatabase: async (userId) => {
        const state = get()
        
        // ENHANCED: Check both old and new sync locks
        if (state?.isSyncing || state?.syncLock) {
          console.log('🔄 Sync already in progress, skipping...')
          return // Prevent concurrent syncs
        }
        
        // ADDED: Acquire sync lock with unique operation ID
        const operationId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        set({ syncLock: true, syncOperationId: operationId, isSyncing: true })
        console.log(`🔒 Sync lock acquired: ${operationId}`)
        
        // ADDED: Check if sync was requested too recently (additional protection)
        if (state?.lastSyncAt) {
          const lastSync = new Date(state.lastSyncAt).getTime()
          const now = new Date().getTime()
          const timeSinceLastSync = now - lastSync
          
          if (timeSinceLastSync < 2000) { // 2 second minimum between syncs
            console.log(`🔄 Sync too recent (${timeSinceLastSync}ms ago), skipping...`)
            return
          }
        }
        
        // Check if user is authenticated before making API calls
        if (typeof window !== 'undefined') {
          try {
            // Use session API instead of cookie check to avoid race conditions
            const sessionResponse = await fetch('/api/auth/session')
            const session = await sessionResponse.json()
            
            if (!session?.user) {
              console.log('🚫 Skipping cart sync - no authentication')
              return
            }
            console.log('✅ Cart sync - user authenticated:', session.user.email)
          } catch (error) {
            console.log('🚫 Skipping cart sync - session check failed:', error)
            return
          }
        }
        
        set({ isSyncing: true })
        
        try {
          const response = await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              localCartItems: (get()?.items || []).map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                selectedColor: item.selectedColor,
                selectedSize: item.selectedSize,
              })),
              syncDirection: 'merge',
            }),
          })

          if (!response.ok) {
            throw new Error('Sync failed')
          }

          const data = await response.json()
          
          if (data.success && data.finalCart && Array.isArray(data.finalCart)) {
            // Convert database cart back to Zustand format
            console.log('🔄 Converting database cart to Zustand format:', data.finalCart)
            
            const syncedItems = data.finalCart.map((dbItem: any) => {
              // Validate quantity during sync
              if (dbItem.quantity > 100) {
                console.error('🚨 SUSPICIOUS QUANTITY IN DB SYNC:', {
                  productName: dbItem.product?.name,
                  quantity: dbItem.quantity,
                  productId: dbItem.productId
                })
                console.error('🚨 Capping quantity at 100 during sync')
                dbItem.quantity = 100
              }
              
              const syncedItem = {
                id: `db-${dbItem.id}`,
                productId: dbItem.productId,
                quantity: dbItem.quantity,
                selectedColor: dbItem.selectedColor,
                selectedSize: dbItem.selectedSize,
                product: {
                  id: dbItem.product.id,
                  name: dbItem.product.name,
                  slug: dbItem.product.slug,
                  price: dbItem.product.price.toString(),
                  primaryImage: dbItem.product.primaryImage,
                  stockQuantity: dbItem.product.stockQuantity,
                }
              }
              
              console.log('🔄 Synced cart item:', {
                productName: syncedItem.product.name,
                quantity: syncedItem.quantity,
                price: syncedItem.product.price
              })
              
              return syncedItem
            })

            // ENHANCED: Advanced deduplication with quantity validation
            // Create comprehensive deduplication map
            const itemMap = new Map()
            
            for (const item of syncedItems) {
              // Validate quantity before processing
              if (item.quantity > 100) {
                console.error('🚨 EXTREME QUANTITY DETECTED during sync:', item.quantity, 'for', item.product?.name)
                item.quantity = 1 // Reset to safe value
              } else if (item.quantity > 10) {
                console.warn('⚠️ HIGH QUANTITY during sync:', item.quantity, 'for', item.product?.name)
                item.quantity = Math.min(item.quantity, 10) // Cap at 10
              }
              
              const key = `${item.productId}-${item.selectedColor || 'no-color'}-${item.selectedSize || 'no-size'}`
              
              if (itemMap.has(key)) {
                const existingItem = itemMap.get(key)
                console.warn('🚨 SYNC DUPLICATE DETECTED:', item.product?.name, 'quantities:', existingItem.quantity, 'vs', item.quantity)
                
                // Keep the item with the lower, more reasonable quantity
                if (item.quantity < existingItem.quantity && item.quantity > 0) {
                  itemMap.set(key, item)
                  console.log('🔄 Keeping lower quantity:', item.quantity)
                }
              } else {
                itemMap.set(key, item)
              }
            }
            
            // Convert map back to array
            const deduplicatedItems = Array.from(itemMap.values())
            
            console.log(`🔄 Cart sync: ${syncedItems.length} raw items → ${deduplicatedItems.length} deduplicated`)

            set({ 
              items: deduplicatedItems,
              lastSyncAt: new Date().toISOString()
            })

            // Show notification if there were conflicts resolved
            if (data.conflicts && data.conflicts.length > 0) {
              console.log('Cart sync resolved conflicts:', data.conflicts)
            }
          } else {
            console.warn('Cart sync response missing finalCart data:', data)
            // Fallback: keep existing items if sync response is malformed
          }
        } catch (error) {
          console.error('Cart sync failed:', error)
        } finally {
          // ENHANCED: Release sync lock along with sync flag
          console.log(`🔓 Sync lock released: ${operationId}`)
          set({ 
            isSyncing: false, 
            syncLock: false, 
            syncOperationId: null 
          })
        }
      },

      // Sync current local cart to database (overwrite database)
      syncToDatabase: async (userId) => {
        const state = get()
        if (state?.isSyncing) return
        
        // Check if user is authenticated before making API calls
        if (typeof window !== 'undefined') {
          try {
            const sessionResponse = await fetch('/api/auth/session')
            const session = await sessionResponse.json()
            
            if (!session?.user) {
              console.log('🚫 Skipping cart sync to database - no authentication')
              return
            }
          } catch (error) {
            console.log('🚫 Skipping cart sync to database - session check failed:', error)
            return
          }
        }
        
        set({ isSyncing: true })
        
        try {
          const response = await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              localCartItems: (get()?.items || []).map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                selectedColor: item.selectedColor,
                selectedSize: item.selectedSize,
              })),
              syncDirection: 'local_to_db',
            }),
          })

          if (!response.ok) {
            throw new Error('Sync to database failed')
          }

          set({ lastSyncAt: new Date().toISOString() })
        } catch (error) {
          console.error('Sync to database failed:', error)
        } finally {
          set({ isSyncing: false })
        }
      },

      // Load cart from database (overwrite local)
      loadFromDatabase: async (userId) => {
        const state = get()
        if (state?.isSyncing) return
        
        // Check if user is authenticated before making API calls
        if (typeof window !== 'undefined') {
          try {
            const sessionResponse = await fetch('/api/auth/session')
            const session = await sessionResponse.json()
            
            if (!session?.user) {
              console.log('🚫 Skipping load from database - no authentication')
              return
            }
          } catch (error) {
            console.log('🚫 Skipping load from database - session check failed:', error)
            return
          }
        }
        
        set({ isSyncing: true })
        
        try {
          const response = await fetch('/api/cart/sync')
          
          if (!response.ok) {
            throw new Error('Failed to load from database')
          }

          const data = await response.json()
          
          if (data.success) {
            set({ 
              items: data.items,
              lastSyncAt: new Date().toISOString()
            })
          }
        } catch (error) {
          console.error('Load from database failed:', error)
        } finally {
          set({ isSyncing: false })
        }
      },

      // ADDED: Cart health validation and cleanup
      validateAndCleanCart: () => {
        const state = get()
        const items = state?.items || []
        let hasChanges = false
        let cleanedItems = []
        
        console.log('🔍 Validating cart health...')
        
        for (const item of items) {
          if (!item.product || !item.productId) {
            console.warn('🧹 Removing invalid cart item (missing product data)')
            hasChanges = true
            continue
          }
          
          if (item.quantity <= 0) {
            console.warn('🧹 Removing cart item with zero/negative quantity:', item.product.name)
            hasChanges = true
            continue
          }
          
          if (item.quantity > 50) {
            console.warn('🧹 Resetting suspicious quantity for:', item.product.name, 'from', item.quantity, 'to 1')
            cleanedItems.push({ ...item, quantity: 1 })
            hasChanges = true
            continue
          }
          
          if (item.quantity > 10) {
            console.warn('🧹 Capping high quantity for:', item.product.name, 'from', item.quantity, 'to 10')
            cleanedItems.push({ ...item, quantity: Math.min(item.quantity, 10) })
            hasChanges = true
            continue
          }
          
          // Item is valid, keep as-is
          cleanedItems.push(item)
        }
        
        if (hasChanges) {
          console.log('✅ Cart cleaned - updated', cleanedItems.length, 'items')
          set({ items: cleanedItems })
        } else {
          console.log('✅ Cart is healthy - no changes needed')
        }
      },

      resetSuspiciousQuantities: () => {
        const state = get()
        const items = state?.items || []
        
        console.log('🔄 Resetting all suspicious quantities...')
        
        const resetItems = items.map(item => {
          if (item.quantity > 10) {
            console.log('🔄 Resetting quantity for', item.product?.name, 'from', item.quantity, 'to 1')
            return { ...item, quantity: 1 }
          }
          return item
        })
        
        set({ items: resetItems })
        console.log('✅ All suspicious quantities reset')
      },
    }),
    {
      name: 'sports-devil-cart',
      // Persist items and sync metadata
      partialize: (state) => ({ 
        items: state.items || [],
        lastSyncAt: state.lastSyncAt,
      }),
      // Ensure items is always an array on hydration
      onRehydrateStorage: () => (state) => {
        if (state && (!state.items || !Array.isArray(state.items))) {
          state.items = []
        }
        if (state && !state.appliedCoupon) {
          state.appliedCoupon = null
        }
        // Ensure boolean states have default values
        if (state && typeof state.isLoading !== 'boolean') {
          state.isLoading = false
        }
        if (state && typeof state.isSyncing !== 'boolean') {
          state.isSyncing = false
        }
        if (state && typeof state.isLocked !== 'boolean') {
          state.isLocked = false
        }
      },
    }
  )
)