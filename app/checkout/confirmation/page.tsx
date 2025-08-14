import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OrderTracking } from '@/components/order-tracking'
import { Header } from '@/components/header'  
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Package, 
  Mail, 
  ArrowLeft, 
  Download,
  Truck,
  Calendar,
  MapPin,
  Phone
} from 'lucide-react'
import Link from 'next/link'
import { formatPriceSimple } from '@/lib/utils'

interface OrderConfirmationPageProps {
  searchParams: Promise<{ order?: string }>
}

async function getOrderDetails(orderIdentifier: string, userEmail?: string) {
  try {
    // Try to find order by order number first, then by payment intent ID
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: orderIdentifier },
          { paymentIntentId: orderIdentifier }
        ],
        ...(userEmail && { 
          user: { email: userEmail } 
        }),
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                images: {
                  take: 1,
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return order
  } catch (error) {
    console.error('Error fetching order details:', error)
    return null
  }
}

export default async function OrderConfirmationPage({ searchParams }: OrderConfirmationPageProps) {
  const { order: orderIdentifier } = await searchParams
  
  if (!orderIdentifier) {
    redirect('/cart')
  }

  const session = await getServerSession(authOptions)
  const order = await getOrderDetails(orderIdentifier, session?.user?.email)

  if (!order) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Package className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-2xl text-red-600">🏏 Order Not Found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                We couldn't find an order with the provided identifier: <strong>{orderIdentifier}</strong>
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/track-order">Track Different Order</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard">View All Orders</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Success Header */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-green-800">🏏 Order Confirmed!</h1>
                <p className="text-lg text-muted-foreground">
                  Thank you for your cricket equipment purchase from Sports Devil
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 inline-block border-2 border-green-200">
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="text-2xl font-bold text-green-800">{order.orderNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Details */}
              <div className="space-y-6">
                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Cricket Equipment Ordered
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Badge variant="outline">
                        Payment: {order.paymentStatus}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-medium">{item.product.name}</h3>
                            <div className="text-sm text-muted-foreground">
                              {item.color && <span>Color: {item.color} • </span>}
                              {item.size && <span>Size: {item.size} • </span>}
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPriceSimple(Number(item.price) * item.quantity)}</p>
                          <p className="text-sm text-muted-foreground">{formatPriceSimple(Number(item.price))} each</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Delivery Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Delivery Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Delivery Address</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p className="font-medium text-foreground">{order.shippingName}</p>
                          <p>{order.shippingAddress}</p>
                          <p>{order.shippingCity}, {order.shippingPostal}</p>
                          <p>{order.shippingCountry}</p>
                          {order.shippingPhone && <p>📞 {order.shippingPhone}</p>}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Expected Delivery</h4>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>3-5 working days</span>
                          </div>
                          <p className="mt-1">We'll send tracking information via email</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary & Actions */}
              <div className="space-y-6">
                {/* Order Totals */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Total</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatPriceSimple(Number(order.subtotalAmount))}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Delivery</span>
                        <span>{Number(order.shippingAmount) === 0 ? 'FREE' : formatPriceSimple(Number(order.shippingAmount))}</span>
                      </div>
                      
                      {Number(order.discountAmount) > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                          <span>-{formatPriceSimple(Number(order.discountAmount))}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span>VAT (20%)</span>
                        <span>{formatPriceSimple(Number(order.taxAmount))}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total Paid</span>
                        <span>{formatPriceSimple(Number(order.totalAmount))}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>What's Next?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Button className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Receipt
                      </Button>
                      
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/track-order">
                          <Package className="h-4 w-4 mr-2" />
                          Track Your Order
                        </Link>
                      </Button>
                      
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/dashboard">
                          View Order History
                        </Link>
                      </Button>
                      
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/products">
                          Continue Shopping Cricket Gear
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Support */}
                <Card>
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email confirmation sent to {order.shippingEmail}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>Questions? Call us: 07897813165</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Visit us: 309 Kingstanding Rd, Birmingham B44 9TH</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}