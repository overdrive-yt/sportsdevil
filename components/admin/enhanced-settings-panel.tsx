// V9.15: Enhanced Configuration and Settings Panel - Functional Backend Integration
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCurrentUser } from '@/hooks/use-auth-store'
import { 
  Settings,
  Shield,
  Key,
  Globe,
  Bell,
  Database,
  Cloud,
  Zap,
  Mail,
  Smartphone,
  Monitor,
  Palette,
  Users,
  Lock,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'
import { EnhancedCard } from '@/components/ui/enhanced-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { RoleManagement } from '@/components/admin/role-management' // TEMPORARILY DISABLED FOR MIGRATION
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Slider } from '@/components/ui/slider'

interface SystemSettings {
  general: {
    siteName: string
    siteUrl: string
    adminEmail: string
    timezone: string
    language: string
    maintenanceMode: boolean
    debugMode: boolean
  }
  integrations: {
    autoSync: boolean
    syncInterval: number
    maxRetries: number
    webhookTimeout: number
    rateLimitPerMinute: number
    enableLogging: boolean
  }
  security: {
    requireTwoFactor: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    passwordComplexity: 'basic' | 'moderate' | 'strict'
    enableAuditLog: boolean
    ipWhitelist: string[]
  }
  performance: {
    cacheEnabled: boolean
    cacheTtl: number
    compressionEnabled: boolean
    cdnEnabled: boolean
    lazyLoading: boolean
    imageOptimization: boolean
  }
  notifications: {
    emailEnabled: boolean
    smsEnabled: boolean
    pushEnabled: boolean
    slackWebhook?: string
    discordWebhook?: string
    emailTemplates: {
      orderConfirmation: boolean
      systemAlerts: boolean
      maintenanceNotices: boolean
    }
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    primaryColor: string
    brandLogo?: string
    favicon?: string
    customCss?: string
    showBranding: boolean
  }
}

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  lastUsed?: Date
  created: Date
  expiresAt?: Date
  isActive: boolean
}

interface EnhancedSettingsPanelProps {
  currentUserRole?: 'super_admin' | 'admin' | 'manager' | 'family_member' | 'viewer'
}

