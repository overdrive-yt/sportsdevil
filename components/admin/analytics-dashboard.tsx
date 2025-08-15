'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  Calendar,
  Download,
  Info,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import MetricCard from './metric-card'
import RevenueChart from './revenue-chart'
import DeviceBreakdown from './device-breakdown'
import PeakTimesHeatmap from './peak-times-heatmap'
import RealTimeStats from './real-time-stats'
import DateRangePicker from './date-range-picker'
import InsightsPanel from './insights-panel'

// V9.11.4: Revolutionary Analytics Dashboard
export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() })
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<any>(null)

  // Mock data for demonstration
  const mockMetrics = {
    revenue: {
      current: 12345.67,
      previous: 10987.23,
      change: 12.3,
      trend: 'up'
    },
    orders: {
      current: 156,
      previous: 144,
      change: 8.2,
      trend: 'up'
    },
    visitors: {
      current: 3421,
      previous: 2975,
      change: 15.1,
      trend: 'up'
    },
    conversionRate: {
      current: 4.5,
      previous: 3.7,
      change: 0.8,
      trend: 'up'
    },
    avgOrderValue: {
      current: 79.14,
      previous: 76.30,
      change: 3.7,
      trend: 'up'
    },
    cartAbandonment: {
      current: 68.2,
      previous: 71.5,
      change: -3.3,
      trend: 'down'
    },
    deviceBreakdown: {
      mobile: 70,
      desktop: 27,
      tablet: 3
    },
    topProducts: [
      { name: 'SS Master 5000 Cricket Bat', sales: 45, revenue: 13499.55 },
      { name: 'SG Test Cricket Helmet', sales: 38, revenue: 3419.62 },
      { name: 'Gray Nicolls Batting Gloves', sales: 32, revenue: 1759.68 }
    ],
    topPages: [
      { page: '/products/cricket-bats', views: 1245, bounceRate: 32.4 },
      { page: '/products/protection', views: 987, bounceRate: 41.2 },
      { page: '/products/wicket-keeping', views: 756, bounceRate: 38.9 }
    ],
    trafficSources: [
      { source: 'Organic Search', visits: 1543, percentage: 45.1 },
      { source: 'Direct', visits: 892, percentage: 26.1 },
      { source: 'Social Media', visits: 645, percentage: 18.8 },
      { source: 'Referral', visits: 341, percentage: 10.0 }
    ]
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMetrics(mockMetrics)
      setLoading(false)
    }, 1000)
  }, [dateRange])

  const exportReport = () => {
    // TODO: Implement export functionality
    console.log('Exporting analytics report...')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <RealTimeStats />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenue"
          value={`£${metrics.revenue.current.toLocaleString()}`}
          change={metrics.revenue.change}
          trend={metrics.revenue.trend}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Orders"
          value={metrics.orders.current}
          change={metrics.orders.change}
          trend={metrics.orders.trend}
          icon={ShoppingCart}
          color="blue"
        />
        <MetricCard
          title="Visitors"
          value={metrics.visitors.current.toLocaleString()}
          change={metrics.visitors.change}
          trend={metrics.visitors.trend}
          icon={Users}
          color="purple"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate.current}%`}
          change={metrics.conversionRate.change}
          trend={metrics.conversionRate.trend}
          icon={Eye}
          color="orange"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Average Order Value"
          value={`£${metrics.avgOrderValue.current.toFixed(2)}`}
          change={metrics.avgOrderValue.change}
          trend={metrics.avgOrderValue.trend}
          icon={DollarSign}
          color="indigo"
        />
        <MetricCard
          title="Cart Abandonment Rate"
          value={`${metrics.cartAbandonment.current}%`}
          change={metrics.cartAbandonment.change}
          trend={metrics.cartAbandonment.trend}
          icon={ShoppingCart}
          color="red"
          invertTrend={true}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart dateRange={dateRange} />
        </div>
        <div>
          <DeviceBreakdown data={metrics.deviceBreakdown} />
        </div>
      </div>

      {/* Peak Times Heatmap */}
      <PeakTimesHeatmap />

      {/* Tabbed Content */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="products">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="products">Top Products</TabsTrigger>
              <TabsTrigger value="pages">Top Pages</TabsTrigger>
              <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6">
              <div className="space-y-4">
                {metrics.topProducts.map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-muted-foreground">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sales} sales
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">£{product.revenue.toFixed(2)}</p>
                      <Badge variant="outline" className="mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pages" className="mt-6">
              <div className="space-y-4">
                {metrics.topPages.map((page: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-muted-foreground">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium font-mono text-sm">{page.page}</p>
                        <p className="text-sm text-muted-foreground">
                          {page.views.toLocaleString()} views
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{page.bounceRate}%</p>
                      <p className="text-xs text-muted-foreground">Bounce Rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sources" className="mt-6">
              <div className="space-y-4">
                {metrics.trafficSources.map((source: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{source.source}</span>
                      <span className="text-sm text-muted-foreground">
                        {source.visits.toLocaleString()} ({source.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Insights Panel */}
      <InsightsPanel metrics={metrics} />
    </div>
  )
}