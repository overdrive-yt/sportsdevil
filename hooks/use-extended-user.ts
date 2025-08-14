'use client'

import { useQuery } from '@tanstack/react-query'
import { useCurrentUser } from '@/hooks/use-auth-store'

interface ExtendedUserProfile {
  user: {
    id: string
    name: string | null
    email: string
    phone: string | null
    address: string | null
    city: string | null
    postalCode: string | null
    country: string | null
    createdAt: string
    updatedAt: string
  }
  loyalty: {
    loyaltyPoints: number
    totalSpent: number
    pointsValue: number
    canRedeem: boolean
    nextRewardAt: number
    redeemableAmount: number
  }
  orders: {
    recent: Array<{
      id: string
      date: string
      status: string
      total: number
      items: Array<{
        name: string
        quantity: number
        price: number
      }>
    }>
    totalCount: number
    totalValue: number
  }
  stats: {
    totalOrders: number
    totalSpent: number
    loyaltyPoints: number
    memberSince: string
    accountUpdated: boolean
  }
}

export function useExtendedUserProfile() {
  const { user, isAuthenticated, isLoading: authLoading } = useCurrentUser()
  
  return useQuery<ExtendedUserProfile>({
    queryKey: ['user', 'extended-profile'],
    queryFn: async () => {
      const response = await fetch('/api/user/profile/extended')
      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }
      return response.json()
    },
    enabled: isAuthenticated && !!user && !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })
}

export function useUserOrders(page = 1, limit = 10) {
  const { user, isAuthenticated, isLoading: authLoading } = useCurrentUser()
  
  return useQuery({
    queryKey: ['user', 'orders', page, limit],
    queryFn: async () => {
      const response = await fetch(`/api/user/orders?page=${page}&limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user orders')
      }
      return response.json()
    },
    enabled: isAuthenticated && !!user && !authLoading,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook for dashboard-specific data
export function useDashboardData() {
  const extendedProfile = useExtendedUserProfile()
  const { user, isAuthenticated, isLoading: authLoading } = useCurrentUser()
  
  return {
    user: extendedProfile.data?.user,
    loyalty: extendedProfile.data?.loyalty,
    orders: extendedProfile.data?.orders,
    stats: extendedProfile.data?.stats,
    isLoading: extendedProfile.isLoading || authLoading,
    error: extendedProfile.error,
    isAuthenticated,
    refetch: extendedProfile.refetch
  }
}