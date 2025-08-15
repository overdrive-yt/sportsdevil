// V9.13.2: Enhanced Integration Management Panel
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Settings,
  TrendingUp,
  Activity,
  Wifi,
  WifiOff,
  Play,
  Pause,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Download
} from 'lucide-react'
import { EnhancedCard } from '../ui/enhanced-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Switch } from '../ui/switch'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

interface Integration {
  id: string
  name: string
  platform: 'TikTok Shop' | 'Xepos' | 'eBay' | 'Instagram' | 'Facebook' | 'Google'
  status: 'active' | 'inactive' | 'error' | 'syncing'
  isEnabled: boolean
  lastSync: string
  nextSync: string
  syncFrequency: 'real-time' | '15min' | '1hour' | '6hour' | '24hour'
  health: 'excellent' | 'good' | 'fair' | 'poor'
  metrics: {
    syncSuccess: number
    dataPoints: number
    errorRate: number
    avgResponseTime: number
  }
  recentActivity: {
    type: 'sync' | 'error' | 'config' | 'auth'
    message: string
    timestamp: string
  }[]
}

export function EnhancedIntegrationsPanel() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const mockIntegrations: Integration[] = [
      {
        id: 'tiktok-shop',
        name: 'TikTok Shop',
        platform: 'TikTok Shop',
        status: 'active',
        isEnabled: true,
        lastSync: '2 minutes ago',
        nextSync: 'in 13 minutes',
        syncFrequency: '15min',
        health: 'excellent',
        metrics: {
          syncSuccess: 98.5,
          dataPoints: 1234,
          errorRate: 1.5,
          avgResponseTime: 245
        },
        recentActivity: [
          { type: 'sync', message: 'Product inventory synced successfully', timestamp: '2 min ago' },
          { type: 'sync', message: 'Order #TT-2024-001 processed', timestamp: '15 min ago' },
          { type: 'config', message: 'Webhook endpoint updated', timestamp: '1 hour ago' }
        ]
      },
      {
        id: 'xepos',
        name: 'Xepos POS',
        platform: 'Xepos',
        status: 'syncing',
        isEnabled: true,
        lastSync: '5 minutes ago',
        nextSync: 'in 10 minutes',
        syncFrequency: '15min',
        health: 'good',
        metrics: {
          syncSuccess: 94.2,
          dataPoints: 856,
          errorRate: 5.8,
          avgResponseTime: 420
        },
        recentActivity: [
          { type: 'sync', message: 'Sales data sync in progress...', timestamp: '1 min ago' },
          { type: 'error', message: 'Connection timeout (resolved)', timestamp: '3 min ago' },
          { type: 'sync', message: 'Inventory levels updated', timestamp: '18 min ago' }
        ]
      },
      {
        id: 'ebay',
        name: 'eBay Marketplace',
        platform: 'eBay',
        status: 'error',
        isEnabled: true,
        lastSync: '45 minutes ago',
        nextSync: 'retry in 5 minutes',
        syncFrequency: '1hour',
        health: 'poor',
        metrics: {
          syncSuccess: 76.3,
          dataPoints: 432,
          errorRate: 23.7,
          avgResponseTime: 1240
        },
        recentActivity: [
          { type: 'error', message: 'Authentication token expired', timestamp: '45 min ago' },
          { type: 'error', message: 'Rate limit exceeded', timestamp: '1 hour ago' },
          { type: 'auth', message: 'Token refresh attempted', timestamp: '1 hour ago' }
        ]
      },
      {
        id: 'instagram',
        name: 'Instagram Business',
        platform: 'Instagram',
        status: 'active',
        isEnabled: true,
        lastSync: '8 minutes ago',
        nextSync: 'in 52 minutes',
        syncFrequency: '1hour',
        health: 'good',
        metrics: {
          syncSuccess: 92.7,
          dataPoints: 856,
          errorRate: 7.3,
          avgResponseTime: 380
        },
        recentActivity: [
          { type: 'sync', message: 'Instagram posts synced successfully', timestamp: '8 min ago' },
          { type: 'sync', message: 'Profile insights updated', timestamp: '1 hour ago' },
          { type: 'config', message: 'Webhook configuration updated', timestamp: '2 hours ago' }
        ]
      },
      {
        id: 'facebook',
        name: 'Facebook Business',
        platform: 'Facebook',
        status: 'active',
        isEnabled: true,
        lastSync: '12 minutes ago',
        nextSync: 'in 48 minutes',
        syncFrequency: '1hour',
        health: 'excellent',
        metrics: {
          syncSuccess: 96.2,
          dataPoints: 1124,
          errorRate: 3.8,
          avgResponseTime: 290
        },
        recentActivity: [
          { type: 'sync', message: 'Facebook page data synced', timestamp: '12 min ago' },
          { type: 'sync', message: 'Event information updated', timestamp: '1 hour ago' },
          { type: 'sync', message: 'Page insights synchronized', timestamp: '2 hours ago' }
        ]
      },
      {
        id: 'google',
        name: 'Google Services',
        platform: 'Google',
        status: 'syncing',
        isEnabled: true,
        lastSync: '3 minutes ago',
        nextSync: 'in 3 hours',
        syncFrequency: '6hour',
        health: 'good',
        metrics: {
          syncSuccess: 89.4,
          dataPoints: 542,
          errorRate: 10.6,
          avgResponseTime: 620
        },
        recentActivity: [
          { type: 'sync', message: 'Google My Business sync in progress...', timestamp: '1 min ago' },
          { type: 'sync', message: 'Analytics data synchronized', timestamp: '3 min ago' },
          { type: 'sync', message: 'Maps place data updated', timestamp: '6 hours ago' }
        ]
      }
    ]

    setIntegrations(mockIntegrations)

    // Simulate real-time updates
    const interval = setInterval(() => {
      setIntegrations(prev => prev.map(integration => {
        if (integration.status === 'syncing' && Math.random() > 0.7) {
          return {
            ...integration,
            status: 'active' as const,
            lastSync: 'just now',
            metrics: {
              ...integration.metrics,
              syncSuccess: Math.min(100, integration.metrics.syncSuccess + Math.random() * 2)
            }
          }
        }
        return integration
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'syncing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'inactive': return <Clock className="h-4 w-4 text-gray-400" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50'
      case 'good': return 'text-blue-600 bg-blue-50'
      case 'fair': return 'text-yellow-600 bg-yellow-50'
      case 'poor': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { 
            ...integration, 
            isEnabled: !integration.isEnabled,
            status: !integration.isEnabled ? 'active' : 'inactive'
          }
        : integration
    ))
  }

  const handleRefreshAll = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  const getActiveIntegrations = () => integrations.filter(i => i.isEnabled).length
  const getHealthyIntegrations = () => integrations.filter(i => i.health === 'excellent' || i.health === 'good').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integration Management</h2>
          <p className="text-muted-foreground">
            Monitor and manage all platform integrations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">
            {getActiveIntegrations()}/{integrations.length} Active
          </Badge>
          <Button 
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <EnhancedCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Healthy</p>
              <p className="text-2xl font-bold">{getHealthyIntegrations()}</p>
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Success Rate</p>
              <p className="text-2xl font-bold">
                {(integrations.reduce((acc, i) => acc + i.metrics.syncSuccess, 0) / integrations.length).toFixed(1)}%
              </p>
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data Points</p>
              <p className="text-2xl font-bold">
                {integrations.reduce((acc, i) => acc + i.metrics.dataPoints, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Response</p>
              <p className="text-2xl font-bold">
                {Math.round(integrations.reduce((acc, i) => acc + i.metrics.avgResponseTime, 0) / integrations.length)}ms
              </p>
            </div>
          </div>
        </EnhancedCard>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {integrations.map((integration) => (
              <EnhancedCard key={integration.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2">
                      {integration.isEnabled ? (
                        <Wifi className="h-5 w-5 text-green-600" />
                      ) : (
                        <WifiOff className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{integration.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(integration.status)}
                          <span className="text-sm text-muted-foreground capitalize">
                            {integration.status}
                          </span>
                          <Badge 
                            className={`text-xs ${getHealthColor(integration.health)}`}
                            variant="secondary"
                          >
                            {integration.health}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Last sync</p>
                      <p className="font-medium">{integration.lastSync}</p>
                    </div>
                    <Switch
                      checked={integration.isEnabled}
                      onCheckedChange={() => handleToggleIntegration(integration.id)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Settings className="h-4 w-4" />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <RefreshCw className="h-4 w-4" />
                          Force Sync
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2">
                          <Download className="h-4 w-4" />
                          Export Logs
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-600">
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {integration.isEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 pt-6 border-t"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={integration.metrics.syncSuccess} 
                            className="flex-1 h-2"
                          />
                          <span className="text-sm font-medium">
                            {integration.metrics.syncSuccess.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Data Points</p>
                        <p className="text-xl font-bold">
                          {integration.metrics.dataPoints.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Response Time</p>
                        <p className="text-xl font-bold">
                          {integration.metrics.avgResponseTime}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Next Sync</p>
                        <p className="text-xl font-bold">{integration.nextSync}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </EnhancedCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.filter(i => i.isEnabled).map((integration) => (
              <EnhancedCard key={integration.id} className="p-6">
                <h3 className="font-semibold mb-4">{integration.name} Monitoring</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Sync Success Rate</span>
                      <span>{integration.metrics.syncSuccess.toFixed(1)}%</span>
                    </div>
                    <Progress value={integration.metrics.syncSuccess} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Error Rate</span>
                      <span>{integration.metrics.errorRate.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={integration.metrics.errorRate} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Status</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(integration.status)}
                        <span className="text-sm capitalize">{integration.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <EnhancedCard className="p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {integrations.flatMap(integration => 
                integration.recentActivity.map((activity, index) => (
                  <div key={`${integration.id}-${index}`} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className={`p-1 rounded ${
                      activity.type === 'error' ? 'bg-red-50' :
                      activity.type === 'sync' ? 'bg-green-50' :
                      activity.type === 'config' ? 'bg-blue-50' : 'bg-yellow-50'
                    }`}>
                      {activity.type === 'error' ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
                       activity.type === 'sync' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                       activity.type === 'config' ? <Settings className="h-4 w-4 text-blue-600" /> :
                       <Clock className="h-4 w-4 text-yellow-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{integration.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </EnhancedCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}