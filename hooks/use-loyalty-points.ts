'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from './use-toast'
import { authenticatedFetch, handleAuthResponse } from '../lib/client-auth'

interface LoyaltyBalance {
  loyaltyPoints: number
  totalSpent: number
  pointsValue: number
  canRedeem: boolean
  nextRewardAt: number
  redeemableAmount: number
}

interface LoyaltyTransaction {
  id: string
  type: 'EARNED' | 'REDEEMED'
  points: number
  description: string
  createdAt: string
  order?: {
    id: string
    orderNumber: string
    totalAmount: number
  }
}

interface RedeemResponse {
  success: boolean
  message: string
  voucher: {
    code: string
    value: number
    validUntil: string
    minimumAmount: number
  }
  newBalance: number
  transactionId: string
}

export function useLoyaltyBalance() {
  return useQuery<LoyaltyBalance>({
    queryKey: ['loyalty', 'balance'],
    queryFn: async () => {
      const response = await authenticatedFetch('/api/loyalty/balance')
      if (!response.ok) {
        await handleAuthResponse(response)
        throw new Error('Failed to fetch loyalty balance')
      }
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  })
}

export function useLoyaltyTransactions(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['loyalty', 'transactions', limit, offset],
    queryFn: async () => {
      const response = await authenticatedFetch(`/api/loyalty/transactions?limit=${limit}&offset=${offset}`)
      if (!response.ok) {
        await handleAuthResponse(response)
        throw new Error('Failed to fetch loyalty transactions')
      }
      return response.json()
    },
  })
}

export function useRedeemPoints() {
  const queryClient = useQueryClient()
  
  return useMutation<RedeemResponse, Error, { pointsToRedeem: number }>({
    mutationFn: async ({ pointsToRedeem }) => {
      const response = await authenticatedFetch('/api/loyalty/redeem', {
        method: 'POST',
        body: JSON.stringify({ pointsToRedeem }),
      })
      
      if (!response.ok) {
        await handleAuthResponse(response)
        const error = await response.json()
        throw new Error(error.error || 'Failed to redeem points')
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      // Invalidate and refetch loyalty data and user profile
      queryClient.invalidateQueries({ queryKey: ['loyalty'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'extended-profile'] })
      
      toast({
        title: 'Points Redeemed Successfully!',
        description: `Your voucher code is: ${data.voucher.code}. Valid until ${new Date(data.voucher.validUntil).toLocaleDateString()}`
      })
    },
    onError: (error) => {
      toast({
        title: 'Redemption Failed',
        description: error.message,
        variant: 'destructive'
      })
    }
  })
}

export function useLoyaltyRedemption() {
  const [selectedPoints, setSelectedPoints] = useState<number>(500)
  const [showRedemptionDialog, setShowRedemptionDialog] = useState(false)
  const redeemMutation = useRedeemPoints()

  const redeemableOptions = [500, 1000, 1500, 2000, 2500, 3000, 4000, 5000]

  const handleRedeem = async () => {
    if (selectedPoints < 500 || selectedPoints % 500 !== 0) {
      toast({
        title: 'Invalid Points Amount',
        description: 'Please select a valid points amount (minimum 500 points)',
        variant: 'destructive'
      })
      return
    }

    try {
      await redeemMutation.mutateAsync({ pointsToRedeem: selectedPoints })
      setShowRedemptionDialog(false)
      setSelectedPoints(500)
    } catch (error) {
      // Error handling is done in the mutation
    }
  }

  return {
    selectedPoints,
    setSelectedPoints,
    showRedemptionDialog,
    setShowRedemptionDialog,
    redeemableOptions,
    handleRedeem,
    isRedeeming: redeemMutation.isPending
  }
}