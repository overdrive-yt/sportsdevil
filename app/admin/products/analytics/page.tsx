import { Suspense } from 'react'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'

import {
  TrendingUp,
  TrendingDown,
  Package,
  Star,
  ShoppingCart,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Clock,
  Zap,
  ArrowLeft,
  Download,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { formatPriceSimple } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Product Performance Analytics | Sports Devil Cricket Admin',
  description: 'Advanced product performance analytics, stock turnover, and cricket equipment insights',
}

interface ProductPerformance {
  id: string
  name: string
  sku: string
  category: string | null
  stockQuantity: number
  price: number
  costPrice: number
  totalSold: number
  totalRevenue: number
  profitMargin: number
  stockTurnover: number
  viewCount: number
  conversionRate: number
  averageRating: number
  reviewCount: number
  lastSale: Date | null
  daysInStock: number
  velocity: number // sales per day
  riskLevel: 'low' | 'medium' | 'high'
  performance: 'excellent' | 'good' | 'average' | 'poor'
}

// Database functions for product performance analytics
async function getProductPerformance() {
  try {
    const products = await prisma.product.findMany({
      include: {
        orderItems: {
          select: { 
            quantity: true, 
            price: true,
            order: {
              select: { 
                createdAt: true, 
                status: true 
              }
            }
          },
          where: {
            order: {
              status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
            }
          }
        },
        reviews: {
          select: { rating: true }
        },
        cartItems: {
          select: { quantity: true }
        }
      }
    })

    const performanceData: ProductPerformance[] = products.map(product => {
      const completedSales = product.orderItems.filter(item => 
        ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(item.order.status)
      )
      
      const totalSold = completedSales.reduce((sum, item) => sum + item.quantity, 0)
      const totalRevenue = completedSales.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
      const costPrice = Number(product.price) * 0.7
      const profitMargin = totalRevenue > 0 ? ((totalRevenue - (totalSold * costPrice)) / totalRevenue) * 100 : 0
      
      // Calculate stock turnover (sales / average stock)
      const avgStock = Math.max(1, (product.stockQuantity + totalSold) / 2)
      const stockTurnover = totalSold / avgStock
      
      // Calculate days in stock
      const createdDate = product.createdAt
      const daysInStock = Math.ceil((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // Calculate velocity (sales per day)
      const velocity = daysInStock > 0 ? totalSold / daysInStock : 0
      
      // Calculate last sale date
      const lastSale = completedSales.length > 0 
        ? new Date(Math.max(...completedSales.map(item => item.order.createdAt.getTime())))
        : null
      
      // Calculate average rating
      const averageRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0
      
      // Mock view count and conversion rate (would come from analytics in real implementation)
      const viewCount = Math.floor(Math.random() * 1000) + totalSold * 10
      const conversionRate = viewCount > 0 ? (totalSold / viewCount) * 100 : 0
      
      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'low'
      if (product.stockQuantity === 0) riskLevel = 'high'
      else if (velocity < 0.1 || stockTurnover < 0.5) riskLevel = 'medium'
      
      // Determine performance level
      let performance: 'excellent' | 'good' | 'average' | 'poor' = 'average'
      if (velocity > 1 && stockTurnover > 2) performance = 'excellent'
      else if (velocity > 0.5 && stockTurnover > 1) performance = 'good'
      else if (velocity < 0.1) performance = 'poor'
      
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: null,
        stockQuantity: product.stockQuantity,
        price: Number(product.price),
        costPrice,
        totalSold,
        totalRevenue,
        profitMargin,
        stockTurnover,
        viewCount,
        conversionRate,
        averageRating,
        reviewCount: product.reviews.length,
        lastSale,
        daysInStock,
        velocity,
        riskLevel,
        performance
      }
    })

    return performanceData.sort((a, b) => b.totalRevenue - a.totalRevenue)
  } catch (error) {
    console.error('Error fetching product performance:', error)
    return []
  }
}

async function getCategoryInsights() {
  try {
    // Temporarily disabled due to schema issues
    return []
    
    /*
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            orderItems: {
              select: { 
                quantity: true, 
                price: true 
              },
              where: {
                order: {
                  status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
                }
              }
            }
          }
        }
      }
    })

    return categories.map(category => {
      const totalProducts = category.products.length
      const activeProducts = category.products.filter(p => p.isActive).length
      const totalStock = category.products.reduce((sum, p) => sum + p.stockQuantity, 0)
      const totalSold = category.products.reduce((sum, p) => 
        sum + p.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      )
      const totalRevenue = category.products.reduce((sum, p) => 
        sum + p.orderItems.reduce((itemSum, item) => itemSum + (Number(item.price) * item.quantity), 0), 0
      )
      
      return {
        name: category.name,
        totalProducts,
        activeProducts,
        totalStock,
        totalSold,
        totalRevenue,
        avgPrice: totalProducts > 0 ? category.products.reduce((sum, p) => sum + Number(p.price), 0) / totalProducts : 0
      }
    }).sort((a, b) => b.totalRevenue - a.totalRevenue)
    */
  } catch (error) {
    console.error('Error fetching category insights:', error)
    return []
  }
}

export default async function ProductAnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const productPerformance = await getProductPerformance()
  const categoryInsights = await getCategoryInsights()

  const performanceStats = {
    excellent: productPerformance.filter(p => p.performance === 'excellent').length,
    good: productPerformance.filter(p => p.performance === 'good').length,
    average: productPerformance.filter(p => p.performance === 'average').length,
    poor: productPerformance.filter(p => p.performance === 'poor').length,
    highRisk: productPerformance.filter(p => p.riskLevel === 'high').length,
    mediumRisk: productPerformance.filter(p => p.riskLevel === 'medium').length,
    lowRisk: productPerformance.filter(p => p.riskLevel === 'low').length
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">🏏 Product Performance Analytics</h1>
              <p className="text-muted-foreground mt-1">
                Advanced analytics for cricket equipment performance and optimization
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{performanceStats.excellent}</div>
              <p className="text-xs text-muted-foreground">
                {performanceStats.good} good performers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">At Risk Products</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{performanceStats.highRisk}</div>
              <p className="text-xs text-muted-foreground">
                {performanceStats.mediumRisk} medium risk
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Turnover</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productPerformance.length > 0 
                  ? (productPerformance.reduce((sum, p) => sum + p.stockTurnover, 0) / productPerformance.length).toFixed(1)
                  : '0'
                }x
              </div>
              <p className="text-xs text-muted-foreground">
                Stock turnover rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Profit Margin</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productPerformance.length > 0 
                  ? (productPerformance.reduce((sum, p) => sum + p.profitMargin, 0) / productPerformance.length).toFixed(1)
                  : '0'
                }%
              </div>
              <p className="text-xs text-muted-foreground">
                Across all products
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Analytics Tabs */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="profitability">Profitability</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Performance Matrix</CardTitle>
                <CardDescription>Sales velocity and stock turnover analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productPerformance.slice(0, 20).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{product.name}</h4>
                          <Badge variant={
                            product.performance === 'excellent' ? 'default' :
                            product.performance === 'good' ? 'secondary' :
                            product.performance === 'average' ? 'outline' : 'destructive'
                          }>
                            {product.performance}
                          </Badge>
                          {product.riskLevel === 'high' && (
                            <Badge variant="destructive">High Risk</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>SKU: {product.sku}</span>
                          <span>•</span>
                          <span>{product.category || 'Uncategorized'}</span>
                          <span>•</span>
                          <span>{product.stockQuantity} in stock</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-sm font-medium">{product.totalSold}</div>
                          <div className="text-xs text-muted-foreground">Sold</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{product.velocity.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">Sales/Day</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{product.stockTurnover.toFixed(1)}x</div>
                          <div className="text-xs text-muted-foreground">Turnover</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{formatPriceSimple(product.totalRevenue)}</div>
                          <div className="text-xs text-muted-foreground">Revenue</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Movement Analysis</CardTitle>
                  <CardDescription>Products by stock turnover rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {productPerformance
                      .sort((a, b) => b.stockTurnover - a.stockTurnover)
                      .slice(0, 10)
                      .map((product) => (
                        <div key={product.id} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.totalSold} sold / {product.stockQuantity} in stock
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{product.stockTurnover.toFixed(1)}x</div>
                            <div className="text-xs text-muted-foreground">turnover</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Slow Moving Inventory</CardTitle>
                  <CardDescription>Products requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {productPerformance
                      .filter(p => p.velocity < 0.1 || p.stockTurnover < 0.5)
                      .slice(0, 10)
                      .map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.daysInStock} days in stock • Last sale: {
                                product.lastSale 
                                  ? new Date(product.lastSale).toLocaleDateString('en-GB')
                                  : 'Never'
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">
                              {product.velocity.toFixed(3)}/day
                            </Badge>
                          </div>
                        </div>
                      ))}
                    {productPerformance.filter(p => p.velocity < 0.1 || p.stockTurnover < 0.5).length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No slow-moving inventory detected.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profitability Tab */}
          <TabsContent value="profitability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profit Margin Analysis</CardTitle>
                <CardDescription>Products by profitability and revenue contribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productPerformance
                    .sort((a, b) => b.profitMargin - a.profitMargin)
                    .slice(0, 15)
                    .map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{product.name}</h4>
                            {product.profitMargin > 50 && (
                              <Badge variant="default">High Margin</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Cost: {formatPriceSimple(product.costPrice)} • 
                            Price: {formatPriceSimple(product.price)}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-sm font-medium text-green-600">
                              {product.profitMargin.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Margin</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              {formatPriceSimple(product.totalRevenue)}
                            </div>
                            <div className="text-xs text-muted-foreground">Revenue</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              {formatPriceSimple(product.totalRevenue - (product.totalSold * product.costPrice))}
                            </div>
                            <div className="text-xs text-muted-foreground">Profit</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Performance Overview</CardTitle>
                <CardDescription>Cricket equipment category analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoryInsights.length === 0 ? (
                    <div className="col-span-2 text-center text-muted-foreground py-8">
                      Category insights temporarily disabled
                    </div>
                  ) : categoryInsights.map((category: any) => (
                    <div key={category.name} className="space-y-4 p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{category.name}</h4>
                        <Badge variant="outline">{category.totalProducts} products</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Revenue:</span>
                          <span className="font-medium">{formatPriceSimple(category.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Units Sold:</span>
                          <span>{category.totalSold}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Avg Price:</span>
                          <span>{formatPriceSimple(category.avgPrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Active Products:</span>
                          <span>{category.activeProducts}/{category.totalProducts}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Performance</span>
                          <span>{((category.totalSold / Math.max(1, category.totalStock)) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={Math.min(100, (category.totalSold / Math.max(1, category.totalStock)) * 100)} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>Key findings and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">Top Performers</h4>
                        <p className="text-sm text-muted-foreground">
                          {performanceStats.excellent} products showing excellent performance with high velocity and turnover.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">Attention Required</h4>
                        <p className="text-sm text-muted-foreground">
                          {performanceStats.poor} products with poor performance need inventory review or marketing support.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">Optimization Opportunity</h4>
                        <p className="text-sm text-muted-foreground">
                          Focus on high-margin, fast-moving cricket equipment to maximize profitability.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Trends</CardTitle>
                  <CardDescription>Cricket equipment seasonal patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Cricket Season Impact</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• Peak sales expected March-September (cricket season)</p>
                        <p>• Pre-season preparation drives equipment sales in Feb-Mar</p>
                        <p>• Junior cricket equipment peaks during school terms</p>
                        <p>• Indoor cricket accessories popular in winter months</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Recommended Actions</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>• Increase cricket bat inventory before March</p>
                        <p>• Promote protective gear during peak season</p>
                        <p>• Focus on indoor equipment in off-season</p>
                        <p>• Plan clearance sales for slow-moving items</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Sports Devil Product Excellence */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                🏏 Sports Devil Product Excellence - Advanced Cricket Equipment Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
                <div>
                  <h4 className="font-medium mb-2">Performance Analytics</h4>
                  <ul className="space-y-1">
                    <li>• Advanced stock turnover analysis for cricket equipment</li>
                    <li>• Sales velocity tracking across all product categories</li>
                    <li>• Profitability optimization through data-driven insights</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Cricket Equipment Expertise</h4>
                  <ul className="space-y-1">
                    <li>• Seasonal demand forecasting for cricket gear</li>
                    <li>• Category performance analysis (bats, pads, accessories)</li>
                    <li>• Inventory risk assessment and optimization strategies</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Birmingham Market Intelligence</h4>
                  <ul className="space-y-1">
                    <li>• 📍 309 Kingstanding Rd, Birmingham B44 9TH</li>
                    <li>• Local cricket market trends and insights</li>
                    <li>• Community-driven product performance analytics</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}