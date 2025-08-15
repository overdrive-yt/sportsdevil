"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { apiClient } from '../lib/api-client'

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  shortDescription?: string
  price: string
  originalPrice?: string
  sku: string
  stockQuantity: number
  isActive: boolean
  isFeatured: boolean
  isNew: boolean
  categories: Array<{
    id: string
    name: string
    slug: string
    isPrimary: boolean
  }>
  primaryCategory: {
    id: string
    name: string
    slug: string
  }
  primaryImage?: {
    id: string
    url: string
    alt: string
  }
}

interface ProductFilters {
  search?: string
  category?: string
  categories?: string[]
  ageCategory?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  new?: boolean
  inStock?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface ProductsState {
  // All products loaded in context
  allProducts: Product[]
  
  // Cricket categories for instant navigation
  cricketProducts: Product[]
  wicketKeepingGloves: Product[]
  wicketKeepingPads: Product[]
  
  // Loading states
  isLoading: boolean
  isInitialized: boolean
  lastUpdated: number
  
  // Error handling
  error: string | null
}

interface ProductsContextType {
  state: ProductsState
  
  // Actions
  loadCricketProducts: () => Promise<void>
  filterProducts: (products: Product[], filters: ProductFilters) => Product[]
  searchProducts: (query: string) => Product[]
  
  // Quick accessors for instant navigation
  getProductsByCategory: (categoryName: string) => Product[]
  getWicketKeepingGloves: () => Product[]
  getWicketKeepingPads: () => Product[]
  
