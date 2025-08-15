'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  RefreshCw,
  Settings,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Package,
  ShoppingCart,
  BarChart3,
  ExternalLink,
  Zap
} from 'lucide-react'

interface PlatformCardProps {
  integration: any
  onRefresh: () => void
  detailed?: boolean
}

// V9.11.5: Platform Status Card Component
export default function PlatformCard({ integration, onRefresh, detailed = false }: PlatformCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getPlatformIcon = (platform: string) => {
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

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'TIKTOK_SHOP':
        return 'bg-black text-white'
      case 'XEPOS':
        return 'bg-blue-600 text-white'
      case 'EBAY':
        return 'bg-yellow-500 text-black'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200'
    }
  }

  const handleSync = async () => {
    setIsLoading(true)
    // Mock sync process
    setTimeout(() => {
      setIsLoading(false)
      onRefresh()
    }, 2000)
  }

  const handleToggle = async () => {
    setIsLoading(true)
    // Mock toggle process
    setTimeout(() => {
      setIsLoading(false)
      onRefresh()
    }, 1000)
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${integration.isActive ? 'border-primary/50' : 'border-gray-200'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getPlatformColor(integration.platform)}`}>
              <span className="text-lg">{getPlatformIcon(integration.platform)}</span>
            </div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {integration.platform.replace('_', ' ')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {integration.isActive && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
            <Badge className={getStatusColor(integration.status)}>
              {getStatusIcon(integration.status)}
              <span className="ml-1">{integration.status || 'PENDING'}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 border rounded-lg bg-blue-50">
              <Package className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-semibold">{integration.totalProducts}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </div>
            <div className="text-center p-3 border rounded-lg bg-green-50">
              <ShoppingCart className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-semibold">{integration.totalOrders}</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </div>
          </div>

          {/* Last Sync Info */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Last Sync:</span>
            </div>
            <span className="text-sm font-medium">
              {integration.lastSync ? new Date(integration.lastSync).toLocaleDateString() : 'Never'}
            </span>
          </div>

          {detailed && (
            <>
              {/* Configuration Status */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Configuration</h4>
                <div className="grid grid-cols-1 gap-2">
                  {integration.platform === 'TIKTOK_SHOP' && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span>Shop ID:</span>
                        <Badge variant={integration.config?.shopId ? 'outline' : 'secondary'}>
                          {integration.config?.shopId ? 'Configured' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>API Key:</span>
                        <Badge variant={integration.config?.apiKey ? 'outline' : 'secondary'}>
                          {integration.config?.apiKey ? 'Configured' : 'Pending'}
                        </Badge>
                      </div>
                    </>
                  )}
                  {integration.platform === 'XEPOS' && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span>Store ID:</span>
                        <Badge variant={integration.config?.storeId ? 'outline' : 'secondary'}>
                          {integration.config?.storeId ? 'Configured' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>API Endpoint:</span>
                        <Badge variant={integration.config?.apiEndpoint ? 'outline' : 'secondary'}>
                          {integration.config?.apiEndpoint ? 'Configured' : 'Pending'}
                        </Badge>
                      </div>
                    </>
                  )}
                  {integration.platform === 'EBAY' && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span>Seller ID:</span>
                        <Badge variant={integration.config?.sellerId ? 'outline' : 'secondary'}>
                          {integration.config?.sellerId ? 'Configured' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Environment:</span>
                        <Badge variant={integration.config?.sandboxMode ? 'secondary' : 'outline'}>
                          {integration.config?.sandboxMode ? 'Sandbox' : 'Production'}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between space-x-2">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSync}
                disabled={isLoading || !integration.isActive}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggle}
                disabled={isLoading}
              >
                {integration.isActive ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="ghost">
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Setup CTA for unconfigured platforms */}
          {!integration.isActive && (
            <div className="p-3 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5 text-center">
              <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-primary mb-1">Ready to Connect?</p>
              <p className="text-xs text-muted-foreground mb-3">
                Set up your {integration.platform.replace('_', ' ')} integration to start syncing
              </p>
              <Button size="sm" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Configure Now
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}