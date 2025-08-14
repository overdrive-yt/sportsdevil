import { useQuery } from '@tanstack/react-query'

interface Product {
  id: string
  name: string
  slug: string
  price: string
  originalPrice?: string
  shortDescription?: string
  isFeatured: boolean
  isNew: boolean
  stockQuantity: number
  category: {
    id: string
    name: string
    slug: string
  }
  images: {
    id: string
    url: string
    alt: string
  }[]
  reviewCount: number
  recommendationScore: number
}

interface RecommendationsResponse {
  success: boolean
  data: Product[]
  meta: {
    currentProductId: string
    algorithm: string
    totalFound: number
  }
}

// Get related products based on category and price similarity
export function useRelatedProducts(productId: string, limit = 5) {
  return useQuery<RecommendationsResponse>({
    queryKey: ['recommendations', 'related', productId, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        productId,
        limit: limit.toString(),
      })

      const response = await fetch(`/api/recommendations/related?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch related products')
      }

      return response.json()
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Get category-based recommendations
export function useCategoryRecommendations(categoryId: string, excludeProductId?: string, limit = 8) {
  return useQuery<RecommendationsResponse>({
    queryKey: ['recommendations', 'category', categoryId, excludeProductId, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        categoryId,
        limit: limit.toString(),
      })

      if (excludeProductId) {
        params.append('excludeProductId', excludeProductId)
      }

      const response = await fetch(`/api/recommendations/category?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch category recommendations')
      }

      return response.json()
    },
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

// Get trending/popular products
export function useTrendingProducts(limit = 6) {
  return useQuery<RecommendationsResponse>({
    queryKey: ['recommendations', 'trending', limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
      })

      const response = await fetch(`/api/recommendations/trending?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending products')
      }

      return response.json()
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}