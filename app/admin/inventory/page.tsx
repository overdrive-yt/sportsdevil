import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Minus,
  Edit,
  Eye,
  BarChart3,
  Truck,
  ShoppingCart,
  Target,
  Shield,
  Zap,
  Clock,
  Activity,
  DollarSign,
  PieChart
} from 'lucide-react'
import Link from 'next/link'
import { formatPriceSimple } from '@/lib/utils'

// Database functions for inventory management
async function getInventoryData() {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: {
          select: { url: true, alt: true },
          take: 1,
          orderBy: { sortOrder: 'asc' }
        },
        orderItems: {
          select: { quantity: true },
          where: {
            order: {
              status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
            }
          }
        },
        cartItems: {
          select: { quantity: true }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { stockQuantity: 'asc' },
        { name: 'asc' }
      ]
    })

    const inventoryData = products.map((product) => {
      const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
      const reservedStock = product.cartItems.reduce((sum, item) => sum + item.quantity, 0)
      const lowStockThreshold = 5 // Default low stock threshold

      const stockStatus = product.stockQuantity === 0 ? 'out_of_stock' :
                         product.stockQuantity <= lowStockThreshold ? 'low_stock' :
                         product.stockQuantity > lowStockThreshold * 3 ? 'overstock' : 'in_stock'

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: 'Cricket Equipment',
        currentStock: product.stockQuantity,
        reservedStock,
        availableStock: Math.max(0, product.stockQuantity - reservedStock),
        reorderLevel: lowStockThreshold,
        costPrice: Number(product.price) * 0.7, // Estimate 70% of selling price
        sellingPrice: Number(product.price),
        isActive: product.isActive,
        lastRestocked: product.updatedAt, // Use last update as restock date
        totalSold,
        status: stockStatus,
        profitMargin: ((Number(product.price) - Number(product.price) * 0.7) / (Number(product.price) * 0.7) * 100),
        images: product.images,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    })

    // Calculate inventory statistics  
    const stats = {
      totalProducts: inventoryData.length,
      activeProducts: inventoryData.filter(p => p.isActive).length,
      inStock: inventoryData.filter(p => p.status === 'in_stock').length,
      lowStock: inventoryData.filter(p => p.status === 'low_stock').length,
      outOfStock: inventoryData.filter(p => p.status === 'out_of_stock').length,
      overstock: inventoryData.filter(p => p.status === 'overstock').length,
      totalUnits: inventoryData.reduce((sum, p) => sum + p.currentStock, 0),
      totalValue: inventoryData.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0),
      reservedUnits: inventoryData.reduce((sum, p) => sum + p.reservedStock, 0),
      avgProfitMargin: inventoryData.reduce((sum, p) => sum + p.profitMargin, 0) / inventoryData.length
    }

    return { products: inventoryData, stats }
  } catch (error) {
    console.error('Error fetching inventory data:', error)
    return null
  }
}

async function getInventoryAnalytics() {
  try {
    // Get recent sales data for analytics
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        },
        status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: { name: true }
            }
          }
        }
      }
    })

    // Calculate category performance
    const categoryPerformance = new Map()
    const productPerformance = new Map()
    let totalRevenue = 0

    recentOrders.forEach(order => {
      totalRevenue += Number(order.totalAmount)
      order.orderItems.forEach(item => {
        const categoryName = 'Cricket Equipment' // Default category
        const productName = item.product.name
        
        // Category analytics
        if (!categoryPerformance.has(categoryName)) {
          categoryPerformance.set(categoryName, { sales: 0, revenue: 0, units: 0 })
        }
        const catData = categoryPerformance.get(categoryName)
        catData.sales += 1
        catData.revenue += Number(item.price) * item.quantity
        catData.units += item.quantity

        // Product analytics
        if (!productPerformance.has(productName)) {
          productPerformance.set(productName, { sales: 0, revenue: 0, units: 0 })
        }
        const prodData = productPerformance.get(productName)
        prodData.sales += 1
        prodData.revenue += Number(item.price) * item.quantity
        prodData.units += item.quantity
      })
    })

    return {
      totalRevenue,
      totalOrders: recentOrders.length,
      categoryPerformance: Array.from(categoryPerformance.entries()).map(([name, data]) => ({
        name,
        ...data
      })).sort((a, b) => b.revenue - a.revenue),
      topProducts: Array.from(productPerformance.entries()).map(([name, data]) => ({
        name,
        ...data
      })).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return {
      totalRevenue: 0,
      totalOrders: 0,
      categoryPerformance: [],
      topProducts: []
    }
  }
}

