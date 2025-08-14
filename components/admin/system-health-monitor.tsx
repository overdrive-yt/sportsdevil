// V9.13.2: System Health Monitoring Panel
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  HardDrive,
  Cpu,
  MemoryStick,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Cloud,
  Globe
} from 'lucide-react'
import { EnhancedCard } from '@/components/ui/enhanced-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SystemMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
  threshold: {
    warning: number
    critical: number
  }
  history: number[]
  lastUpdated: string
}

interface ServiceStatus {
  id: string
  name: string
  status: 'online' | 'offline' | 'degraded'
  uptime: number
  responseTime: number
  lastCheck: string
  endpoint?: string
  dependencies?: string[]
}

interface SystemAlert {
  id: string
  type: 'error' | 'warning' | 'info'
  service: string
  message: string
  timestamp: string
  resolved: boolean
}

export function SystemHealthMonitor() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    const initializeData = () => {
      const mockMetrics: SystemMetric[] = [
        {
          id: 'cpu',
          name: 'CPU Usage',
          value: 45.2,
          unit: '%',
          status: 'healthy',
          threshold: { warning: 70, critical: 90 },
          history: [42, 44, 43, 47, 45, 46, 45.2],
          lastUpdated: 'just now'
        },
        {
          id: 'memory',
          name: 'Memory Usage',
          value: 68.5,
          unit: '%',
          status: 'warning',
          threshold: { warning: 70, critical: 90 },
          history: [62, 64, 66, 67, 69, 68, 68.5],
          lastUpdated: 'just now'
        },
        {
          id: 'disk',
          name: 'Disk Usage',
          value: 34.8,
          unit: '%',
          status: 'healthy',
          threshold: { warning: 80, critical: 95 },
          history: [32, 33, 34, 35, 34, 35, 34.8],
          lastUpdated: 'just now'
        },
        {
          id: 'network',
          name: 'Network I/O',
          value: 12.3,
          unit: 'MB/s',
          status: 'healthy',
          threshold: { warning: 50, critical: 100 },
          history: [10, 11, 13, 12, 14, 13, 12.3],
          lastUpdated: 'just now'
        }
      ]

      const mockServices: ServiceStatus[] = [
        {
          id: 'web-server',
          name: 'Web Server',
          status: 'online',
          uptime: 99.8,
          responseTime: 120,
          lastCheck: '30 seconds ago',
          endpoint: 'https://sportsdevil.co.uk',
          dependencies: ['database', 'cache']
        },
        {
          id: 'database',
          name: 'Database',
          status: 'online',
          uptime: 99.9,
          responseTime: 45,
          lastCheck: '30 seconds ago',
          dependencies: []
        },
        {
          id: 'api-server',
          name: 'API Server',
          status: 'online',
          uptime: 99.5,
          responseTime: 85,
          lastCheck: '30 seconds ago',
          endpoint: 'https://api.sportsdevil.co.uk',
          dependencies: ['database']
        },
        {
          id: 'cache',
          name: 'Redis Cache',
          status: 'degraded',
          uptime: 97.2,
          responseTime: 200,
          lastCheck: '30 seconds ago',
          dependencies: []
        },
        {
          id: 'email-service',
          name: 'Email Service',
          status: 'online',
          uptime: 98.9,
          responseTime: 340,
          lastCheck: '30 seconds ago',
          dependencies: []
        },
        {
          id: 'payment-gateway',
          name: 'Payment Gateway',
          status: 'online',
          uptime: 99.7,
          responseTime: 180,
          lastCheck: '30 seconds ago',
          endpoint: 'https://payments.stripe.com',
          dependencies: []
        }
      ]

      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'warning',
          service: 'Redis Cache',
          message: 'Response time above normal threshold (200ms)',
          timestamp: '2 minutes ago',
          resolved: false
        },
        {
          id: '2',
          type: 'warning',
          service: 'Memory Usage',
          message: 'Memory usage approaching 70% threshold',
          timestamp: '5 minutes ago',
          resolved: false
        },
        {
          id: '3',
          type: 'info',
          service: 'Web Server',
          message: 'Server restart completed successfully',
          timestamp: '1 hour ago',
          resolved: true
        },
        {
          id: '4',
          type: 'error',
          service: 'Payment Gateway',
          message: 'Connection timeout (resolved)',
          timestamp: '2 hours ago',
          resolved: true
        }
      ]

      setMetrics(mockMetrics)
      setServices(mockServices)
      setAlerts(mockAlerts)
    }

    initializeData()

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, metric.value + (Math.random() - 0.5) * 5),
        history: [...metric.history.slice(1), metric.value],
        status: metric.value > metric.threshold.critical ? 'critical' :
                metric.value > metric.threshold.warning ? 'warning' : 'healthy'
      })))

      setServices(prev => prev.map(service => ({
        ...service,
        responseTime: Math.max(20, service.responseTime + (Math.random() - 0.5) * 20),
        lastCheck: 'just now'
      })))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'offline':
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'degraded':
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'offline':
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const renderMiniChart = (data: number[], color: string = 'blue') => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    return (
      <div className="flex items-end gap-1 h-8">
        {data.map((value, index) => (
          <motion.div
            key={index}
            className={`bg-${color}-500 rounded-sm min-w-[2px]`}
            initial={{ height: 0 }}
            animate={{ height: `${((value - min) / range) * 100}%` }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          />
        ))}
      </div>
    )
  }

  const overallHealth = () => {
    const healthyServices = services.filter(s => s.status === 'online').length
    const totalServices = services.length
    return Math.round((healthyServices / totalServices) * 100)
  }

  const activeAlerts = alerts.filter(a => !a.resolved).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">System Health</h2>
            <p className="text-muted-foreground">
              {activeAlerts} active alerts • Overall health: {overallHealth()}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={overallHealth() > 95 ? 'default' : overallHealth() > 85 ? 'secondary' : 'destructive'}
            className="px-3 py-1"
          >
            {overallHealth() > 95 ? 'Excellent' : overallHealth() > 85 ? 'Good' : 'Needs Attention'}
          </Badge>
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <EnhancedCard key={metric.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  metric.id === 'cpu' ? 'bg-blue-50' :
                  metric.id === 'memory' ? 'bg-purple-50' :
                  metric.id === 'disk' ? 'bg-green-50' : 'bg-orange-50'
                }`}>
                  {metric.id === 'cpu' ? <Cpu className="h-5 w-5 text-blue-600" /> :
                   metric.id === 'memory' ? <MemoryStick className="h-5 w-5 text-purple-600" /> :
                   metric.id === 'disk' ? <HardDrive className="h-5 w-5 text-green-600" /> :
                   <Wifi className="h-5 w-5 text-orange-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(metric.status)}
                    <span className="text-xs capitalize">{metric.status}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {metric.value.toFixed(1)}{metric.unit}
                </p>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Usage</span>
                <span>{metric.value.toFixed(1)}%</span>
              </div>
              <Progress 
                value={metric.value} 
                className={`h-2 ${
                  metric.status === 'critical' ? '[&>div]:bg-red-500' :
                  metric.status === 'warning' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
                }`}
              />
            </div>
            
            <div className="pt-2">
              {renderMiniChart(metric.history, 
                metric.id === 'cpu' ? 'blue' :
                metric.id === 'memory' ? 'purple' :
                metric.id === 'disk' ? 'green' : 'orange'
              )}
            </div>
          </EnhancedCard>
        ))}
      </div>

      {/* Detailed Monitoring */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {activeAlerts > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {activeAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnhancedCard className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall Health</span>
                  <div className="flex items-center gap-2">
                    <Progress value={overallHealth()} className="w-24 h-2" />
                    <span className="font-semibold">{overallHealth()}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Services Online</span>
                  <span className="font-semibold">
                    {services.filter(s => s.status === 'online').length}/{services.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Alerts</span>
                  <Badge variant={activeAlerts > 0 ? 'destructive' : 'default'}>
                    {activeAlerts}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Updated</span>
                  <span className="text-sm text-muted-foreground">just now</span>
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className="justify-start gap-2">
                  <Settings className="h-4 w-4" />
                  Configure
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Restart Services
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2">
                  <Shield className="h-4 w-4" />
                  Security Scan
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2">
                  <Cloud className="h-4 w-4" />
                  Backup Now
                </Button>
              </div>
            </EnhancedCard>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4">
            {services.map((service) => (
              <EnhancedCard key={service.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(service.status)}
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            className={`text-xs ${getStatusColor(service.status)}`}
                            variant="secondary"
                          >
                            {service.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {service.uptime}% uptime
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Response Time</p>
                      <p className="font-semibold">{service.responseTime}ms</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Last Check</p>
                      <p className="font-semibold">{service.lastCheck}</p>
                    </div>
                    {service.endpoint && (
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {service.dependencies && service.dependencies.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Dependencies</p>
                    <div className="flex items-center gap-2">
                      {service.dependencies.map((dep) => {
                        const depService = services.find(s => s.id === dep)
                        return (
                          <Badge key={dep} variant="outline" className="text-xs">
                            {depService?.name || dep}
                            {depService && getStatusIcon(depService.status)}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </EnhancedCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Active Alerts</h3>
                <p className="text-muted-foreground">All systems are running smoothly</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <EnhancedCard key={alert.id} className={`p-4 ${alert.resolved ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {alert.type === 'error' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : alert.type === 'warning' ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{alert.service}</span>
                        <Badge 
                          variant={alert.resolved ? 'outline' : alert.type === 'error' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {alert.resolved ? 'Resolved' : alert.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {alert.timestamp}
                      </p>
                    </div>
                    
                    {!alert.resolved && (
                      <Button variant="outline" size="sm">
                        Resolve
                      </Button>
                    )}
                  </div>
                </EnhancedCard>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {metrics.map((metric) => (
              <EnhancedCard key={metric.id} className="p-6">
                <h3 className="font-semibold mb-4">{metric.name} Trend</h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold">
                    {metric.value.toFixed(1)}{metric.unit}
                  </span>
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status}
                  </Badge>
                </div>
                
                <div className="h-20 mb-4">
                  {renderMiniChart(metric.history,
                    metric.id === 'cpu' ? 'blue' :
                    metric.id === 'memory' ? 'purple' :
                    metric.id === 'disk' ? 'green' : 'orange'
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Warning Threshold</span>
                    <span>{metric.threshold.warning}{metric.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Critical Threshold</span>
                    <span>{metric.threshold.critical}{metric.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{metric.lastUpdated}</span>
                  </div>
                </div>
              </EnhancedCard>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}