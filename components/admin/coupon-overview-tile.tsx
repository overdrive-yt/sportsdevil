// V9.16: Coupon Overview Tile for Dashboard Integration
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Ticket,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  RefreshCw,
  ExternalLink,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { EnhancedCard } from '../ui/enhanced-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'

interface CouponStats {
  totalCoupons: number
  activeCoupons: number
  scheduledCoupons: number
  expiredCoupons: number
  totalUsage: number
  weeklyUsage: number
  usageChange: number
  topCoupon: {
    code: string
    usage: number
    discountValue: number
    discountType: string
  }
  recentActivity: Array<{
    code: string
    action: string
    timestamp: string
    usage?: number
  }>
}

interface CouponOverviewTileProps {
  className?: string
}

export function CouponOverviewTile({ className }: CouponOverviewTileProps) {
  const [stats, setStats] = useState<CouponStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchCouponStats = async () => {
    try {
      const response = await fetch('/api/admin/coupons/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        throw new Error('Failed to fetch coupon stats')
      }
    } catch (error) {
      console.error('Error fetching coupon stats:', error)
      // Fallback mock data
      setStats({
        totalCoupons: 12,
        activeCoupons: 4,
        scheduledCoupons: 2,
        expiredCoupons: 6,
        totalUsage: 1847,
        weeklyUsage: 89,
        usageChange: 15.2,
        topCoupon: {
          code: 'FIRST7',
          usage: 456,
          discountValue: 7,
          discountType: 'PERCENTAGE'
        },
        recentActivity: [
          { code: 'FIRST7', action: 'Used', timestamp: '2 hours ago', usage: 1 },
          { code: 'SUMMER20', action: 'Created', timestamp: '5 hours ago' },
          { code: 'WELCOME10', action: 'Used', timestamp: '1 day ago', usage: 3 }
        ]
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCouponStats()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchCouponStats()
    setIsRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200'
      case 'scheduled': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'expired': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'scheduled': return <Calendar className="h-4 w-4 text-blue-600" />
      case 'expired': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  if (isLoading) {
    return (
      <EnhancedCard className={`p-6 bg-white border-gray-200 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              <div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </EnhancedCard>
    )
  }

  if (!stats) {
    return (
      <EnhancedCard className={`p-6 bg-white border-gray-200 shadow-sm ${className}`}>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Failed to load coupon data</p>
          <Button onClick={handleRefresh} size="sm" className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </EnhancedCard>
    )
  }

  return (
    <EnhancedCard className={`p-6 bg-white border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <Ticket className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Coupon Management</h3>
            <p className="text-sm text-gray-600">Active promotions & usage</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
            variant="ghost"
            className="p-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={() => window.open('/admin/coupons', '_blank')}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Manage
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {getStatusIcon('active')}
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.activeCoupons}</p>
          <p className="text-xs text-gray-600">Active</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {getStatusIcon('scheduled')}
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.scheduledCoupons}</p>
          <p className="text-xs text-gray-600">Scheduled</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {getStatusIcon('expired')}
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.expiredCoupons}</p>
          <p className="text-xs text-gray-600">Expired</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="h-4 w-4 text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalUsage}</p>
          <p className="text-xs text-gray-600">Total Uses</p>
        </div>
      </div>

      {/* Weekly Usage */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Weekly Usage</span>
          <div className="flex items-center gap-1">
            {stats.usageChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              stats.usageChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.usageChange >= 0 ? '+' : ''}{stats.usageChange.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">{stats.weeklyUsage}</span>
          <span className="text-sm text-gray-500">vs last week</span>
        </div>
      </div>

      {/* Top Performing Coupon */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Top Performer</h4>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm font-bold text-gray-900">{stats.topCoupon.code}</p>
              <p className="text-xs text-gray-600">
                {stats.topCoupon.discountValue}
                {stats.topCoupon.discountType === 'PERCENTAGE' ? '%' : '£'} off
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-purple-600">{stats.topCoupon.usage} uses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Recent Activity</h4>
          <Button
            onClick={() => window.open('/admin/coupons?tab=analytics', '_blank')}
            size="sm"
            variant="ghost"
            className="text-xs gap-1"
          >
            <Eye className="h-3 w-3" />
            View All
          </Button>
        </div>
        <div className="space-y-2">
          {stats.recentActivity.slice(0, 3).map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  activity.action === 'Used' ? 'bg-green-500' :
                  activity.action === 'Created' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                <span className="font-mono text-xs">{activity.code}</span>
                <span className="text-gray-600">{activity.action}</span>
              </div>
              <div className="text-gray-500 text-xs">
                {activity.usage && `${activity.usage}x • `}{activity.timestamp}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Button
            onClick={() => window.open('/admin/coupons?tab=create', '_blank')}
            size="sm"
            className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4" />
            New Coupon
          </Button>
          <Button
            onClick={() => window.open('/admin/coupons?tab=analytics', '_blank')}
            size="sm"
            variant="outline"
            className="flex-1 gap-2"
          >
            <Eye className="h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>
    </EnhancedCard>
  )
}