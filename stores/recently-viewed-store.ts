import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Product {
  id: string
  name: string
  slug: string
  price: string
  images?: { url: string; alt: string }[]
  category?: { name: string }
}

interface RecentlyViewedStore {
  items: Product[]
  addProduct: (product: Product) => void
  removeProduct: (productId: string) => void
  clearAll: () => void
  getRecentProducts: (limit?: number) => Product[]
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addProduct: (product) => {
        set((state) => {
          // Remove if already exists to avoid duplicates
          const filtered = state.items.filter(item => item.id !== product.id)
          
          // Add to beginning and limit to 10 items
          const newItems = [product, ...filtered].slice(0, 10)
          
          return { items: newItems }
        })
      },
      
      removeProduct: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== productId)
        }))
      },
      
      clearAll: () => {
        set({ items: [] })
      },
      
      getRecentProducts: (limit = 5) => {
        return get().items.slice(0, limit)
      }
    }),
    {
      name: 'recently-viewed-storage',
      partialize: (state) => ({ items: state.items })
    }
  )
)