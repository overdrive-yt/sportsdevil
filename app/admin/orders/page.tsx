import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Eye, 
  Truck, 
  Mail, 
  MoreHorizontal, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  TrendingUp,
  Calendar,
  Phone
} from 'lucide-react'
import Link from 'next/link'

// Enhanced mock order data with cricket equipment details
const mockOrders = [
  {
    id: 'SD-1234567890-ABC',
    customer: 'John Smith',
    email: 'john.smith@example.com',
    phone: '07123456789',
    total: 189.99,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    items: [
      { name: 'Gray-Nicolls Kaboom Warner Cricket Bat', quantity: 1, price: 189.99, category: 'bats' }
    ],
    itemCount: 1,
    date: '2025-01-01T10:30:00Z',
    shippingAddress: '123 Cricket Lane, Birmingham B10 0TT, UK',
    trackingNumber: 'GB1234567890',
    carrier: 'Royal Mail',
    estimatedDelivery: '2025-01-03',
    notes: 'Customer requested express delivery for match'
  },
  {
    id: 'SD-2345678901-DEF', 
    customer: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '07234567890',
    total: 234.98,
    status: 'SHIPPED',
    paymentStatus: 'PAID',
    items: [
      { name: 'Kookaburra Ghost Pro Batting Pads', quantity: 1, price: 89.99, category: 'pads' },
      { name: 'New Balance TC 860 Batting Gloves', quantity: 1, price: 45.99, category: 'gloves' },
      { name: 'Spartan MC Club Kit Bag', quantity: 1, price: 98.99, category: 'bags' }
    ],
    itemCount: 3,
    date: '2024-12-30T14:15:00Z',
    shippingAddress: '45 Lords Road, London SW19 5AE, UK',
    trackingNumber: 'GB2345678901',
    carrier: 'DPD',
    estimatedDelivery: '2025-01-02',
    notes: ''
  },
  {
    id: 'SD-3456789012-GHI',
    customer: 'Mike Brown', 
    email: 'mike.brown@example.com',
    phone: '07345678901',
    total: 156.50,
    status: 'PROCESSING',
    paymentStatus: 'PAID',
    items: [
      { name: 'GM Icon F2 DXM 404 Cricket Bat', quantity: 1, price: 156.50, category: 'bats' }
    ],
    itemCount: 1,
    date: '2024-12-29T09:45:00Z',
    shippingAddress: '78 Old Trafford Way, Manchester M16 7SX, UK',
    trackingNumber: null,
    carrier: null,
    estimatedDelivery: '2025-01-04',
    notes: 'Awaiting stock confirmation for custom grip'
  },
  {
    id: 'SD-4567890123-JKL',
    customer: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    phone: '07456789012',
    total: 345.97,
    status: 'PENDING',
    paymentStatus: 'PAID',
    items: [
      { name: 'Masuri Original Series MK2 Helmet', quantity: 1, price: 125.00, category: 'helmets' },
      { name: 'Gray-Nicolls Predator3 900 Batting Pads', quantity: 1, price: 129.99, category: 'pads' },
      { name: 'Kookaburra Beast Pro Batting Gloves', quantity: 1, price: 89.98, category: 'gloves' }
    ],
    itemCount: 3,
    date: '2025-01-01T16:20:00Z',
    shippingAddress: '12 County Ground Close, Edgbaston B5 7QU, UK',
    trackingNumber: null,
    carrier: null,
    estimatedDelivery: '2025-01-05',
    notes: 'First order - new customer welcome package included'
  },
  {
    id: 'SD-5678901234-MNO',
    customer: 'David Taylor',
    email: 'david.taylor@example.com',
    phone: '07567890123',
    total: 89.99,
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    items: [
      { name: 'SG RSD Prolite Cricket Bat Grips', quantity: 2, price: 12.99, category: 'accessories' },
      { name: 'Gray-Nicolls Anti-Scuff Bat Protection', quantity: 1, price: 15.99, category: 'accessories' },
      { name: 'Kookaburra Kahuna Pro Batting Gloves', quantity: 1, price: 61.01, category: 'gloves' }
    ],
    itemCount: 4,
    date: '2024-12-27T11:30:00Z',
    shippingAddress: '89 Oval Drive, Kennington SE11 5SS, UK',
    trackingNumber: 'GB5678901234',
    carrier: 'Royal Mail',
    estimatedDelivery: '2024-12-30',
    notes: 'Delivered successfully - customer confirmed receipt'
  }
]

