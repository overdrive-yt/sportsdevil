import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { apiClient } from '@/lib/api-client'

interface ProductFilters {
  search?: string
  category?: string
  categories?: string
  ageCategory?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  new?: boolean
  inStock?: boolean
  sort?: string
}

export function useProducts(filters: ProductFilters & { page?: number; limit?: number } = {}) {
  console.log('🪝 useProducts: Hook called with filters:', filters)
  
  // Create a truly stable query key using JSON serialization for complex objects
  const stableKey = useMemo(() => {
    const keyObject = {
      ...(filters.search && { search: filters.search }),
      ...(filters.category && { category: filters.category }),
      ...(filters.categories && { categories: filters.categories }),
      ...(filters.ageCategory && { ageCategory: filters.ageCategory }),
      ...(filters.minPrice !== undefined && { minPrice: filters.minPrice }),
      ...(filters.maxPrice !== undefined && { maxPrice: filters.maxPrice }),
      ...(filters.featured !== undefined && { featured: filters.featured }),
      ...(filters.new !== undefined && { new: filters.new }),
      ...(filters.inStock !== undefined && { inStock: filters.inStock }),
      ...(filters.sort && { sort: filters.sort }),
      ...(filters.page && { page: filters.page }),
      ...(filters.limit && { limit: filters.limit }),
    }
    
    return ['products', JSON.stringify(keyObject)]
  }, [
    filters.search,
    filters.category,
    filters.categories,
    filters.ageCategory,
    filters.minPrice,
    filters.maxPrice,
    filters.featured,
    filters.new,
    filters.inStock,
    filters.sort,
    filters.page,
    filters.limit
  ])
  
  return useQuery({
    queryKey: stableKey,
    queryFn: () => {
      console.log('🌐 useProducts: Making API call with filters:', filters)
      return apiClient.getProducts(filters)
    },
    staleTime: 5 * 60 * 1000, // Increased to 5 minutes to reduce requests
    gcTime: 10 * 60 * 1000, // Increased to 10 minutes 
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on mount if data exists
    refetchOnReconnect: false, // Prevent refetch on network reconnect
    retry: 1, // Reduce retry attempts
  })
}

export function useInfiniteProducts(filters: ProductFilters & { limit?: number } = {}) {
  return useInfiniteQuery({
    queryKey: ['products-infinite', filters],
    queryFn: ({ pageParam = 1 }) => 
      apiClient.getProducts({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.hasNext) {
        return lastPage.pagination.page + 1
      }
      return undefined
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => apiClient.getProduct(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}


export function useNewProducts(limit?: number) {
  return useQuery({
    queryKey: ['products', 'new', limit],
    queryFn: () => apiClient.getNewProducts(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useProductSearch(
  query: string,
  filters: {
    page?: number
    limit?: number
    category?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
    sort?: string
  } = {}
) {
  return useQuery({
    queryKey: ['products', 'search', query, filters],
    queryFn: () => apiClient.searchProducts(query, filters),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}