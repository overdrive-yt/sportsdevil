import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export function useCategories(includeInactive = false, hierarchy = false) {
  return useQuery({
    queryKey: ['categories', { includeInactive, hierarchy }],
    queryFn: () => apiClient.getCategories(includeInactive, hierarchy),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function useCategory(slug: string, includeProducts = false) {
  return useQuery({
    queryKey: ['category', slug, { includeProducts }],
    queryFn: () => apiClient.getCategory(slug, includeProducts),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useCategoryHierarchy() {
  return useQuery({
    queryKey: ['categories', 'hierarchy'],
    queryFn: () => apiClient.getCategories(false, true),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}