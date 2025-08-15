'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Settings,
  Save,
  Eye,
  EyeOff,
  TestTube,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  Zap,
  Shield
} from 'lucide-react'

interface IntegrationSetupProps {
  onUpdate: () => void
}

// V9.11.5: Integration Setup and Configuration Component
export default function IntegrationSetup({ onUpdate }: IntegrationSetupProps) {
  const [activeSetup, setActiveSetup] = useState('tiktok')
  const [isLoading, setIsLoading] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  // Configuration states
  const [tiktokConfig, setTiktokConfig] = useState({
    shopId: '',
    apiKey: '',
    apiSecret: '',
    environment: 'sandbox',
    autoSync: true,
    syncInterval: 3600
  })

  const [xeposConfig, setXeposConfig] = useState({
    storeId: '',
    apiEndpoint: '',
    username: '',
    password: '',
    environment: 'production',
    autoSync: true,
    syncInterval: 1800
  })

  const [ebayConfig, setEbayConfig] = useState({
    sellerId: '',
    clientId: '',
    clientSecret: '',
    devId: '',
    environment: 'sandbox',
    autoSync: true,
    syncInterval: 7200
  })

  const handleSaveConfig = async (platform: string) => {
    setIsLoading(true)
    
    // Mock save process
    setTimeout(() => {
      setIsLoading(false)
      onUpdate()
      // Show success message
    }, 2000)
  }

  const handleTestConnection = async (platform: string) => {
    setIsLoading(true)
    
    // Mock test connection
    setTimeout(() => {
      setTestResults({
        ...testResults,
        [platform]: {
          status: Math.random() > 0.3 ? 'success' : 'failed',
          message: Math.random() > 0.3 ? 'Connection successful!' : 'Connection failed - check credentials',
          timestamp: new Date()
        }
      })
      setIsLoading(false)
    }, 3000)
  }

  const getTestResultIcon = (result: any) => {
    if (!result) return null
    
    switch (result.status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Setup Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <span>Integration Setup & Configuration</span>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Configure your external platform integrations to enable multi-channel cricket equipment sales.
              </p>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              V9.11.5 Core Infrastructure
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeSetup} onValueChange={setActiveSetup} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tiktok" className="flex items-center space-x-2">
            <span>🎵</span>
            <span>TikTok Shop</span>
          </TabsTrigger>
          <TabsTrigger value="xepos" className="flex items-center space-x-2">
            <span>🏪</span>
            <span>Xepos</span>
          </TabsTrigger>
          <TabsTrigger value="ebay" className="flex items-center space-x-2">
            <span>🛒</span>
            <span>eBay</span>
          </TabsTrigger>
        </TabsList>

        {/* TikTok Shop Setup */}
        <TabsContent value="tiktok" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">🎵</span>
                <span>TikTok Shop Integration</span>
              </CardTitle>
              <p className="text-muted-foreground">
                Connect your TikTok Shop to sync cricket equipment and reach social commerce customers.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tiktok-shop-id">Shop ID</Label>
                    <Input
                      id="tiktok-shop-id"
                      value={tiktokConfig.shopId}
                      onChange={(e) => setTiktokConfig({...tiktokConfig, shopId: e.target.value})}
                      placeholder="Enter your TikTok Shop ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tiktok-api-key">API Key</Label>
                    <div className="relative">
                      <Input
                        id="tiktok-api-key"
                        type={showSecrets ? 'text' : 'password'}
                        value={tiktokConfig.apiKey}
                        onChange={(e) => setTiktokConfig({...tiktokConfig, apiKey: e.target.value})}
                        placeholder="Enter your API key"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowSecrets(!showSecrets)}
                      >
                        {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="tiktok-api-secret">API Secret</Label>
                    <Input
                      id="tiktok-api-secret"
                      type={showSecrets ? 'text' : 'password'}
                      value={tiktokConfig.apiSecret}
                      onChange={(e) => setTiktokConfig({...tiktokConfig, apiSecret: e.target.value})}
                      placeholder="Enter your API secret"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Environment</Label>
                    <div className="flex space-x-4 mt-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="tiktok-env"
                          value="sandbox"
                          checked={tiktokConfig.environment === 'sandbox'}
                          onChange={(e) => setTiktokConfig({...tiktokConfig, environment: e.target.value})}
                          className="mr-2"
                        />
                        Sandbox
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="tiktok-env"
                          value="production"
                          checked={tiktokConfig.environment === 'production'}
                          onChange={(e) => setTiktokConfig({...tiktokConfig, environment: e.target.value})}
                          className="mr-2"
                        />
                        Production
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tiktok-auto-sync">Auto Sync</Label>
                    <Switch
                      id="tiktok-auto-sync"
                      checked={tiktokConfig.autoSync}
                      onCheckedChange={(checked) => setTiktokConfig({...tiktokConfig, autoSync: checked})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tiktok-sync-interval">Sync Interval (seconds)</Label>
                    <Input
                      id="tiktok-sync-interval"
                      type="number"
                      value={tiktokConfig.syncInterval}
                      onChange={(e) => setTiktokConfig({...tiktokConfig, syncInterval: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              {/* Test Results */}
              {testResults.tiktok && (
                <div className={`flex items-center space-x-2 p-3 border rounded-lg ${
                  testResults.tiktok.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  {getTestResultIcon(testResults.tiktok)}
                  <span className="text-sm">{testResults.tiktok.message}</span>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => handleTestConnection('tiktok')}
                  disabled={isLoading}
                  variant="outline"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <Button
                  onClick={() => handleSaveConfig('tiktok')}
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Xepos Setup */}
        <TabsContent value="xepos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">🏪</span>
                <span>Xepos POS Integration</span>
              </CardTitle>
              <p className="text-muted-foreground">
                Connect your Xepos POS system for unified inventory and customer management.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="xepos-store-id">Store ID</Label>
                    <Input
                      id="xepos-store-id"
                      value={xeposConfig.storeId}
                      onChange={(e) => setXeposConfig({...xeposConfig, storeId: e.target.value})}
                      placeholder="Enter your Xepos Store ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="xepos-endpoint">API Endpoint</Label>
                    <Input
                      id="xepos-endpoint"
                      value={xeposConfig.apiEndpoint}
                      onChange={(e) => setXeposConfig({...xeposConfig, apiEndpoint: e.target.value})}
                      placeholder="https://api.xepos.com/v1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="xepos-username">Username</Label>
                    <Input
                      id="xepos-username"
                      value={xeposConfig.username}
                      onChange={(e) => setXeposConfig({...xeposConfig, username: e.target.value})}
                      placeholder="Enter your username"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="xepos-password">Password</Label>
                    <Input
                      id="xepos-password"
                      type={showSecrets ? 'text' : 'password'}
                      value={xeposConfig.password}
                      onChange={(e) => setXeposConfig({...xeposConfig, password: e.target.value})}
                      placeholder="Enter your password"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="xepos-auto-sync">Auto Sync</Label>
                    <Switch
                      id="xepos-auto-sync"
                      checked={xeposConfig.autoSync}
                      onCheckedChange={(checked) => setXeposConfig({...xeposConfig, autoSync: checked})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="xepos-sync-interval">Sync Interval (seconds)</Label>
                    <Input
                      id="xepos-sync-interval"
                      type="number"
                      value={xeposConfig.syncInterval}
                      onChange={(e) => setXeposConfig({...xeposConfig, syncInterval: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              {/* Test Results */}
              {testResults.xepos && (
                <div className={`flex items-center space-x-2 p-3 border rounded-lg ${
                  testResults.xepos.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  {getTestResultIcon(testResults.xepos)}
                  <span className="text-sm">{testResults.xepos.message}</span>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => handleTestConnection('xepos')}
                  disabled={isLoading}
                  variant="outline"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <Button
                  onClick={() => handleSaveConfig('xepos')}
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* eBay Setup */}
        <TabsContent value="ebay" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">🛒</span>
                <span>eBay Marketplace Integration</span>
              </CardTitle>
              <p className="text-muted-foreground">
                Connect to eBay marketplace for global cricket equipment sales reach.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ebay-seller-id">Seller ID</Label>
                    <Input
                      id="ebay-seller-id"
                      value={ebayConfig.sellerId}
                      onChange={(e) => setEbayConfig({...ebayConfig, sellerId: e.target.value})}
                      placeholder="Enter your eBay Seller ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ebay-client-id">Client ID</Label>
                    <Input
                      id="ebay-client-id"
                      value={ebayConfig.clientId}
                      onChange={(e) => setEbayConfig({...ebayConfig, clientId: e.target.value})}
                      placeholder="Enter your eBay Client ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ebay-client-secret">Client Secret</Label>
                    <Input
                      id="ebay-client-secret"
                      type={showSecrets ? 'text' : 'password'}
                      value={ebayConfig.clientSecret}
                      onChange={(e) => setEbayConfig({...ebayConfig, clientSecret: e.target.value})}
                      placeholder="Enter your client secret"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ebay-dev-id">Developer ID</Label>
                    <Input
                      id="ebay-dev-id"
                      value={ebayConfig.devId}
                      onChange={(e) => setEbayConfig({...ebayConfig, devId: e.target.value})}
                      placeholder="Enter your Developer ID"
                    />
                  </div>
                  <div>
                    <Label>Environment</Label>
                    <div className="flex space-x-4 mt-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="ebay-env"
                          value="sandbox"
                          checked={ebayConfig.environment === 'sandbox'}
                          onChange={(e) => setEbayConfig({...ebayConfig, environment: e.target.value})}
                          className="mr-2"
                        />
                        Sandbox
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="ebay-env"
                          value="production"
                          checked={ebayConfig.environment === 'production'}
                          onChange={(e) => setEbayConfig({...ebayConfig, environment: e.target.value})}
                          className="mr-2"
                        />
                        Production
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ebay-auto-sync">Auto Sync</Label>
                    <Switch
                      id="ebay-auto-sync"
                      checked={ebayConfig.autoSync}
                      onCheckedChange={(checked) => setEbayConfig({...ebayConfig, autoSync: checked})}
                    />
                  </div>
                </div>
              </div>

              {/* Test Results */}
              {testResults.ebay && (
                <div className={`flex items-center space-x-2 p-3 border rounded-lg ${
                  testResults.ebay.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  {getTestResultIcon(testResults.ebay)}
                  <span className="text-sm">{testResults.ebay.message}</span>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => handleTestConnection('ebay')}
                  disabled={isLoading}
                  variant="outline"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <Button
                  onClick={() => handleSaveConfig('ebay')}
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <span>Global Integration Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Webhooks</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Auto Conflict Resolution</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label>Real-time Sync</Label>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Sync Notifications</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Error Alerts</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Performance Monitoring</Label>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}