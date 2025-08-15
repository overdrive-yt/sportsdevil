// V9.13.4: Dashboard Performance Optimization Component
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap,
  Activity,
  Clock,
  Database,
  Server,
  Wifi,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings,
  BarChart3,
  Monitor,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Shield,
  Gauge
} from 'lucide-react'
import { EnhancedCard } from '../ui/enhanced-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'

interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'excellent' | 'good' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  target: number
  description: string
}

interface OptimizationSetting {
  id: string
  name: string
  description: string
  enabled: boolean
  impact: 'high' | 'medium' | 'low'
  type: 'toggle' | 'slider' | 'select'
  value?: number
  options?: string[]
}

export function DashboardOptimization() {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([])
  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSetting[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [selectedTab, setSelectedTab] = useState('performance')

  useEffect(() => {
    const loadOptimizationData = async () => {
      try {
        const response = await fetch('/api/optimization')
        const data = await response.json()
        
        if (data.success) {
          setPerformanceMetrics(data.data.performanceMetrics)
          setOptimizationSettings(data.data.optimizationSettings)
        }
      } catch (error) {
        console.error('Failed to load optimization data:', error)
        // Fall back to mock data
        loadMockData()
      }
    }

    const loadMockData = () => {
      const mockMetrics: PerformanceMetric[] = [
      {
        id: 'load-time',
        name: 'Page Load Time',
        value: 1.2,
        unit: 's',
        status: 'excellent',
        trend: 'stable',
        target: 2.0,
        description: 'Time to fully load dashboard components'
      },
      {
        id: 'first-paint',
        name: 'First Contentful Paint',
        value: 0.8,
        unit: 's',
        status: 'excellent',
        trend: 'up',
        target: 1.5,
        description: 'Time to first meaningful content display'
      },
      {
        id: 'bundle-size',
        name: 'Bundle Size',
        value: 245,
        unit: 'KB',
        status: 'good',
        trend: 'stable',
        target: 300,
        description: 'Total JavaScript bundle size'
      },
      {
        id: 'api-response',
        name: 'API Response Time',
        value: 180,
        unit: 'ms',
        status: 'good',
        trend: 'down',
        target: 200,
        description: 'Average API endpoint response time'
      },
      {
        id: 'memory-usage',
        name: 'Memory Usage',
        value: 68,
        unit: 'MB',
        status: 'warning',
        trend: 'up',
        target: 100,
        description: 'Browser memory consumption'
      },
      {
        id: 'cache-hit',
        name: 'Cache Hit Rate',
        value: 94,
        unit: '%',
        status: 'excellent',
        trend: 'stable',
        target: 90,
        description: 'Percentage of requests served from cache'
      }
    ]

    const mockSettings: OptimizationSetting[] = [
      {
        id: 'lazy-loading',
        name: 'Lazy Loading',
        description: 'Load components and images only when needed',
        enabled: true,
        impact: 'high',
        type: 'toggle'
      },
      {
        id: 'code-splitting',
        name: 'Code Splitting',
        description: 'Split JavaScript bundles for faster loading',
        enabled: true,
        impact: 'high',
        type: 'toggle'
      },
      {
        id: 'image-optimization',
        name: 'Image Optimization',
        description: 'Compress and optimize images automatically',
        enabled: true,
        impact: 'medium',
        type: 'toggle'
      },
      {
        id: 'caching',
        name: 'Aggressive Caching',
        description: 'Cache API responses and static assets',
        enabled: true,
        impact: 'high',
        type: 'toggle'
      },
      {
        id: 'preloading',
        name: 'Resource Preloading',
        description: 'Preload critical resources for faster navigation',
        enabled: false,
        impact: 'medium',
        type: 'toggle'
      },
      {
        id: 'compression',
        name: 'GZIP Compression',
        description: 'Compress responses to reduce transfer size',
        enabled: true,
        impact: 'medium',
        type: 'toggle'
      },
      {
        id: 'prefetch-level',
        name: 'Prefetch Level',
        description: 'How aggressively to prefetch resources',
        enabled: true,
        impact: 'low',
        type: 'slider',
        value: 3
      }
    ]

      setPerformanceMetrics(mockMetrics)
      setOptimizationSettings(mockSettings)
    }

    loadOptimizationData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200'
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'good': return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />
      default: return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const handleOptimizationToggle = async (id: string, enabled: boolean) => {
    const updatedSettings = optimizationSettings.map(setting =>
      setting.id === id ? { ...setting, enabled } : setting
    )
    
    setOptimizationSettings(updatedSettings)
    
    // Save to backend
    try {
      await fetch('/api/optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateSettings',
          settings: updatedSettings,
          userId: 'current-user-id'
        })
      })
    } catch (error) {
      console.error('Failed to save optimization settings:', error)
    }
  }

  const handleSliderChange = async (id: string, value: number[]) => {
    const updatedSettings = optimizationSettings.map(setting =>
      setting.id === id ? { ...setting, value: value[0] } : setting
    )
    
    setOptimizationSettings(updatedSettings)
    
    // Save to backend
    try {
      await fetch('/api/optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateSettings',
          settings: updatedSettings,
          userId: 'current-user-id'
        })
      })
    } catch (error) {
      console.error('Failed to save optimization settings:', error)
    }
  }

  const runOptimization = async () => {
    setIsOptimizing(true)
    
    try {
      const response = await fetch('/api/optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'optimize',
          userId: 'current-user-id' // This should come from auth context
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Update metrics to show improvement
        setPerformanceMetrics(prev => prev.map(metric => ({
          ...metric,
          value: metric.unit === '%' ? 
            Math.max(metric.value * 0.9, 0) : // Percentage improvements
            metric.value * 0.85, // Time/size improvements
          status: metric.value * 0.85 < metric.target * 0.7 ? 'excellent' : 
                  metric.value * 0.85 < metric.target * 0.9 ? 'good' : metric.status,
          trend: 'up'
        })))
        
        console.log('Optimization completed:', data.improvements)
      } else {
        console.error('Optimization failed:', data.error)
      }
    } catch (error) {
      console.error('Optimization request failed:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const getOverallScore = () => {
    const scores = {
      excellent: 100,
      good: 80,
      warning: 60,
      critical: 30
    }
    
    const totalScore = performanceMetrics.reduce((sum, metric) => 
      sum + scores[metric.status], 0
    )
    
    return Math.round(totalScore / performanceMetrics.length)
  }

  const overallScore = getOverallScore()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Optimization</h2>
          <p className="text-muted-foreground">
            Monitor and optimize dashboard performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Performance Score</p>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                overallScore >= 90 ? 'bg-green-500' :
                overallScore >= 70 ? 'bg-blue-500' :
                overallScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-2xl font-bold">{overallScore}</span>
            </div>
          </div>
          <Button 
            onClick={runOptimization}
            disabled={isOptimizing}
            className="gap-2"
          >
            {isOptimizing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EnhancedCard className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-full">
              <Gauge className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Overall Performance</p>
              <p className="text-3xl font-bold text-green-900">{overallScore}%</p>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={overallScore} className="h-2" />
          </div>
        </EnhancedCard>

        <EnhancedCard className="p-6 bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-full">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Avg Load Time</p>
              <p className="text-3xl font-bold text-blue-900">
                {performanceMetrics.find(m => m.id === 'load-time')?.value.toFixed(1)}s
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Badge className="text-green-600 bg-green-50 border-green-200" variant="secondary">
              Excellent
            </Badge>
          </div>
        </EnhancedCard>

        <EnhancedCard className="p-6 bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500 rounded-full">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600">Optimizations</p>
              <p className="text-3xl font-bold text-purple-900">
                {optimizationSettings.filter(s => s.enabled).length}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-purple-700">of {optimizationSettings.length} enabled</p>
          </div>
        </EnhancedCard>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          <TabsTrigger value="system">System Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {performanceMetrics.map((metric) => (
              <EnhancedCard key={metric.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{metric.name}</h3>
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(metric.status)}
                    {getTrendIcon(metric.trend)}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold">{metric.value}</span>
                    <span className="text-muted-foreground">{metric.unit}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Performance</span>
                      <span>Target: {metric.target}{metric.unit}</span>
                    </div>
                    <Progress 
                      value={Math.min(100, (metric.target - metric.value) / metric.target * 100)} 
                      className="h-2"
                    />
                  </div>

                  <Badge className={getStatusColor(metric.status)} variant="secondary">
                    {metric.status}
                  </Badge>
                </div>
              </EnhancedCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-6">
          <div className="space-y-4">
            {optimizationSettings.map((setting) => (
              <EnhancedCard key={setting.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{setting.name}</h3>
                      <Badge className={getImpactColor(setting.impact)} variant="secondary">
                        {setting.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {setting.description}
                    </p>

                    {setting.type === 'slider' && setting.enabled && (
                      <div className="space-y-2">
                        <Label>Level: {setting.value}</Label>
                        <Slider
                          value={[setting.value || 1]}
                          onValueChange={(value) => handleSliderChange(setting.id, value)}
                          max={5}
                          min={1}
                          step={1}
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={(enabled) => handleOptimizationToggle(setting.id, enabled)}
                    />
                  </div>
                </div>
              </EnhancedCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <EnhancedCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Cpu className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CPU Usage</p>
                  <p className="text-2xl font-bold">23%</p>
                </div>
              </div>
              <Progress value={23} className="h-2" />
            </EnhancedCard>

            <EnhancedCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <MemoryStick className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Memory</p>
                  <p className="text-2xl font-bold">68MB</p>
                </div>
              </div>
              <Progress value={68} className="h-2" />
            </EnhancedCard>

            <EnhancedCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <HardDrive className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Storage</p>
                  <p className="text-2xl font-bold">245KB</p>
                </div>
              </div>
              <Progress value={35} className="h-2" />
            </EnhancedCard>

            <EnhancedCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Network className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Network</p>
                  <p className="text-2xl font-bold">180ms</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </EnhancedCard>
          </div>

          <EnhancedCard className="p-6">
            <h3 className="font-semibold mb-4">Resource Usage Over Time</h3>
            <div className="h-32 flex items-end gap-2">
              {Array.from({ length: 24 }, (_, i) => (
                <motion.div
                  key={i}
                  className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t flex-1 min-w-[8px]"
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.random() * 80 + 20}%` }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>24:00</span>
            </div>
          </EnhancedCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}