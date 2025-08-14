'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Activity,
  CheckCircle,
  XCircle,
  RefreshCw,
  Package,
  ShoppingCart,
  AlertTriangle,
  Clock
} from 'lucide-react'

interface ActivityFeedProps {
  activities?: any[]
}

// V9.11.5: Integration Activity Feed Component
export default function ActivityFeed({ activities = [] }: ActivityFeedProps) {
  
  // Mock activity data for initial implementation
  const mockActivities = [
    {
      id: '1',
      type: 'SYNC_STARTED',
      platform: 'TIKTOK_SHOP',
      message: 'Product sync started for TikTok Shop',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      status: 'IN_PROGRESS'
    },
    {
      id: '2',
      type: 'CONFIG_UPDATED',
      platform: 'EBAY',
      message: 'eBay integration configuration updated',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      status: 'SUCCESS'
    },
    {
      id: '3',
      type: 'SYNC_FAILED',
      platform: 'XEPOS',
      message: 'Inventory sync failed - API endpoint not configured',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'FAILED'
    }
  ]

  const displayActivities = activities.length > 0 ? activities : mockActivities

  const getActivityIcon = (type: string, status: string) => {
    if (status === 'IN_PROGRESS') {
      return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
    }
    
    switch (type) {
      case 'SYNC_STARTED':
      case 'SYNC_COMPLETED':
        return status === 'SUCCESS' ? 
          <CheckCircle className="h-4 w-4 text-green-600" /> :
          <XCircle className="h-4 w-4 text-red-600" />
      case 'PRODUCT_SYNC':
        return <Package className="h-4 w-4 text-blue-600" />
      case 'ORDER_SYNC':
        return <ShoppingCart className="h-4 w-4 text-purple-600" />
      case 'CONFIG_UPDATED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'SYNC_FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>
      case 'FAILED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getPlatformEmoji = (platform: string) => {
    switch (platform) {
      case 'TIKTOK_SHOP':
        return '🎵'
      case 'XEPOS':
        return '🏪'
      case 'EBAY':
        return '🛒'
      default:
        return '🌐'
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-green-600" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length > 0 ? (
          <div className="space-y-4">
            {displayActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type, activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getPlatformEmoji(activity.platform)}</span>
                      <span className="text-sm font-medium">{activity.platform.replace('_', ' ')}</span>
                      {getStatusBadge(activity.status)}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.message}</p>
                </div>
              </div>
            ))}
            
            {/* Load More */}
            <div className="text-center pt-4 border-t">
              <button className="text-sm text-primary hover:underline">
                View all activity
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No activity yet</p>
            <p className="text-xs">Activity will appear here once integrations are active</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}