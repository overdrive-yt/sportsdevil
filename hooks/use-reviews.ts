import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'
import { toast } from '../components/ui/use-toast'

interface ReviewFilters {
  productId: string
  page?: number
  limit?: number
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'
  rating?: number
}

interface CreateReviewData {
  productId: string
  userId: string
  rating: number
  title: string
  content: string
  images?: string[]
}

// Get reviews for a product
export function useReviews(filters: ReviewFilters) {
  return useQuery({
    queryKey: ['reviews', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        productId: filters.productId,
        page: (filters.page || 1).toString(),
        limit: (filters.limit || 10).toString(),
        sort: filters.sort || 'newest',
      })

      if (filters.rating) {
        params.append('rating', filters.rating.toString())
      }

      const response = await fetch(`/api/reviews?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }

      return response.json()
    },
    enabled: !!filters.productId,
  })
}

// Create a new review
export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateReviewData) => {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create review')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Review submitted!',
        description: 'Thank you for your review. It will be visible shortly.',
      })

      // Invalidate reviews queries for this product
      queryClient.invalidateQueries({
        queryKey: ['reviews', { productId: variables.productId }]
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to submit review',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Update review helpfulness
export function useUpdateReviewHelpfulness() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ reviewId, helpful }: { reviewId: string; helpful: boolean }) => {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ helpful }),
      })

      if (!response.ok) {
        throw new Error('Failed to update review helpfulness')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate all reviews queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ['reviews']
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Action failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}