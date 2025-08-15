import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrentUser } from './use-auth-store'
import { apiClient } from '../lib/api-client'
import { useCartStore } from '../stores/cart-store'
import { toast } from './use-toast'

export function useCart() {
  const { user, isAuthenticated } = useCurrentUser()
  const { syncWithServer, setLoading } = useCartStore()

  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await apiClient.getCart()
      // Sync server cart with local store
      syncWithServer((response as any).data || [])
      return response
    },
    enabled: isAuthenticated && !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCartSummary() {
  const { user, isAuthenticated } = useCurrentUser()

  return useQuery({
    queryKey: ['cart', 'summary'],
    queryFn: () => apiClient.getCartSummary(),
    enabled: isAuthenticated && !!user,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useAddToCart() {
  const queryClient = useQueryClient()
  const { addItem, setLoading } = useCartStore()
  const { user, isAuthenticated } = useCurrentUser()

  return useMutation({
    mutationFn: async (item: {
      productId: string
      quantity: number
      selectedColor?: string
      selectedSize?: string
      product: any // Product details for local store
    }) => {
      setLoading(true)
      
      if (isAuthenticated && user) {
        // Add to server cart
        const response = await apiClient.addToCart({
          productId: item.productId,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
        })
        return response
      } else {
        // Add to local cart store
        addItem({
          productId: item.productId,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          product: item.product,
        })
        return { success: true }
      }
    },
    onSuccess: (data, variables) => {
      setLoading(false)
      
      if (isAuthenticated && user) {
        // FIXED: Add immediate optimistic update for UI feedback
        // This prevents UI lag while waiting for cart sync
        addItem({
          productId: variables.productId,
          quantity: variables.quantity,
          selectedColor: variables.selectedColor,
          selectedSize: variables.selectedSize,
          product: variables.product,
        })
        console.log('✅ Item added to database + optimistic local update')
        
        // Invalidate cart queries to trigger authoritative sync
        queryClient.invalidateQueries({ queryKey: ['cart'] })
        console.log('🔄 Cart sync scheduled to reconcile with database')
        
        // ENHANCED: Also trigger direct cart sync as backup
        // This ensures the local store is reconciled with database state
        const cartStore = useCartStore.getState()
        if (cartStore?.syncWithDatabaseDebounced) {
          setTimeout(() => {
            cartStore.syncWithDatabaseDebounced(user.id, 1000)
            console.log('🔄 Direct cart sync triggered as backup')
          }, 100)
        }
      }
      
      toast({
        title: 'Added to Cart',
        description: `${variables.product.name} has been added to your cart.`,
      })
    },
    onError: (error: any) => {
      setLoading(false)
      toast({
        title: 'Error',
        description: error.message || 'Failed to add item to cart.',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient()
  const { updateQuantity, setLoading } = useCartStore()
  const { user, isAuthenticated } = useCurrentUser()

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      setLoading(true)
      
      if (isAuthenticated && user) {
        const response = await apiClient.updateCartItem(itemId, quantity)
        return response
      } else {
        updateQuantity(itemId, quantity)
        return { success: true }
      }
    },
    onSuccess: (data, variables) => {
      setLoading(false)
      
      if (isAuthenticated && user) {
        queryClient.invalidateQueries({ queryKey: ['cart'] })
        
        // FIXED: Remove duplicate local update for authenticated users
        // Let cart sync handle updating local state to prevent quantity doubling
        console.log('✅ Cart item updated in database - cart sync will update local state')
      }
    },
    onError: (error: any) => {
      setLoading(false)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update cart item.',
        variant: 'destructive',
      })
    },
  })
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient()
  const { removeItem, setLoading } = useCartStore()
  const { user, isAuthenticated } = useCurrentUser()

  return useMutation({
    mutationFn: async (itemId: string) => {
      setLoading(true)
      
      if (isAuthenticated && user) {
        const response = await apiClient.removeCartItem(itemId)
        return response
      } else {
        removeItem(itemId)
        return { success: true }
      }
    },
    onSuccess: (data, variables) => {
      setLoading(false)
      
      if (isAuthenticated && user) {
        queryClient.invalidateQueries({ queryKey: ['cart'] })
        
        // FIXED: Remove duplicate local removal for authenticated users
        // Let cart sync handle updating local state to prevent sync conflicts
        console.log('✅ Cart item removed from database - cart sync will update local state')
      }
      
      toast({
        title: 'Item Removed',
        description: 'Item has been removed from your cart.',
      })
    },
    onError: (error: any) => {
      setLoading(false)
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove cart item.',
        variant: 'destructive',
      })
    },
  })
}

export function useClearCart() {
  const queryClient = useQueryClient()
  const { clearCart, setLoading } = useCartStore()
  const { user, isAuthenticated } = useCurrentUser()

  return useMutation({
    mutationFn: async () => {
      setLoading(true)
      
      if (isAuthenticated && user) {
        const response = await apiClient.clearCart()
        return response
      } else {
        clearCart()
        return { success: true }
      }
    },
    onSuccess: () => {
      setLoading(false)
      
      if (isAuthenticated && user) {
        queryClient.invalidateQueries({ queryKey: ['cart'] })
        
        // FIXED: Remove duplicate local clear for authenticated users
        // Let cart sync handle updating local state to prevent sync conflicts
        console.log('✅ Cart cleared in database - cart sync will update local state')
      }
      
      toast({
        title: 'Cart Cleared',
        description: 'All items have been removed from your cart.',
      })
    },
    onError: (error: any) => {
      setLoading(false)
      toast({
        title: 'Error',
        description: error.message || 'Failed to clear cart.',
        variant: 'destructive',
      })
    },
  })
}