const ORDER_STATS = {
  totalOrders: mockOrders.length,
  pending: mockOrders.filter(o => o.status === 'PENDING').length,
  processing: mockOrders.filter(o => o.status === 'PROCESSING').length,
  shipped: mockOrders.filter(o => o.status === 'SHIPPED').length,
  delivered: mockOrders.filter(o => o.status === 'DELIVERED').length,
  totalRevenue: mockOrders.reduce((sum, o) => sum + o.total, 0),
  averageOrderValue: mockOrders.reduce((sum, o) => sum + o.total, 0) / mockOrders.length
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING': return <Clock className="h-4 w-4 text-orange-600" />
    case 'CONFIRMED': return <CheckCircle className="h-4 w-4 text-blue-600" />
    case 'PROCESSING': return <Package className="h-4 w-4 text-yellow-600" />
    case 'SHIPPED': return <Truck className="h-4 w-4 text-purple-600" />
    case 'DELIVERED': return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'CANCELLED': return <XCircle className="h-4 w-4 text-red-600" />
    default: return <AlertCircle className="h-4 w-4 text-gray-600" />
  }
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'PENDING': return 'secondary'
    case 'CONFIRMED': return 'default'
    case 'PROCESSING': return 'outline'
    case 'SHIPPED': return 'secondary'
    case 'DELIVERED': return 'secondary'
    case 'CANCELLED': return 'destructive'
    default: return 'outline'
  }
}

export default async function OrderManagementPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
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
              <h1 className="text-3xl font-bold tracking-tight">Order & Inventory Operations</h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive order management and cricket equipment inventory control
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Orders
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Order Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ORDER_STATS.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                All time orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Processing</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {ORDER_STATS.pending + ORDER_STATS.processing}
              </div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{ORDER_STATS.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From {ORDER_STATS.totalOrders} orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{ORDER_STATS.averageOrderValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Per order average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Order Management Tabs */}
        <Tabs defaultValue="all-orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all-orders">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending ({ORDER_STATS.pending})</TabsTrigger>
            <TabsTrigger value="processing">Processing ({ORDER_STATS.processing})</TabsTrigger>
            <TabsTrigger value="shipped">Shipped ({ORDER_STATS.shipped})</TabsTrigger>
            <TabsTrigger value="delivered">Delivered ({ORDER_STATS.delivered})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search orders by ID, customer name, email, or phone..." 
                    className="pl-10"
                  />
                </div>
                
                <Select defaultValue="all">
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select defaultValue="all">
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* All Orders Tab */}
          <TabsContent value="all-orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-900">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Order Header */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(order.status)}
                            <h3 className="font-semibold">{order.id}</h3>
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {order.status}
                            </Badge>
                            <Badge variant="outline">{order.paymentStatus}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(order.date).toLocaleDateString('en-GB')}
                            </span>
                            <span>£{order.total}</span>
                            <span>{order.itemCount} items</span>
                          </div>
                        </div>
                        
                        {/* Order Actions */}
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Truck className="h-4 w-4 mr-1" />
                            Ship
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Customer & Shipping Info */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Customer Details</h4>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">{order.customer}</p>
                            <p>{order.email}</p>
                            <p className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {order.phone}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Shipping & Tracking</h4>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>{order.shippingAddress}</p>
                            {order.trackingNumber && (
                              <p className="flex items-center gap-1">
                                <Truck className="h-3 w-3" />
                                {order.carrier}: {order.trackingNumber}
                              </p>
                            )}
                            <p>Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-GB')}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Order Items */}
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-sm mb-2">Order Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                                <span>{item.name}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-muted-foreground">Qty: {item.quantity}</span>
                                <span className="font-medium">£{item.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {order.notes && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded text-sm">
                            <strong>Note:</strong> {order.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other status tabs would filter the orders by status */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Orders ({ORDER_STATS.pending})</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Orders awaiting confirmation and processing...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Order Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Order Status Distribution</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Pending:</span>
                          <span>{ORDER_STATS.pending}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Processing:</span>
                          <span>{ORDER_STATS.processing}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipped:</span>
                          <span>{ORDER_STATS.shipped}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivered:</span>
                          <span>{ORDER_STATS.delivered}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Cricket Equipment Categories</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Most popular categories in recent orders</p>
                        <p>• Cricket Bats: 3 orders</p>
                        <p>• Batting Equipment: 5 orders</p>
                        <p>• Protection Gear: 2 orders</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Performance Metrics</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Avg Processing Time:</span>
                          <span>2.3 days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Customer Satisfaction:</span>
                          <span>98.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>On-time Delivery:</span>
                          <span>96.2%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Cricket Equipment Focus */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                🏏 Sports Devil Order Operations - Birmingham Cricket Equipment Specialists
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
                <div>
                  <h4 className="font-medium mb-2">Order Processing Excellence</h4>
                  <ul className="space-y-1">
                    <li>• Same-day processing for in-stock items</li>
                    <li>• Expert cricket equipment handling</li>
                    <li>• Custom grip and personalization services</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">UK Delivery Network</h4>
                  <ul className="space-y-1">
                    <li>• Free delivery over £50 across UK</li>
                    <li>• Express delivery for urgent matches</li>
                    <li>• Secure packaging for cricket equipment</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Customer Support</h4>
                  <ul className="space-y-1">
                    <li>• Cricket equipment specialists available</li>
                    <li>• 📞 07897813165 for urgent orders</li>
                    <li>• 📍 309 Kingstanding Rd, Birmingham</li>
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