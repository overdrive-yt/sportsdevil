'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Globe,
  Plus,
  RefreshCw,
  Settings,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Activity,
  Shield,
  Zap,
  TrendingUp,
  Package,
  ShoppingCart,
  Users
} from 'lucide-react'
import PlatformCard from './platform-card'
import SyncStatusPanel from './sync-status-panel'
import ActivityFeed from './activity-feed'
import IntegrationSetup from './integration-setup'

// V9.11.5: Revolutionary External Platform Integrations Dashboard
export default function IntegrationsDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [integrations, setIntegrations] = useState<any[]>([])
  const [syncStatus, setSyncStatus] = useState<any>(null)

  // Load integration data
  useEffect(() => {
    loadIntegrationData()
  }, [])

  const loadIntegrationData = async () => {
    setIsLoading(true)
    
    // Mock data for V9.11.5 initial implementation
    // In production, this will fetch from /api/admin/integrations
    const mockIntegrations = [
      {
        id: 'tiktok-shop-1',
        platform: 'TIKTOK_SHOP',
        name: 'TikTok Shop UK',
        isActive: false,
        status: 'PENDING',
        lastSync: null,
        totalProducts: 0,
        totalOrders: 0,
        config: {
          shopId: null,
          apiKey: null
        }
      },
      {
        id: 'xepos-1',
        platform: 'XEPOS',
        name: 'Xepos POS System',
        isActive: false,
        status: 'PENDING',
        lastSync: null,
        totalProducts: 0,
        totalOrders: 0,
        config: {
          storeId: null,
          apiEndpoint: null
        }
      },
      {
        id: 'ebay-1',
        platform: 'EBAY',
        name: 'eBay Marketplace',
        isActive: false,
        status: 'PENDING',
        lastSync: null,
        totalProducts: 0,
        totalOrders: 0,
        config: {
          sellerId: null,
          sandboxMode: true
        }
      }
    ]

    const mockSyncStatus = {
      lastFullSync: null,
      totalSynced: 0,
      conflicts: 0,
      pendingOrders: 0,
      activePlatforms: 0,
      totalPlatforms: 3
    }

    setTimeout(() => {
      setIntegrations(mockIntegrations)
      setSyncStatus(mockSyncStatus)
      setIsLoading(false)
    }, 1000)
  }

  const handleRefreshAll = async () => {
    await loadIntegrationData()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-600" />
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading integrations dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">External Platform Integrations</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              V9.11.5
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Revolutionary multi-channel cricket equipment sales platform with TikTok Shop, Xepos, and eBay integrations.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleRefreshAll} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="platforms" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Platforms</span>
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Sync Status</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Platform Cards Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <PlatformCard 
                key={integration.id} 
                integration={integration}
                onRefresh={loadIntegrationData}
              />
            ))}
          </div>

          {/* Sync Status Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Sync Status Overview</span>
                </CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {syncStatus?.activePlatforms || 0} / {syncStatus?.totalPlatforms || 0} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 border rounded-lg bg-gray-50">
                  <Clock className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Last Full Sync</p>
                  <p className="font-semibold">
                    {syncStatus?.lastFullSync ? new Date(syncStatus.lastFullSync).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Products Synced</p>
                  <p className="font-semibold">{syncStatus?.totalSynced || 0}</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-orange-50">
                  <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Conflicts</p>
                  <p className="font-semibold">{syncStatus?.conflicts || 0}</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-blue-50">
                  <ShoppingCart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Pending Orders</p>
                  <p className="font-semibold">{syncStatus?.pendingOrders || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span>Platform Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(integration.status)}
                        <div>
                          <p className="font-medium">{integration.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {integration.platform.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status || 'PENDING'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No activity yet</p>
                    <p className="text-xs">Activity will appear here once integrations are configured</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          {/* Platform Management */}
          <div className="grid grid-cols-1 gap-6">
            {integrations.map((integration) => (
              <PlatformCard 
                key={integration.id} 
                integration={integration}
                onRefresh={loadIntegrationData}
                detailed={true}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <SyncStatusPanel syncStatus={syncStatus} integrations={integrations} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <IntegrationSetup onUpdate={loadIntegrationData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}