const CATEGORY_ICONS = {
  'Cricket Bats': Target,
  'Batting Pads': Shield,
  'Batting Gloves': Zap,
  'Helmets': Shield,
  'Cricket Bags': Package,
  'Accessories': Package,
  'Cricket Balls': Package,
  'Uncategorized': Package
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'in_stock': return 'secondary'
    case 'low_stock': return 'destructive'
    case 'out_of_stock': return 'outline'
    case 'overstock': return 'default'
    default: return 'outline'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'in_stock': return <Package className="h-4 w-4 text-green-600" />
    case 'low_stock': return <AlertTriangle className="h-4 w-4 text-orange-600" />
    case 'out_of_stock': return <AlertTriangle className="h-4 w-4 text-red-600" />
    case 'overstock': return <TrendingUp className="h-4 w-4 text-blue-600" />
    default: return <Package className="h-4 w-4 text-gray-600" />
  }
}

export default async function InventoryManagementPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const inventoryData = await getInventoryData()
  const analytics = await getInventoryAnalytics()

  if (!inventoryData) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load inventory data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const { products, stats } = inventoryData

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
              <h1 className="text-3xl font-bold tracking-tight">Cricket Equipment Inventory</h1>
              <p className="text-muted-foreground mt-1">
                Real-time inventory management for Sports Devil cricket equipment
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Inventory
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Stock
            </Button>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>

        {/* Inventory Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPriceSimple(stats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalUnits} total units
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.lowStock + stats.outOfStock}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.lowStock} low, {stats.outOfStock} out
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Stock</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalUnits - stats.reservedUnits}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.reservedUnits} reserved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Product Categories</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeProducts} active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Management Tabs */}
        <Tabs defaultValue="all-inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all-inventory">All Inventory</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock ({stats.lowStock})</TabsTrigger>
            <TabsTrigger value="out-of-stock">Out of Stock ({stats.outOfStock})</TabsTrigger>
            <TabsTrigger value="overstock">Overstock ({stats.overstock})</TabsTrigger>
            <TabsTrigger value="reorder">Reorder Report</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search by product name, SKU, brand, or location..." 
                    className="pl-10"
                  />
                </div>
                
                <Select defaultValue="all">
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="bats">Cricket Bats</SelectItem>
                    <SelectItem value="pads">Batting Pads</SelectItem>
                    <SelectItem value="gloves">Batting Gloves</SelectItem>
                    <SelectItem value="helmets">Helmets</SelectItem>
                    <SelectItem value="bags">Cricket Bags</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select defaultValue="all">
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="overstock">Overstock</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* All Inventory Tab */}
          <TabsContent value="all-inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cricket Equipment Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((item) => {
                    const CategoryIcon = CATEGORY_ICONS[item.category as keyof typeof CATEGORY_ICONS] || Package
                    
                    return (
                      <div key={item.id} className="border rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-900">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Product Info */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                              <h3 className="font-semibold">{item.name}</h3>
                              <Badge variant={getStatusBadgeVariant(item.status)}>
                                {item.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>SKU: {item.sku}</span>
                              <span>•</span>
                              <span>{item.category}</span>
                              <span>•</span>
                              <span>{item.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                          </div>
                          
                          {/* Stock Levels */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold">{item.currentStock}</div>
                              <div className="text-xs text-muted-foreground">Current</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-green-600">{item.availableStock}</div>
                              <div className="text-xs text-muted-foreground">Available</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-orange-600">{item.reservedStock}</div>
                              <div className="text-xs text-muted-foreground">Reserved</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-red-600">{item.reorderLevel}</div>
                              <div className="text-xs text-muted-foreground">Reorder</div>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Plus className="h-4 w-4 mr-1" />
                              Restock
                            </Button>
                          </div>
                        </div>
                        
                        {/* Financial & Movement Info */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">Pricing</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Cost:</span>
                                <span>{formatPriceSimple(item.costPrice)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Selling:</span>
                                <span className="font-medium">{formatPriceSimple(item.sellingPrice)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Margin:</span>
                                <span className="text-green-600">{item.profitMargin.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">Stock Movement</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total sold:</span>
                                <span>{item.totalSold} units</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Last restocked:</span>
                                <span>{item.lastRestocked ? new Date(item.lastRestocked).toLocaleDateString('en-GB') : 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Created:</span>
                                <span>{new Date(item.createdAt).toLocaleDateString('en-GB')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">Product Details</h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex justify-between">
                                <span>Status:</span>
                                <span className={item.isActive ? 'text-green-600' : 'text-red-600'}>
                                  {item.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Updated:</span>
                                <span>{new Date(item.updatedAt).toLocaleDateString('en-GB')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Stock Value:</span>
                                <span>{formatPriceSimple(item.currentStock * item.costPrice)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Low Stock Tab */}
          <TabsContent value="low-stock">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Low Stock Alert ({stats.lowStock})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.filter(p => p.status === 'low_stock').length > 0 ? (
                    products.filter(p => p.status === 'low_stock').map(product => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 dark:bg-orange-950">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.currentStock} remaining • Reorder at {product.reorderLevel}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">{product.status.replace('_', ' ')}</Badge>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Restock
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No products currently have low stock levels.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reorder Report Tab */}
          <TabsContent value="reorder">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Reorder Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Urgent Reorders (Out of Stock)</h4>
                      <div className="space-y-2">
                        {products.filter(item => item.status === 'out_of_stock').map(item => (
                          <div key={item.id} className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-950 rounded">
                            <span className="text-sm">{item.name}</span>
                            <Button size="sm" variant="outline">
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Urgent Restock
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Recommended Reorders (Low Stock)</h4>
                      <div className="space-y-2">
                        {products.filter(item => item.status === 'low_stock').map(item => (
                          <div key={item.id} className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-950 rounded">
                            <span className="text-sm">{item.name}</span>
                            <Button size="sm" variant="outline">
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Restock {item.reorderLevel * 2} units
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium">Stock Status Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>In Stock</span>
                        </div>
                        <span>{stats.inStock}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span>Low Stock</span>
                        </div>
                        <span>{stats.lowStock}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>Out of Stock</span>
                        </div>
                        <span>{stats.outOfStock}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Overstock</span>
                        </div>
                        <span>{stats.overstock}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Category Performance (30 days)</h4>
                    <div className="space-y-1 text-sm">
                      {analytics.categoryPerformance.slice(0, 5).map(category => (
                        <div key={category.name} className="flex justify-between">
                          <span>{category.name}:</span>
                          <span>{category.units} sold, {formatPriceSimple(category.revenue)}</span>
                        </div>
                      ))}
                      {analytics.categoryPerformance.length === 0 && (
                        <p className="text-muted-foreground">No sales data yet</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Financial Overview</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total inventory value:</span>
                        <span>{formatPriceSimple(stats.totalValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average margin:</span>
                        <span>{stats.avgProfitMargin.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>30-day revenue:</span>
                        <span>{formatPriceSimple(analytics.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Top Products (30 days)</h4>
                    <div className="space-y-1 text-sm">
                      {analytics.topProducts.slice(0, 5).map((product, index) => (
                        <div key={product.name} className="flex justify-between">
                          <span className="truncate">{index + 1}. {product.name}:</span>
                          <span>{product.units} sold</span>
                        </div>
                      ))}
                      {analytics.topProducts.length === 0 && (
                        <p className="text-muted-foreground">No sales data yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sports Devil Cricket Equipment Focus */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                🏏 Sports Devil Inventory Excellence - Birmingham Cricket Equipment Specialists
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
                <div>
                  <h4 className="font-medium mb-2">Inventory Management Excellence</h4>
                  <ul className="space-y-1">
                    <li>• Real-time stock tracking across all categories</li>
                    <li>• Automated reorder alerts for cricket equipment</li>
                    <li>• Seasonal demand forecasting for cricket season</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Cricket Equipment Expertise</h4>
                  <ul className="space-y-1">
                    <li>• Specialized storage for cricket bats and equipment</li>
                    <li>• Climate-controlled environment for willow bats</li>
                    <li>• Quick access layout for popular cricket items</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Birmingham Operations</h4>
                  <ul className="space-y-1">
                    <li>• 📍 309 Kingstanding Rd, Birmingham B44 9TH</li>
                    <li>• Local cricket club partnerships for bulk orders</li>
                    <li>• Same-day availability for urgent cricket needs</li>
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