import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'

export function useGlobalSearch(
  query: string,
  type: 'all' | 'products' | 'categories' = 'all',
  limit?: number
) {
  return useQuery({
    queryKey: ['search', 'global', query, type, limit],
    queryFn: () => apiClient.globalSearch(query, type, limit),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useSearchSuggestions(query: string, limit?: number) {
  return useQuery({
    queryKey: ['search', 'suggestions', query, limit],
    queryFn: () => apiClient.getSearchSuggestions(query, limit),
    enabled: !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useFilters(categoryId?: string) {
  return useQuery({
    queryKey: ['filters', categoryId],
    queryFn: () => apiClient.getFilters(categoryId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}