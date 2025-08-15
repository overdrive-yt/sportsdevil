'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Header } from '../../components/header'
import { Footer } from '../../components/footer'
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  MapPin, 
  CreditCard, 
  Truck,
  Eye,
  Download,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Loader2
} from 'lucide-react'
import { formatPriceSimple } from '../../lib/utils'
import { useCurrentUser } from '../../hooks/use-auth-store'
import { useLoyaltyBalance } from '../../hooks/use-loyalty-points'
import { useDashboardData } from '../../hooks/use-extended-user'
import { LoyaltyPointsManager } from '../../components/loyalty-points-manager'
import { ProfileEditor } from '../../components/profile-editor'

// Mock wishlist data (will be replaced with real data in future version)
const mockWishlist = [
  {
    id: '1',
    name: 'Premium Sports Helmet',
    price: 79.99,
    image: null,
  },
  {
    id: '2',
    name: 'Professional Sports Equipment Set',
    price: 124.99,
    image: null,
  },
  {
    id: '3',
    name: 'Athletic Protection Gear',
    price: 54.99,
    image: null,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-800'
    case 'processing':
      return 'bg-yellow-100 text-yellow-800'
    case 'shipped':
      return 'bg-blue-100 text-blue-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'delivered':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'shipped':
      return <Package className="h-4 w-4 text-blue-600" />
    case 'processing':
      return <Clock className="h-4 w-4 text-yellow-600" />
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-red-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-600" />
  }
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const { user: sessionUser, isLoading: sessionLoading } = useCurrentUser()
  const { user, loyalty, orders, stats, isLoading: dashboardLoading, error } = useDashboardData()
  const router = useRouter()
  
  const isLoading = sessionLoading || dashboardLoading

  // Show loading for longer to allow session to properly establish
  if (isLoading || sessionLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-gray-400">Loading your dashboard...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Only show access required if definitely not loading and no session user
  if (!sessionLoading && !sessionUser) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
          <Card className="w-full max-w-md bg-gray-800/90 border-gray-600">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Access Required</CardTitle>
              <CardDescription className="text-gray-300">Please sign in to view your Sports Devil dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/login">Sign In to Dashboard</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/register">Create New Account</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Header with Cricket Branding */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" alt={user?.name || sessionUser?.name || 'User'} />
                <AvatarFallback className="text-lg bg-primary text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : sessionUser?.name ? sessionUser.name.charAt(0).toUpperCase() : sessionUser?.email ? sessionUser.email.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user?.name || sessionUser?.name || 'User'}!
                </h1>
                <p className="text-gray-600">
                  Your sports equipment headquarters - manage orders and account settings
                </p>
              </div>
            </div>
          </div>

          {/* Stats Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-blue-700/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Orders</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalOrders || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-900/30 to-green-800/20 border-green-700/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Spent</p>
                    <p className="text-2xl font-bold text-white">{formatPriceSimple(stats?.totalSpent || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border-yellow-700/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Star className="h-8 w-8 text-yellow-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-400">Loyalty Points</p>
                    <p className="text-2xl font-bold text-white">{stats?.loyaltyPoints || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-700/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-8 w-8 text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-400">Member Since</p>
                    <p className="text-2xl font-bold text-white">{stats?.memberSince ? new Date(stats.memberSince).getFullYear() : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="loyalty" className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Loyalty</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Wishlist</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders with Enhanced Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="h-5 w-5" />
                      <span>Recent Orders</span>
                    </CardTitle>
                    <CardDescription>Your latest equipment purchases</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {orders?.recent?.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(order.status)}
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.date).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPriceSimple(order.total)}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab('orders')}>
                      View All Orders ({stats?.totalOrders || 0})
                    </Button>
                  </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Account Information</span>
                    </CardTitle>
                    <CardDescription>Your Sports Devil account details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{user?.email || sessionUser?.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{user?.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {user?.city && user?.country ? `${user.city}, ${user.country}` : 'Address not provided'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Member since {stats?.memberSince ? new Date(stats.memberSince).toLocaleDateString('en-GB', {
                            year: 'numeric',
                            month: 'long'
                          }) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab('settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Equipment Hub</CardTitle>
                  <CardDescription>Quick access to your favorite sports activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
                      <Link href="/products">
                        <Package className="h-6 w-6" />
                        <span className="text-sm">Browse Sports Equipment</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => setActiveTab('orders')}>
                      <Truck className="h-6 w-6" />
                      <span className="text-sm">Track Orders</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => setActiveTab('wishlist')}>
                      <Heart className="h-6 w-6" />
                      <span className="text-sm">View Wishlist</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
                      <Link href="/track-order">
                        <Eye className="h-6 w-6" />
                        <span className="text-sm">Order Status</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sports Equipment Order History</CardTitle>
                  <CardDescription>
                    View and track all your sports equipment orders from Sports Devil
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {orders?.recent && orders.recent.length > 0 ? orders.recent.map((order) => (
                    <Card key={order.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(order.status)}
                            <div>
                              <h3 className="font-semibold text-lg">{order.id}</h3>
                              <p className="text-sm text-muted-foreground">
                                Ordered on {new Date(order.date).toLocaleDateString('en-GB', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold">{formatPriceSimple(order.total)}</p>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Sports Equipment:</h4>
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                              <div className="flex-1">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-muted-foreground ml-2">×{item.quantity}</span>
                              </div>
                              <span className="font-medium">{formatPriceSimple(item.price)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download Invoice
                          </Button>
                          {order.status === 'delivered' && (
                            <>
                              <Button variant="outline" size="sm">
                                <Star className="mr-2 h-4 w-4" />
                                Write Review
                              </Button>
                              <Button variant="outline" size="sm">
                                <Package className="mr-2 h-4 w-4" />
                                Reorder Items
                              </Button>
                            </>
                          )}
                          {order.status === 'shipped' && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href="/track-order">
                                <Truck className="mr-2 h-4 w-4" />
                                Track Package
                              </Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                      <p className="text-muted-foreground mb-4">Start shopping for sports equipment to see your orders here</p>
                      <Button asChild>
                        <Link href="/products">Browse Sports Equipment</Link>
                      </Button>
                    </div>
                  )}
                  
                  {error && (
                    <div className="text-center py-8">
                      <p className="text-red-600">Failed to load orders. Please try refreshing the page.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5" />
                    <span>Your Sports Equipment Wishlist</span>
                  </CardTitle>
                  <CardDescription>
                    Sports gear you've saved for later purchase
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {mockWishlist.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Your Wishlist is Empty</h3>
                      <p className="text-muted-foreground mb-4">Save sports equipment you love to purchase later</p>
                      <Button asChild>
                        <Link href="/products">Browse Sports Equipment</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {mockWishlist.map((item) => (
                        <Card key={item.id} className="group hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="w-full h-40 bg-gradient-to-br from-primary/5 to-primary/10 rounded-md mb-4 flex items-center justify-center">
                              <Package className="h-12 w-12 text-primary/60" />
                            </div>
                            <h3 className="font-medium mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-xl font-bold text-primary mb-4">{formatPriceSimple(item.price)}</p>
                            <div className="space-y-2">
                              <Button className="w-full" size="sm">
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Add to Cart
                              </Button>
                              <Button variant="outline" className="w-full" size="sm">
                                <XCircle className="h-4 w-4 mr-2" />
                                Remove from Wishlist
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Loyalty Points Tab */}
            <TabsContent value="loyalty" className="space-y-6">
              <LoyaltyPointsManager />
            </TabsContent>

            {/* Settings/Profile Tab */}
            <TabsContent value="settings" className="space-y-6">
              <ProfileEditor />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  )
}