export function EnhancedSettingsPanel({ currentUserRole = 'admin' }: EnhancedSettingsPanelProps) {
  const { user } = useCurrentUser()
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'Sports Devil',
      siteUrl: 'https://sportsdevil.co.uk',
      adminEmail: 'admin@sportsdevil.co.uk',
      timezone: 'Europe/London',
      language: 'en',
      maintenanceMode: false,
      debugMode: false
    },
    integrations: {
      autoSync: true,
      syncInterval: 15,
      maxRetries: 3,
      webhookTimeout: 30,
      rateLimitPerMinute: 100,
      enableLogging: true
    },
    security: {
      requireTwoFactor: false,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      passwordComplexity: 'moderate',
      enableAuditLog: true,
      ipWhitelist: []
    },
    performance: {
      cacheEnabled: true,
      cacheTtl: 3600,
      compressionEnabled: true,
      cdnEnabled: false,
      lazyLoading: true,
      imageOptimization: true
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      emailTemplates: {
        orderConfirmation: true,
        systemAlerts: true,
        maintenanceNotices: true
      }
    },
    appearance: {
      theme: 'system',
      primaryColor: '#3b82f6',
      showBranding: true
    }
  })

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Mobile App API',
      key: 'sk_live_...',
      permissions: ['read:products', 'write:orders'],
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      id: '2',
      name: 'Analytics Integration',
      key: 'sk_live_...',
      permissions: ['read:analytics', 'read:orders'],
      created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isActive: true
    }
  ])

  const [selectedTab, setSelectedTab] = useState('general')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showApiKey, setShowApiKey] = useState<string | null>(null)
  const [isCreatingApiKey, setIsCreatingApiKey] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        
        let data
        try {
          data = await response.json()
        } catch (parseError) {
          console.error('Failed to parse settings response:', parseError)
          console.error('Response status:', response.status, response.statusText)
          return
        }
        
        if (data.success) {
          setSettings(data.data)
        } else {
          console.error('Failed to load settings:', data.error)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings,
          userId: user?.id || 'system'
        })
      })

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Failed to parse settings save response:', parseError)
        console.error('Response status:', response.status, response.statusText)
        const textResponse = await response.text()
        console.error('Response text:', textResponse)
        throw new Error('Invalid response format from settings API')
      }
      
      if (data.success) {
        // Show success notification
        console.log('Settings saved successfully')
      } else {
        console.error('Failed to save settings:', data.error)
        throw new Error(data.error || 'Settings save failed')
      }
    } catch (error) {
      console.error('Settings save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSettings = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || 'system'
        })
      })

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Failed to parse settings reset response:', parseError)
        console.error('Response status:', response.status, response.statusText)
        const textResponse = await response.text()
        console.error('Response text:', textResponse)
        throw new Error('Invalid response format from settings API')
      }
      
      if (data.success) {
        setSettings(data.data)
        console.log('Settings reset successfully')
      } else {
        console.error('Failed to reset settings:', data.error)
        throw new Error(data.error || 'Settings reset failed')
      }
    } catch (error) {
      console.error('Settings reset error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = 'sk_live_'
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleCreateApiKey = (name: string, permissions: string[]) => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name,
      key: generateApiKey(),
      permissions,
      created: new Date(),
      isActive: true
    }
    setApiKeys(prev => [...prev, newKey])
    setIsCreatingApiKey(false)
  }

  const handleToggleApiKey = (id: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === id ? { ...key, isActive: !key.isActive } : key
    ))
  }

  const handleDeleteApiKey = (id: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== id))
  }

  const getSecurityLevel = () => {
    let score = 0
    if (settings.security.requireTwoFactor) score += 25
    if (settings.security.sessionTimeout <= 30) score += 20
    if (settings.security.passwordComplexity === 'strict') score += 25
    if (settings.security.enableAuditLog) score += 15
    if (settings.security.ipWhitelist.length > 0) score += 15
    return score
  }

  const getPerformanceScore = () => {
    let score = 0
    if (settings.performance.cacheEnabled) score += 20
    if (settings.performance.compressionEnabled) score += 15
    if (settings.performance.cdnEnabled) score += 25
    if (settings.performance.lazyLoading) score += 20
    if (settings.performance.imageOptimization) score += 20
    return score
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">
            Configure and manage your platform settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleResetSettings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <EnhancedCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Security Level</p>
              <div className="flex items-center gap-2">
                <Progress value={getSecurityLevel()} className="w-16 h-2" />
                <span className="text-sm font-semibold">{getSecurityLevel()}%</span>
              </div>
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Performance</p>
              <div className="flex items-center gap-2">
                <Progress value={getPerformanceScore()} className="w-16 h-2" />
                <span className="text-sm font-semibold">{getPerformanceScore()}%</span>
              </div>
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Key className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">API Keys</p>
              <p className="text-2xl font-bold">{apiKeys.filter(k => k.isActive).length}</p>
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              settings.general.maintenanceMode ? 'bg-red-50' : 'bg-green-50'
            }`}>
              <Monitor className={`h-5 w-5 ${
                settings.general.maintenanceMode ? 'text-red-600' : 'text-green-600'
              }`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">System Status</p>
              <p className="text-sm font-semibold">
                {settings.general.maintenanceMode ? 'Maintenance' : 'Operational'}
              </p>
            </div>
          </div>
        </EnhancedCard>
      </div>

      {/* Main Settings */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <EnhancedCard className="p-6">
            <h3 className="font-semibold mb-4">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Site Name</Label>
                <Input
                  value={settings.general.siteName}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, siteName: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Site URL</Label>
                <Input
                  value={settings.general.siteUrl}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, siteUrl: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Admin Email</Label>
                <Input
                  type="email"
                  value={settings.general.adminEmail}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, adminEmail: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={settings.general.timezone}
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, timezone: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="America/New_York">New York (EST)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable public access to the site
                  </p>
                </div>
                <Switch
                  checked={settings.general.maintenanceMode}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, maintenanceMode: checked }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable detailed error logging and debugging
                  </p>
                </div>
                <Switch
                  checked={settings.general.debugMode}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, debugMode: checked }
                  }))}
                />
              </div>
            </div>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <EnhancedCard className="p-6">
            <h3 className="font-semibold mb-4">Security Configuration</h3>
            
            <Alert className="mb-6">
              <Shield className="h-4 w-4" />
              <AlertTitle>Security Score: {getSecurityLevel()}%</AlertTitle>
              <AlertDescription>
                {getSecurityLevel() >= 80 ? 'Excellent security configuration' :
                 getSecurityLevel() >= 60 ? 'Good security, consider additional measures' :
                 'Security needs improvement'}
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for all admin accounts
                  </p>
                </div>
                <Switch
                  checked={settings.security.requireTwoFactor}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, requireTwoFactor: checked }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.security.sessionTimeout]}
                    onValueChange={([value]) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, sessionTimeout: value }
                    }))}
                    max={120}
                    min={5}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">
                    {settings.security.sessionTimeout}m
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Password Complexity</Label>
                <Select
                  value={settings.security.passwordComplexity}
                  onValueChange={(value: 'basic' | 'moderate' | 'strict') => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, passwordComplexity: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                    <SelectItem value="moderate">Moderate (letters, numbers)</SelectItem>
                    <SelectItem value="strict">Strict (mixed case, symbols)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Login Attempts</Label>
                <Input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) }
                  }))}
                  min={1}
                  max={10}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Log all administrative actions
                  </p>
                </div>
                <Switch
                  checked={settings.security.enableAuditLog}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, enableAuditLog: checked }
                  }))}
                />
              </div>
            </div>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <EnhancedCard className="p-6">
            <h3 className="font-semibold mb-4">Integration Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync data with external platforms
                  </p>
                </div>
                <Switch
                  checked={settings.integrations.autoSync}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    integrations: { ...prev.integrations, autoSync: checked }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Sync Interval (minutes)</Label>
                <Select
                  value={settings.integrations.syncInterval.toString()}
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    integrations: { ...prev.integrations, syncInterval: parseInt(value) }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="360">6 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Retries</Label>
                <Input
                  type="number"
                  value={settings.integrations.maxRetries}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    integrations: { ...prev.integrations, maxRetries: parseInt(e.target.value) }
                  }))}
                  min={1}
                  max={10}
                />
              </div>

              <div className="space-y-2">
                <Label>Webhook Timeout (seconds)</Label>
                <Input
                  type="number"
                  value={settings.integrations.webhookTimeout}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    integrations: { ...prev.integrations, webhookTimeout: parseInt(e.target.value) }
                  }))}
                  min={5}
                  max={120}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Log all integration activities
                  </p>
                </div>
                <Switch
                  checked={settings.integrations.enableLogging}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    integrations: { ...prev.integrations, enableLogging: checked }
                  }))}
                />
              </div>
            </div>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <EnhancedCard className="p-6">
            <h3 className="font-semibold mb-4">Performance Optimization</h3>
            
            <Alert className="mb-6">
              <Zap className="h-4 w-4" />
              <AlertTitle>Performance Score: {getPerformanceScore()}%</AlertTitle>
              <AlertDescription>
                {getPerformanceScore() >= 80 ? 'Excellent performance configuration' :
                 getPerformanceScore() >= 60 ? 'Good performance, room for improvement' :
                 'Performance optimizations recommended'}
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Caching</Label>
                  <p className="text-sm text-muted-foreground">
                    Cache frequently accessed data
                  </p>
                </div>
                <Switch
                  checked={settings.performance.cacheEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    performance: { ...prev.performance, cacheEnabled: checked }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Cache TTL (seconds)</Label>
                <Input
                  type="number"
                  value={settings.performance.cacheTtl}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    performance: { ...prev.performance, cacheTtl: parseInt(e.target.value) }
                  }))}
                  min={60}
                  disabled={!settings.performance.cacheEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Compression</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable GZIP compression for responses
                  </p>
                </div>
                <Switch
                  checked={settings.performance.compressionEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    performance: { ...prev.performance, compressionEnabled: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>CDN</Label>
                  <p className="text-sm text-muted-foreground">
                    Use Content Delivery Network for static assets
                  </p>
                </div>
                <Switch
                  checked={settings.performance.cdnEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    performance: { ...prev.performance, cdnEnabled: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Image Optimization</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically optimize and compress images
                  </p>
                </div>
                <Switch
                  checked={settings.performance.imageOptimization}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    performance: { ...prev.performance, imageOptimization: checked }
                  }))}
                />
              </div>
            </div>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <EnhancedCard className="p-6">
            <h3 className="font-semibold mb-4">Notification Settings</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, emailEnabled: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Send SMS notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, smsEnabled: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Send push notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, pushEnabled: checked }
                    }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Email Templates</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Order Confirmation</Label>
                    <Switch
                      checked={settings.notifications.emailTemplates.orderConfirmation}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          emailTemplates: {
                            ...prev.notifications.emailTemplates,
                            orderConfirmation: checked
                          }
                        }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>System Alerts</Label>
                    <Switch
                      checked={settings.notifications.emailTemplates.systemAlerts}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          emailTemplates: {
                            ...prev.notifications.emailTemplates,
                            systemAlerts: checked
                          }
                        }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Maintenance Notices</Label>
                    <Switch
                      checked={settings.notifications.emailTemplates.maintenanceNotices}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          emailTemplates: {
                            ...prev.notifications.emailTemplates,
                            maintenanceNotices: checked
                          }
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">API Keys</h3>
              <p className="text-sm text-muted-foreground">
                Manage API keys for external integrations
              </p>
            </div>
            <Dialog open={isCreatingApiKey} onOpenChange={setIsCreatingApiKey}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Key Name</Label>
                    <Input placeholder="e.g., Mobile App Integration" />
                  </div>
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="read-products" />
                        <Label htmlFor="read-products">Read Products</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="write-products" />
                        <Label htmlFor="write-products">Write Products</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="read-orders" />
                        <Label htmlFor="read-orders">Read Orders</Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreatingApiKey(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleCreateApiKey('Test Key', ['read:products'])}>
                      Create Key
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <EnhancedCard key={apiKey.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{apiKey.name}</h4>
                      <Badge variant={apiKey.isActive ? 'default' : 'secondary'}>
                        {apiKey.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {showApiKey === apiKey.id ? apiKey.key : apiKey.key.replace(/./g, '•')}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                      >
                        {showApiKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(apiKey.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {apiKey.permissions.map(permission => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Created: {apiKey.created.toLocaleDateString()}
                      {apiKey.lastUsed && (
                        <> • Last used: {apiKey.lastUsed.toLocaleDateString()}</>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={apiKey.isActive}
                      onCheckedChange={() => handleToggleApiKey(apiKey.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteApiKey(apiKey.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </EnhancedCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          {/* <RoleManagement currentUserRole={currentUserRole} /> */}
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Role Management temporarily disabled for migration</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}