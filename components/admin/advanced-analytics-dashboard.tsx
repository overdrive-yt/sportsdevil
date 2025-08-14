// V9.15: Advanced Analytics Dashboard Component
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Package, 
  CreditCard,
  Activity,
  Clock,
  Eye,
  Star,
  RefreshCw,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter
} from 'lucide-react'
import { EnhancedCard } from '@/components/ui/enhanced-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AnalyticsData {
  revenue: {
    current: number
    previous: number
    growth: number
    trend: number[]
  }
  customers: {
    total: number
    new: number
    returning: number
    churnRate: number
  }
  products: {
    topSelling: Array<{
      name: string
      sales: number
      revenue: number
    }>
    categories: Array<{
      name: string
      percentage: number
      growth: number
    }>
  }
  orders: {
    total: number
    pending: number
    completed: number
    cancelled: number
    averageValue: number
  }
}

export function AdvancedAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: AnalyticsData = {
        revenue: {
          current: 12458,
          previous: 10890,
          growth: 14.4,
          trend: [8500, 9200, 8800, 10500, 11200, 12100, 12458]
        },
        customers: {
          total: 2347,
          new: 234,
          returning: 1890,
          churnRate: 4.2
        },
        products: {
          topSelling: [
            { name: 'Gray-Nicolls Kaboom Pro Cricket Bat', sales: 45, revenue: 4049.55 },
            { name: 'Aero P1 Pro Batting Gloves', sales: 78, revenue: 3119.22 },
            { name: 'Masuri Pro Cricket Helmet', sales: 23, revenue: 1839.77 },
            { name: 'Kookaburra Pro Pads', sales: 34, revenue: 2243.66 },
            { name: 'GM Diamond Cricket Ball Set', sales: 67, revenue: 3015.00 }
          ],
          categories: [
            { name: 'Cricket Bats', percentage: 35, growth: 12.5 },
            { name: 'Protection Gear', percentage: 28, growth: 8.2 },
            { name: 'Wicket Keeping', percentage: 22, growth: 15.7 },
            { name: 'Clothing', percentage: 15, growth: -2.1 }
          ]
        },
        orders: {
          total: 456,
          pending: 23,
          completed: 398,
          cancelled: 35,
          averageValue: 89.50
        }
      }
      
      setAnalyticsData(mockData)
      setIsLoading(false)
    }

    fetchAnalytics()
  }, [selectedPeriod])

  const renderRevenueChart = () => {
    if (!analyticsData) return null
    
    const maxValue = Math.max(...analyticsData.revenue.trend)
    
    return (
      <div className="h-64 flex items-end gap-2 px-4">
        {analyticsData.revenue.trend.map((value, index) => (
          <motion.div
            key={index}
            className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t flex-1 min-w-[8px]"
            initial={{ height: 0 }}
            animate={{ height: `${(value / maxValue) * 100}%` }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          />
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!analyticsData) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600">Comprehensive business insights and metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button 
              variant={selectedPeriod === '7d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedPeriod('7d')}
            >
              7 Days
            </Button>
            <Button 
              variant={selectedPeriod === '30d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedPeriod('30d')}
            >
              30 Days
            </Button>
            <Button 
              variant={selectedPeriod === '90d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedPeriod('90d')}
            >
              90 Days
            </Button>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EnhancedCard className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">£{analyticsData.revenue.current.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-600 rounded-full">
              <span className="text-white font-bold text-xl">£</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">
              +£{(analyticsData.revenue.current - analyticsData.revenue.previous).toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">vs last week</span>
          </div>
        </EnhancedCard>

        <EnhancedCard className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.orders.total}</p>
            </div>
            <div className="p-3 bg-blue-600 rounded-full">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">+23</span>
            <span className="text-sm text-gray-500">vs last week</span>
          </div>
        </EnhancedCard>

        <EnhancedCard className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.customers.total}</p>
            </div>
            <div className="p-3 bg-purple-600 rounded-full">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">+{analyticsData.customers.new}</span>
            <span className="text-sm text-gray-500">new this week</span>
          </div>
        </EnhancedCard>

        <EnhancedCard className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Avg Order Value</p>
              <p className="text-3xl font-bold text-gray-900">£{analyticsData.orders.averageValue}</p>
            </div>
            <div className="p-3 bg-orange-600 rounded-full">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">+£12.50</span>
            <span className="text-sm text-gray-500">vs last week</span>
          </div>
        </EnhancedCard>
      </div>

      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
          <TabsTrigger value="orders">Order Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Revenue Trend</h3>
              <Badge className="bg-green-100 text-green-800">
                +{analyticsData.revenue.growth}% growth
              </Badge>
            </div>
            {renderRevenueChart()}
            <div className="flex justify-between mt-4 text-sm text-gray-500">
              <span>7 days ago</span>
              <span>Today</span>
            </div>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnhancedCard className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Top Selling Products</h3>
              <div className="space-y-4">
                {analyticsData.products.topSelling.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.sales} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">£{product.revenue.toFixed(2)}</p>
                      <Badge variant="outline">#{index + 1}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </EnhancedCard>

            <EnhancedCard className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Category Performance</h3>
              <div className="space-y-4">
                {analyticsData.products.categories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                      <span className="text-sm text-gray-600">{category.percentage}%</span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                    <div className="flex items-center gap-1">
                      {category.growth > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={`text-xs ${category.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {category.growth > 0 ? '+' : ''}{category.growth}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </EnhancedCard>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EnhancedCard className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Customer Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Customers</span>
                  <span className="font-bold text-gray-900">{analyticsData.customers.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">New Customers</span>
                  <span className="font-bold text-green-600">{analyticsData.customers.new}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Returning Customers</span>
                  <span className="font-bold text-blue-600">{analyticsData.customers.returning}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Churn Rate</span>
                  <span className="font-bold text-red-600">{analyticsData.customers.churnRate}%</span>
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Customer Segments</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-800 font-medium">Premium Customers</span>
                  <span className="text-green-900 font-bold">156</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-800 font-medium">Regular Customers</span>
                  <span className="text-blue-900 font-bold">1,890</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-800 font-medium">New Customers</span>
                  <span className="text-gray-900 font-bold">301</span>
                </div>
              </div>
            </EnhancedCard>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EnhancedCard className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Status Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Completed</span>
                  </div>
                  <span className="font-bold text-gray-900">{analyticsData.orders.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600">Pending</span>
                  </div>
                  <span className="font-bold text-gray-900">{analyticsData.orders.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">Cancelled</span>
                  </div>
                  <span className="font-bold text-gray-900">{analyticsData.orders.cancelled}</span>
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Metrics</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-900">£{analyticsData.orders.averageValue}</p>
                  <p className="text-sm text-blue-700">Average Order Value</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-900">{((analyticsData.orders.completed / analyticsData.orders.total) * 100).toFixed(1)}%</p>
                  <p className="text-sm text-green-700">Completion Rate</p>
                </div>
              </div>
            </EnhancedCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}