// V9.14: Simplified Dashboard Interface for Family Members - White Theme
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  Calendar,
  Bell,
  Eye,
  MessageCircle,
  Heart,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Activity,
  DollarSign,
  BarChart3,
  Globe,
  Plus,
  Trash2,
  Edit
} from 'lucide-react'
import { EnhancedCard } from '@/components/ui/enhanced-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

interface SimpleDashboardData {
  todayStats: {
    orders: number
    revenue: number
    visitors: number
    messages: number
  }
  recentOrders: Array<{
    id: string
    customer: string
    amount: number
    status: 'pending' | 'processing' | 'completed' | 'cancelled'
    time: string
    items: string[]
  }>
  quickActions: Array<{
    title: string
    description: string
    icon: any
    action: () => void
    color: string
  }>
  socialActivity: {
    instagram: {
      followers: number
      likes: number
      comments: number
      posts: number
    }
    facebook: {
      followers: number
      likes: number
      comments: number
      posts: number
    }
  }
  systemStatus: {
    website: 'online' | 'maintenance' | 'offline'
    orders: 'processing' | 'delayed' | 'paused'
    inventory: 'good' | 'low' | 'critical'
    payments: 'active' | 'issues' | 'offline'
  }
}

export function SimpleDashboard() {
  const [data, setData] = useState<SimpleDashboardData | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [socialData, setSocialData] = useState<any>(null)
  const [isLoadingSocial, setIsLoadingSocial] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'Cricket Bats'
  })

  // Fetch recent products from database
  const fetchRecentProducts = async () => {
    try {
      setIsLoadingProducts(true)
      const response = await fetch('/api/products/recent?limit=4')
      if (response.ok) {
        try {
          const result = await response.json()
          if (result && result.data) {
            setRecentProducts(result.data)
          }
        } catch (parseError) {
          console.error('Failed to parse products response:', parseError)
        }
      } else {
        console.error('Products API request failed:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch recent products:', error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  // Fetch social media data from real API
  const fetchSocialData = async () => {
    try {
      setIsLoadingSocial(true)
      const response = await fetch('/api/social-media?action=dashboard')
      if (response.ok) {
        try {
          const result = await response.json()
          if (result && result.data) {
            setSocialData(result.data)
          }
        } catch (parseError) {
          console.error('Failed to parse social media response:', parseError)
        }
      } else {
        console.error('Social media API request failed:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch social media data:', error)
      // Fallback data
      setSocialData({
        platformMetrics: [
          {
            platform: 'instagram',
            followers: 12500,
            avgLikes: 450,
            avgComments: 23,
            postsThisWeek: 3
          },
          {
            platform: 'facebook',
            followers: 8900,
            avgLikes: 210,
            avgComments: 15,
            postsThisWeek: 2
          }
        ]
      })
    } finally {
      setIsLoadingSocial(false)
    }
  }

  // Delete product function
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?\n\nThis action cannot be undone. If the product has orders or is in shopping carts, it will be deactivated instead.`)) {
      return
    }

    try {
      setDeletingProductId(productId)
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })
      
      let result
      try {
        result = await response.json()
      } catch (parseError) {
        console.error('Failed to parse delete product response:', parseError)
        alert('Failed to delete product: Invalid response format')
        return
      }
      
      if (result && result.success) {
        if (result.deactivated) {
          alert(`Product "${productName}" has been deactivated because it has existing orders or cart items.`)
        } else {
          alert(`Product "${productName}" has been deleted successfully.`)
        }
        // Refresh the products list
        fetchRecentProducts()
      } else {
        alert(`Failed to delete product: ${result.error}`)
      }
    } catch (error) {
      console.error('Delete product failed:', error)
      alert('Failed to delete product. Please try again.')
    } finally {
      setDeletingProductId(null)
    }
  }

  useEffect(() => {
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Fetch recent products and social data
    fetchRecentProducts()
    fetchSocialData()

    // Initialize with mock data
    const mockData: SimpleDashboardData = {
      todayStats: {
        orders: 12,
        revenue: 1450,
        visitors: 324,
        messages: 5
      },
      recentOrders: [
        {
          id: 'ORD-2024-001',
          customer: 'James Wilson',
          amount: 159.99,
          status: 'completed',
          time: '2 hours ago',
          items: ['Professional Cricket Bat', 'Batting Gloves']
        },
        {
          id: 'ORD-2024-002',
          customer: 'Sarah Johnson',
          amount: 89.50,
          status: 'processing',
          time: '4 hours ago',
          items: ['Cricket Helmet']
        },
        {
          id: 'ORD-2024-003',
          customer: 'Mike Davis',
          amount: 245.00,
          status: 'pending',
          time: '6 hours ago',
          items: ['Wicket Keeping Pads', 'Batting Pads']
        },
        {
          id: 'ORD-2024-004',
          customer: 'Emma Thompson',
          amount: 75.99,
          status: 'completed',
          time: '8 hours ago',
          items: ['Cricket Ball Set']
        }
      ],
      quickActions: [
        {
          title: 'View Orders',
          description: 'Check new orders and customer requests',
          icon: ShoppingCart,
          action: () => console.log('Navigate to orders'),
          color: 'blue'
        },
        {
          title: 'Customer Messages',
          description: 'Respond to customer inquiries',
          icon: MessageCircle,
          action: () => console.log('Navigate to messages'),
          color: 'green'
        },
        {
          title: 'Update Inventory',
          description: 'Check and update product stock',
          icon: Package,
          action: () => console.log('Navigate to inventory'),
          color: 'purple'
        },
        {
          title: 'Social Media',
          description: 'Check Instagram and Facebook activity',
          icon: Heart,
          action: () => console.log('Navigate to social media'),
          color: 'pink'
        }
      ],
      socialActivity: {
        instagram: {
          followers: 12500,
          likes: 450,
          comments: 23,
          posts: 3
        },
        facebook: {
          followers: 8900,
          likes: 210,
          comments: 15,
          posts: 2
        }
      },
      systemStatus: {
        website: 'online',
        orders: 'processing',
        inventory: 'good',
        payments: 'active'
      }
    }

    setData(mockData)

    return () => clearInterval(timeInterval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/admin-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh_dashboard', userId: 'current-user' })
      })
      
      let result
      try {
        result = await response.json()
      } catch (parseError) {
        console.error('Failed to parse refresh response:', parseError)
        return
      }
      
      if (result && result.success && result.data && result.data.metrics) {
        setData(prev => prev ? {
          ...prev,
          todayStats: result.data.metrics
        } : prev)
      } else {
        console.error('Refresh API returned invalid data:', result)
      }
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.price) return
    
    setIsAddingProduct(true)
    try {
      const response = await fetch('/api/admin-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_product',
          data: {
            name: productForm.name,
            price: productForm.price,
            stock: productForm.stock || '0',
            category: productForm.category
          },
          userId: 'current-user'
        })
      })
      
      let result
      try {
        result = await response.json()
      } catch (parseError) {
        console.error('Failed to parse add product response:', parseError)
        alert('Failed to add product: Invalid response format')
        return
      }
      
      if (result && result.success) {
        setProductForm({ name: '', price: '', stock: '', category: 'Cricket Bats' })
        console.log('Product added successfully:', result.data)
        // Refresh products list
        fetchRecentProducts()
      } else {
        console.error('Add product failed:', result?.error || 'Unknown error')
        alert(`Failed to add product: ${result?.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Add product failed:', error)
    } finally {
      setIsAddingProduct(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'processing':
      case 'good':
      case 'active':
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'maintenance':
      case 'delayed':
      case 'low':
      case 'processing':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'offline':
      case 'paused':
      case 'critical':
      case 'issues':
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'pending':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'processing':
      case 'good':
      case 'active':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'maintenance':
      case 'delayed':
      case 'low':
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'offline':
      case 'paused':
      case 'critical':
      case 'issues':
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  if (!data) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Good {
            currentTime.getHours() < 12 ? 'Morning' :
            currentTime.getHours() < 17 ? 'Afternoon' : 'Evening'
          }! 👋</h1>
          <p className="text-lg text-gray-600 mt-1">
            Here's what's happening with Sports Devil today
          </p>
          <p className="text-sm text-gray-500">
            {currentTime.toLocaleDateString('en-GB', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} • {currentTime.toLocaleTimeString('en-GB', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          size="lg"
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EnhancedCard className="p-6 bg-white border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Today's Orders</p>
              <p className="text-3xl font-bold text-gray-900">{data.todayStats.orders}</p>
            </div>
            <div className="p-3 bg-blue-600 rounded-full">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">+£145</span>
              <span className="text-sm text-gray-500">vs last week</span>
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard className="p-6 bg-white border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Revenue</p>
              <p className="text-3xl font-bold text-gray-900">£{data.todayStats.revenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-600 rounded-full">
              <span className="text-white font-bold text-lg">£</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">+£280</span>
              <span className="text-sm text-gray-500">vs last week</span>
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard className="p-6 bg-white border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Visitors</p>
              <p className="text-3xl font-bold text-gray-900">{data.todayStats.visitors}</p>
            </div>
            <div className="p-3 bg-purple-600 rounded-full">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">+48</span>
              <span className="text-sm text-gray-500">vs last week</span>
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard className="p-6 bg-white border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Messages</p>
              <p className="text-3xl font-bold text-gray-900">{data.todayStats.messages}</p>
            </div>
            <div className="p-3 bg-orange-600 rounded-full">
              <Bell className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="outline" className="text-orange-700 border-orange-600">
              2 urgent
            </Badge>
          </div>
        </EnhancedCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <EnhancedCard className="p-6 bg-white border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Orders</h3>
              <Button variant="outline" size="sm" className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-50">
                <Eye className="h-4 w-4" />
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {data.recentOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">{order.customer}</span>
                      <Badge className={getStatusColor(order.status)} variant="secondary">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.items.join(', ')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {order.id} • {order.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">£{order.amount}</p>
                    {getStatusIcon(order.status)}
                  </div>
                </motion.div>
              ))}
            </div>
          </EnhancedCard>
        </div>

        {/* Quick Actions & Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <EnhancedCard className="p-6 bg-white border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-6 text-gray-900">Quick Actions</h3>
            <div className="space-y-4">
              {data.quickActions.map((action, index) => (
                <motion.button
                  key={action.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={action.action}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`p-3 rounded-lg bg-${action.color}-50`}>
                    <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </motion.button>
              ))}
            </div>
          </EnhancedCard>

          {/* System Status */}
          <EnhancedCard className="p-6 bg-white border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-6 text-gray-900">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-900">Website</span>
                </div>
                <Badge className={getStatusColor(data.systemStatus.website)} variant="secondary">
                  {data.systemStatus.website}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-900">Orders</span>
                </div>
                <Badge className={getStatusColor(data.systemStatus.orders)} variant="secondary">
                  {data.systemStatus.orders}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-900">Inventory</span>
                </div>
                <Badge className={getStatusColor(data.systemStatus.inventory)} variant="secondary">
                  {data.systemStatus.inventory}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-bold text-lg">£</span>
                  <span className="font-medium text-gray-900">Payments</span>
                </div>
                <Badge className={getStatusColor(data.systemStatus.payments)} variant="secondary">
                  {data.systemStatus.payments}
                </Badge>
              </div>
            </div>
          </EnhancedCard>
        </div>
      </div>

      {/* Social Media Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoadingSocial ? (
          <>
            {[1, 2].map((index) => (
              <EnhancedCard key={index} className="p-6 bg-white border-gray-200 shadow-sm">
                <div className="animate-pulse">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                    <div>
                      <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="text-center">
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </EnhancedCard>
            ))}
          </>
        ) : socialData?.platformMetrics ? (
          socialData.platformMetrics.slice(0, 2).map((platform: any) => (
            <EnhancedCard key={platform.platform} className="p-6 bg-white border-gray-200 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    platform.platform === 'instagram' ? 'bg-pink-600' : 'bg-blue-600'
                  }`}>
                    <span className="text-white text-lg">
                      {platform.platform === 'instagram' ? '📷' : '👥'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 capitalize">
                      {platform.platform}
                    </h3>
                    <p className="text-sm text-gray-600">Recent activity</p>
                  </div>
                </div>
                <button 
                  onClick={fetchSocialData}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-md transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{platform.followers.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{platform.avgLikes}</p>
                  <p className="text-sm text-gray-600">Avg Likes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{platform.avgComments}</p>
                  <p className="text-sm text-gray-600">Avg Comments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{platform.postsThisWeek}</p>
                  <p className="text-sm text-gray-600">Posts This Week</p>
                </div>
              </div>
            </EnhancedCard>
          ))
        ) : (
          <>
            <EnhancedCard className="p-6 bg-white border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-pink-600 rounded-lg">
                  <span className="text-white text-lg">📷</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Instagram</h3>
                  <p className="text-sm text-gray-600">Recent activity</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">12,500</p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">450</p>
                  <p className="text-sm text-gray-600">Avg Likes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">23</p>
                  <p className="text-sm text-gray-600">Avg Comments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">3</p>
                  <p className="text-sm text-gray-600">Posts This Week</p>
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard className="p-6 bg-white border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <span className="text-white text-lg">👥</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Facebook</h3>
                  <p className="text-sm text-gray-600">Recent activity</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">8,900</p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">210</p>
                  <p className="text-sm text-gray-600">Avg Likes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">15</p>
                  <p className="text-sm text-gray-600">Avg Comments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">2</p>
                  <p className="text-sm text-gray-600">Posts This Week</p>
                </div>
              </div>
            </EnhancedCard>
          </>
        )}
      </div>

      {/* Product Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Add Product */}
        <EnhancedCard className="p-6 bg-white border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold mb-6 text-gray-900">Quick Add Product</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <input 
                type="text" 
                value={productForm.name}
                onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Cricket Bat Pro Series"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (£)</label>
                <input 
                  type="number" 
                  value={productForm.price}
                  onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                <input 
                  type="number" 
                  value={productForm.stock}
                  onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select 
                value={productForm.category}
                onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Cricket Bats</option>
                <option>Protection</option>
                <option>Wicket Keeping</option>
                <option>Clothing</option>
              </select>
            </div>
            <button 
              onClick={handleAddProduct}
              disabled={isAddingProduct || !productForm.name || !productForm.price}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
            >
              {isAddingProduct ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isAddingProduct ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </EnhancedCard>

        {/* Product Management */}
        <EnhancedCard className="p-6 bg-white border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Products</h3>
            <button 
              onClick={fetchRecentProducts}
              disabled={isLoadingProducts}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingProducts ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-4">
            {isLoadingProducts ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="animate-pulse flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentProducts.length > 0 ? (
              recentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>£{typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</span>
                      <span>•</span>
                      <span>{product.stockQuantity} in stock</span>
                      <span>•</span>
                      <span className="text-xs text-gray-500">{product.sku}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => window.open(`/admin/products/${product.slug}`, '_blank')}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit Product"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      disabled={deletingProductId === product.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Product"
                    >
                      {deletingProductId === product.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No products found</p>
                <p className="text-xs">Add your first product using the form</p>
              </div>
            )}
            <button 
              onClick={() => window.open('/admin/products', '_blank')}
              className="w-full text-blue-600 text-sm font-medium py-2 px-4 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
            >
              View All Products
            </button>
          </div>
        </EnhancedCard>
      </div>

    </div>
  )
}