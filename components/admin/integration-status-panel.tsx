// V9.16: Integration Status Monitoring Panel
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  ExternalLink,
  Wifi,
  WifiOff,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react'
import { EnhancedCard } from '@/components/ui/enhanced-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface IntegrationStatus {
  id: string
  name: string
  platform: string
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  lastSync: Date
  syncSuccess: boolean
  productsSynced: number
  ordersSynced: number
  errorCount: number
  uptime: number
  responseTime: number
}

interface IntegrationStatusPanelProps {
  className?: string
}

export function IntegrationStatusPanel({ className }: IntegrationStatusPanelProps) {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchIntegrationStatus = async () => {
    try {
      // Simulate API call - in production this would fetch from /api/integrations/status
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockIntegrations: IntegrationStatus[] = [
        {
          id: 'tiktok-shop',
          name: 'TikTok Shop',
          platform: 'TikTok',
          status: 'connected',
          lastSync: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
          syncSuccess: true,
          productsSynced: 156,
          ordersSynced: 23,
          errorCount: 0,
          uptime: 99.8,
          responseTime: 245
        },
        {
          id: 'ebay',
          name: 'eBay Marketplace',
          platform: 'eBay',
          status: 'connected',
          lastSync: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
          syncSuccess: true,
          productsSynced: 134,
          ordersSynced: 18,
          errorCount: 2,
          uptime: 98.9,
          responseTime: 180
        },
        {
          id: 'xepos',
          name: 'Xepos POS',
          platform: 'Xepos',
          status: 'syncing',
          lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
          syncSuccess: true,
          productsSynced: 89,
          ordersSynced: 45,
          errorCount: 1,
          uptime: 97.5,
          responseTime: 320
        },
        {
          id: 'stripe',
          name: 'Stripe Payments',
          platform: 'Stripe',
          status: 'connected',
          lastSync: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
          syncSuccess: true,
          productsSynced: 0,
          ordersSynced: 67,
          errorCount: 0,
          uptime: 99.9,
          responseTime: 95
        }
      ]
      
      setIntegrations(mockIntegrations)
    } catch (error) {
      console.error('Failed to fetch integration status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchIntegrationStatus()
    
    // Update status every 2 minutes
    const interval = setInterval(fetchIntegrationStatus, 120000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchIntegrationStatus()
    setIsRefreshing(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-gray-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'syncing':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'disconnected':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const overallHealth = integrations.filter(i => i.status === 'connected').length / integrations.length * 100

  if (isLoading) {
    return (
      <EnhancedCard className={`p-6 bg-white border-gray-200 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
              <div className="h-5 bg-gray-200 rounded w-40"></div>
            </div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </EnhancedCard>
    )
  }

  return (
    <EnhancedCard className={`p-6 bg-white border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Integration Status</h3>
            <p className="text-sm text-gray-600">External platform connections</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            className={`px-3 py-1 ${
              overallHealth > 80 ? 'bg-green-100 text-green-800' :
              overallHealth > 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}
          >
            {Math.round(overallHealth)}% Healthy
          </Badge>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
            variant="ghost"
            className="p-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {integrations.filter(i => i.status === 'connected').length}
          </p>
          <p className="text-xs text-gray-600">Connected</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {integrations.reduce((sum, i) => sum + i.productsSynced, 0)}
          </p>
          <p className="text-xs text-gray-600">Products Synced</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {integrations.reduce((sum, i) => sum + i.ordersSynced, 0)}
          </p>
          <p className="text-xs text-gray-600">Orders Synced</p>
        </div>
      </div>

      {/* Integration List */}
      <div className="space-y-3">
        {integrations.map((integration, index) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0">
                  {getStatusIcon(integration.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {integration.name}
                    </h4>
                    <Badge 
                      className={`text-xs ${getStatusColor(integration.status)}`}
                      variant="secondary"
                    >
                      {integration.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>Last sync: {getRelativeTime(integration.lastSync)}</span>
                    <span>Uptime: {integration.uptime}%</span>
                    <span>Response: {integration.responseTime}ms</span>
                    {integration.errorCount > 0 && (
                      <span className="text-red-600">
                        {integration.errorCount} error{integration.errorCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="text-right text-xs">
                  <div className="text-gray-900 font-medium">
                    {integration.productsSynced} products
                  </div>
                  <div className="text-gray-600">
                    {integration.ordersSynced} orders
                  </div>
                </div>
                <Button
                  onClick={() => window.open('/admin/integrations', '_blank')}
                  size="sm"
                  variant="ghost"
                  className="p-2"
                  title="Manage Integration"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Health Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Health Score</span>
                <span>{integration.uptime}%</span>
              </div>
              <Progress 
                value={integration.uptime} 
                className={`h-2 ${
                  integration.uptime > 95 ? '[&>div]:bg-green-500' :
                  integration.uptime > 85 ? '[&>div]:bg-yellow-500' :
                  '[&>div]:bg-red-500'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Button
            onClick={() => window.open('/admin/integrations', '_blank')}
            size="sm"
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Settings className="h-4 w-4" />
            Manage All
          </Button>
          <Button
            onClick={() => window.open('/admin/integrations?tab=sync', '_blank')}
            size="sm"
            variant="outline"
            className="flex-1 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Sync Now
          </Button>
        </div>
      </div>
    </EnhancedCard>
  )
}