  // State management
  refreshProducts: () => Promise<void>
  clearError: () => void
}

const initialState: ProductsState = {
  allProducts: [],
  cricketProducts: [],
  wicketKeepingGloves: [],
  wicketKeepingPads: [],
  isLoading: false,
  isInitialized: false,
  lastUpdated: 0,
  error: null,
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProductsState>(initialState)

  // Load all cricket products for instant navigation
  const loadCricketProducts = useCallback(async () => {
    // Use functional setState to check and set loading state atomically
    let shouldLoad = false
    setState(prev => {
      if (prev.isLoading) {
        console.log('🔄 ProductsContext: Already loading, skipping...')
        return prev
      }
      console.log('🚀 ProductsContext: Starting to load cricket products...')
      shouldLoad = true
      return { ...prev, isLoading: true, error: null }
    })
    
    if (!shouldLoad) return
    
    try {
      // Load all cricket products in one request
      console.log('📡 ProductsContext: Making API call to load products...')
      const response = await apiClient.getProducts({ 
        limit: 50, // Sufficient for all cricket products
        sort: 'name'
      })
      
      console.log('📦 ProductsContext: API response received:', {
        success: response.success,
        dataLength: Array.isArray(response.data) ? response.data.length : 0,
        hasData: !!response.data
      })
      
      if (response.data && Array.isArray(response.data)) {
        const allProducts = response.data
        console.log('📊 ProductsContext: Processing', allProducts.length, 'products...')
        
        // Log first few products for debugging
        console.log('🔍 ProductsContext: First 3 products sample:', allProducts.slice(0, 3).map((p: any) => ({
          name: p.name,
          categories: p.categories?.map((c: any) => c.name) || ['NO CATEGORIES']
        })))
        
        // Filter cricket products for instant access
        const cricketProducts = allProducts.filter((product: any) => 
          product.categories?.some((cat: any) => 
            cat.name?.toLowerCase().includes('cricket') ||
            cat.name?.toLowerCase().includes('wicket keeping') ||
            cat.name?.toLowerCase().includes('batting') ||
            cat.slug?.includes('cricket') ||
            cat.slug?.includes('wicket-keeping')
          )
        )
        
        console.log('🏏 ProductsContext: Filtered', cricketProducts.length, 'cricket products')
        
        // Pre-filter specific categories for instant navigation
        const wicketKeepingGloves = allProducts.filter((product: any) =>
          product.categories?.some((cat: any) => 
            cat.name === 'Wicket Keeping Gloves' ||
            cat.slug === 'wicket-keeping-gloves'
          )
        )
        
        const wicketKeepingPads = allProducts.filter((product: any) =>
          product.categories?.some((cat: any) => 
            cat.name === 'Wicket Keeping Pads' ||
            cat.slug === 'wicket-keeping-pads'
          )
        )
        
        console.log('🥅 ProductsContext: Found', wicketKeepingGloves.length, 'WK Gloves,', wicketKeepingPads.length, 'WK Pads')
        
        setState(prev => ({
          ...prev,
          allProducts,
          cricketProducts,
          wicketKeepingGloves,
          wicketKeepingPads,
          isLoading: false,
          isInitialized: true,
          lastUpdated: Date.now(),
          error: null,
        }))
        
        console.log('✅ ProductsContext: Successfully initialized with:', {
          totalProducts: allProducts.length,
          cricketProducts: cricketProducts.length,
          wicketKeepingGloves: wicketKeepingGloves.length,
          wicketKeepingPads: wicketKeepingPads.length,
          isInitialized: true
        })
      } else {
        console.warn('⚠️ ProductsContext: API response has no data')
      }
    } catch (error) {
      console.error('❌ ProductsContext: Failed to load cricket products:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load products',
      }))
    }
  }, []) // Empty dependency array since we use functional setState

  // Client-side product filtering for instant results
  const filterProducts = useCallback((products: Product[], filters: ProductFilters): Product[] => {
    let filtered = [...products]

    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.shortDescription?.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm)
      )
    }

    // Clean category filtering with new Cricket category structure
    if (filters.category) {
      console.log('🏷️ Filtering by category:', filters.category)
      
      filtered = filtered.filter(product => {
        const hasMatch = product.categories?.some((cat: any) => {
          // Direct category matching (exact name or slug)
          if (cat.name === filters.category || 
              cat.slug === filters.category?.toLowerCase().replace(/\s+/g, '-')) {
            console.log('✅ Direct match found:', product.name, 'in category', cat.name)
            return true
          }
          
          return false
        }) || false
        
        if (!hasMatch) {
          console.log('❌ No category match for:', product.name, '- has categories:', product.categories?.map((c: any) => c.name) || [])
        }
        
        return hasMatch
      })
      
      console.log('📊 Category filter result:', filtered.length, 'products found')
    }

    // Multiple categories filter
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        product.categories?.some((cat: any) =>
          filters.categories!.includes(cat.name) ||
          filters.categories!.includes(cat.slug)
        )
      )
    }

    // Price filters
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(product => parseFloat(product.price) >= filters.minPrice!)
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(product => parseFloat(product.price) <= filters.maxPrice!)
    }

    // Feature filters
    if (filters.featured !== undefined) {
      filtered = filtered.filter(product => product.isFeatured === filters.featured)
    }
    if (filters.new !== undefined) {
      filtered = filtered.filter(product => product.isNew === filters.new)
    }
    if (filters.inStock !== undefined) {
      filtered = filtered.filter(product => 
        filters.inStock ? product.stockQuantity > 0 : product.stockQuantity === 0
      )
    }

    // Smart stock-based sorting: in-stock first, then by specified criteria
    filtered.sort((a, b) => {
      // First priority: stock status (in-stock first)
      const aInStock = a.stockQuantity > 0
      const bInStock = b.stockQuantity > 0
      
      if (aInStock && !bInStock) return -1  // a is in-stock, b is out-of-stock
      if (!aInStock && bInStock) return 1   // a is out-of-stock, b is in-stock
      
      // Second priority: specified sorting criteria (within same stock status)
      if (filters.sortBy) {
        let aValue: any, bValue: any
        
        switch (filters.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case 'price':
            aValue = parseFloat(a.price)
            bValue = parseFloat(b.price)
            break
          case 'createdAt':
          case 'updatedAt':
          default:
            // Default: alphabetical within same stock status
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
        }
        
        if (filters.sortOrder === 'desc' && filters.sortBy !== 'name') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
        }
      } else {
        // Default: alphabetical within same stock status
        return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [])

  // Quick search across all products
  const searchProducts = useCallback((query: string): Product[] => {
    if (!query.trim()) return []
    return filterProducts(state.allProducts, { search: query })
  }, [state.allProducts, filterProducts])

  // Quick category accessors for instant navigation
  const getProductsByCategory = useCallback((categoryName: string): Product[] => {
    // Check pre-filtered categories first for instant access
    switch (categoryName) {
      case 'Wicket Keeping Gloves':
      case 'wicket-keeping-gloves':
        return state.wicketKeepingGloves
      case 'Wicket Keeping Pads':
      case 'wicket-keeping-pads':
        return state.wicketKeepingPads
      default:
        return filterProducts(state.allProducts, { category: categoryName })
    }
  }, [state.wicketKeepingGloves, state.wicketKeepingPads, state.allProducts, filterProducts])

  const getWicketKeepingGloves = (): Product[] => state.wicketKeepingGloves
  const getWicketKeepingPads = (): Product[] => state.wicketKeepingPads

  // Refresh products (useful for periodic updates)
  const refreshProducts = useCallback(async (): Promise<void> => {
    await loadCricketProducts()
  }, [loadCricketProducts])

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Auto-load cricket products on mount - ONLY ONCE
  useEffect(() => {
    if (!state.isInitialized && !state.isLoading) {
      loadCricketProducts()
    }
  }, [state.isInitialized, state.isLoading, loadCricketProducts])

  // Refresh products every 10 minutes - ONLY SET UP ONCE
  useEffect(() => {
    if (!state.isInitialized) return
    
    const interval = setInterval(() => {
      // Only refresh if data is older than 10 minutes
      if (Date.now() - state.lastUpdated > 10 * 60 * 1000) {
        loadCricketProducts()
      }
    }, 10 * 60 * 1000) // 10 minutes
    
    return () => clearInterval(interval)
  }, [state.isInitialized]) // Remove state.lastUpdated to prevent constant recreation

  const contextValue: ProductsContextType = useMemo(() => ({
    state,
    loadCricketProducts,
    filterProducts,
    searchProducts,
    getProductsByCategory,
    getWicketKeepingGloves,
    getWicketKeepingPads,
    refreshProducts,
    clearError,
  }), [
    state,
    loadCricketProducts,
    filterProducts,
    searchProducts,
    getProductsByCategory,
    refreshProducts,
    clearError
  ])

  return (
    <ProductsContext.Provider value={contextValue}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProductsContext(): ProductsContextType {
  const context = useContext(ProductsContext)
  if (context === undefined) {
    throw new Error('useProductsContext must be used within a ProductsProvider')
  }
  return context
}

// Hook for instant cricket category access
export function useCricketCategories() {
  const { state, getWicketKeepingGloves, getWicketKeepingPads, getProductsByCategory } = useProductsContext()
  
  return {
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    error: state.error,
    
    // Instant access methods
    wicketKeepingGloves: getWicketKeepingGloves(),
    wicketKeepingPads: getWicketKeepingPads(),
    
    // Dynamic category access
    getCategory: getProductsByCategory,
    
    // Counts for UI
    counts: {
      wicketKeepingGloves: state.wicketKeepingGloves.length,
      wicketKeepingPads: state.wicketKeepingPads.length,
      totalCricket: state.cricketProducts.length,
    }
  }
}