import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Badge } from '../../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { 
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  TrendingUp,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Mock product data - would come from database
const mockProducts = [
  {
    id: 1,
    name: 'Gray-Nicolls Kaboom Warner Cricket Bat',
    sku: 'GN-KBM-WRN-01',
    category: 'bats',
    brand: 'Gray-Nicolls',
    price: 189.99,
    comparePrice: 229.99,
    stock: 12,
    status: 'active',
    featured: true,
    image: '/api/placeholder/150/150',
    colors: ['Red', 'Black'],
    attributes: {
      size: 'Men\'s',
      weight: '2lb 8oz',
      wood_type: 'English Willow'
    },
    sales: 45,
    created: '2025-01-01'
  },
  {
    id: 2,
    name: 'GM Icon F2 DXM 404 Cricket Bat',
    sku: 'GM-ICN-F2-404',
    category: 'bats',
    brand: 'Gunn & Moore',
    price: 165.00,
    comparePrice: null,
    stock: 8,
    status: 'active',
    featured: false,
    image: '/api/placeholder/150/150',
    colors: ['Natural', 'Blue'],
    attributes: {
      size: 'Men\'s',
      weight: '2lb 7oz',
      wood_type: 'English Willow'
    },
    sales: 32,
    created: '2024-12-28'
  },
  {
    id: 3,
    name: 'Kookaburra Ghost Pro Players Batting Pads',
    sku: 'KB-GST-PP-01',
    category: 'pads',
    brand: 'Kookaburra',
    price: 89.99,
    comparePrice: 109.99,
    stock: 3,
    status: 'active',
    featured: true,
    image: '/api/placeholder/150/150',
    colors: ['White', 'Navy'],
    attributes: {
      size: 'Men\'s',
      style: 'Lightweight',
      protection_level: 'International'
    },
    sales: 23,
    created: '2024-12-25'
  },
  {
    id: 4,
    name: 'New Balance TC 860 Batting Gloves',
    sku: 'NB-TC-860-BG',
    category: 'gloves',
    brand: 'New Balance',
    price: 45.99,
    comparePrice: null,
    stock: 0,
    status: 'active',
    featured: false,
    image: '/api/placeholder/150/150',
    colors: ['White', 'Black', 'Blue'],
    attributes: {
      size: 'Large',
      style: 'Modern',
      palm_material: 'Leather'
    },
    sales: 67,
    created: '2024-12-20'
  },
  {
    id: 5,
    name: 'Masuri Original Series MK2 Test Helmet',
    sku: 'MSR-OS-MK2-TH',
    category: 'helmets',
    brand: 'Masuri',
    price: 125.00,
    comparePrice: 149.99,
    stock: 15,
    status: 'draft',
    featured: false,
    image: '/api/placeholder/150/150',
    colors: ['Navy', 'Maroon'],
    attributes: {
      size: 'Medium',
      standard: 'BS7928:2013',
      grill_type: 'Titanium'
    },
    sales: 0,
    created: '2025-01-01'
  }
]

const CATEGORY_LABELS = {
  bats: 'Cricket Bats',
  pads: 'Batting Pads', 
  gloves: 'Batting Gloves',
  helmets: 'Helmets',
  bags: 'Cricket Bags',
  accessories: 'Accessories'
}

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-gray-100 text-gray-800'
}

export default async function ProductsManagementPage() {
  const session = await getServerSession(authOptions)
  
  // Check if user is admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const totalProducts = mockProducts.length
  const activeProducts = mockProducts.filter(p => p.status === 'active').length
  const lowStockProducts = mockProducts.filter(p => p.stock <= 5 && p.status === 'active').length
  const outOfStockProducts = mockProducts.filter(p => p.stock === 0 && p.status === 'active').length

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
              <h1 className="text-3xl font-bold tracking-tight">Cricket Equipment Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage your cricket product inventory and listings
              </p>
            </div>
          </div>
          
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {activeProducts} active products
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockProducts.reduce((sum, p) => sum + p.sales, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Units sold this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockProducts}</div>
              <p className="text-xs text-muted-foreground">
                Products need restocking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
              <p className="text-xs text-muted-foreground">
                Products unavailable
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search products by name, SKU, or brand..." 
                  className="pl-10"
                />
              </div>
              
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm truncate">{product.name}</h3>
                          {product.featured && (
                            <Badge variant="secondary" className="text-xs">Featured</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>SKU: {product.sku}</span>
                          <span>•</span>
                          <span>{CATEGORY_LABELS[product.category as keyof typeof CATEGORY_LABELS]}</span>
                          <span>•</span>
                          <span>{product.brand}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium">Colors:</span>
                          {product.colors.map((color, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {color}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Price & Stock */}
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">£{product.price}</span>
                          {product.comparePrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              £{product.comparePrice}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            product.stock === 0 ? 'bg-red-100 text-red-800' :
                            product.stock <= 5 ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            Stock: {product.stock}
                          </span>
                          <Badge className={STATUS_COLORS[product.status as keyof typeof STATUS_COLORS]}>
                            {product.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <Package className="h-4 w-4 mr-2" />
                Bulk Update Stock
              </Button>
              <Button variant="outline" className="justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Export Product Data
              </Button>
              <Button variant="outline" className="justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Restock Alerts
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cricket Equipment Categories */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                🏏 Cricket Equipment Categories
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                  const categoryCount = mockProducts.filter(p => p.category === key).length
                  return (
                    <div key={key} className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="font-medium text-sm">{label}</div>
                      <div className="text-xs text-muted-foreground">{categoryCount} products</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}