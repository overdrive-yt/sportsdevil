'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Activity,
  BarChart3,
  Package,
  ShoppingCart,
  Settings,
  PlayCircle,
  PauseCircle
} from 'lucide-react'

interface SyncStatusPanelProps {
  syncStatus: any
  integrations: any[]
}

// V9.11.5: Sync Status Monitoring Panel
export default function SyncStatusPanel({ syncStatus, integrations }: SyncStatusPanelProps) {
  const [isRunningSync, setIsRunningSync] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)

  const handleFullSync = async () => {
    setIsRunningSync(true)
    setSyncProgress(0)

    // Mock sync progress
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRunningSync(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
      default:
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
    }
  }

  const activePlatforms = integrations.filter(p => p.isActive)
  const pendingPlatforms = integrations.filter(p => !p.isActive)

  return (
    <div className="space-y-6">
      {/* Sync Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Sync Overview</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {activePlatforms.length} Active Platforms
              </Badge>
              <Button onClick={handleFullSync} disabled={isRunningSync} size="sm">
                {isRunningSync ? (
                  <>
                    <PauseCircle className="h-4 w-4 mr-2" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run Full Sync
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">{syncStatus?.totalSynced || 0}</p>
              <p className="text-sm text-muted-foreground">Products Synced</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <ShoppingCart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">{syncStatus?.pendingOrders || 0}</p>
              <p className="text-sm text-muted-foreground">Pending Orders</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-orange-50">
              <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-700">{syncStatus?.conflicts || 0}</p>
              <p className="text-sm text-muted-foreground">Conflicts</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-gray-50">
              <Clock className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">
                {syncStatus?.lastFullSync ? new Date(syncStatus.lastFullSync).toLocaleDateString() : 'Never'}
              </p>
              <p className="text-sm text-muted-foreground">Last Full Sync</p>
            </div>
          </div>

          {isRunningSync && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sync Progress</span>
                <span className="text-sm text-muted-foreground">{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Synchronizing products across {activePlatforms.length} active platforms...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Sync Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Platforms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Active Platforms</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activePlatforms.length > 0 ? (
              <div className="space-y-3">
                {activePlatforms.map((platform) => (
                  <div key={platform.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                    <div className="flex items-center space-x-3">
                      {getSyncStatusIcon(platform.status)}
                      <div>
                        <p className="font-medium">{platform.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {platform.totalProducts} products • {platform.totalOrders} orders
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {platform.status}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active platforms</p>
                <p className="text-xs">Configure platforms to start syncing</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Platforms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Pending Setup</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingPlatforms.length > 0 ? (
              <div className="space-y-3">
                {pendingPlatforms.map((platform) => (
                  <div key={platform.id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">{platform.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Configuration required
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Setup
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>All platforms configured</p>
                <p className="text-xs">Great job! All integrations are set up</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span>Sync History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No sync history available</p>
            <p className="text-xs">History will appear here after running syncs</p>
          </div>
        </CardContent>
      </Card>

      {/* Sync Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <span>Sync Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Sync Schedule</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Auto Sync Interval</span>
                  <Badge variant="outline">Every Hour</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Peak Hours Sync</span>
                  <Badge variant="outline">Disabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Conflict Resolution</span>
                  <Badge variant="outline">Manual</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Sync Scope</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Products</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Inventory</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Orders</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Enabled</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}