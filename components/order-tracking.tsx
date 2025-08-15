'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Alert, AlertDescription } from './ui/alert'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search,
  MapPin,
  Calendar,
  Mail,
  Phone
} from 'lucide-react'

interface TrackingTimeline {
  status: string
  date: Date
  completed: boolean
  description: string
}

interface TrackingData {
  orderNumber: string
  status: string
  paymentStatus: string
  totalAmount: number
  shippingAddress: {
    name: string
    address: string
    city: string
    postalCode: string
  }
  timeline: TrackingTimeline[]
  notes?: string
}

interface OrderTrackingProps {
  orderNumber?: string
  showSearch?: boolean
}

export function OrderTracking({ orderNumber: initialOrderNumber, showSearch = true }: OrderTrackingProps) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber || '')
  const [email, setEmail] = useState('')
  const [tracking, setTracking] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-load if order number is provided
  useEffect(() => {
    if (initialOrderNumber && !showSearch) {
      handleTrackOrder()
    }
  }, [initialOrderNumber, showSearch])

  const handleTrackOrder = async () => {
    if (!orderNumber.trim()) {
      setError('Please enter an order number')
      return
    }

    setLoading(true)
    setError('')

    try {
      const url = new URL(`/api/orders/${orderNumber}/track`, window.location.origin)
      if (email) {
        url.searchParams.append('email', email)
      }

      const response = await fetch(url.toString())
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tracking information')
      }

      setTracking(data.tracking)
    } catch (err: any) {
      setError(err.message || 'Failed to track order')
      setTracking(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string, completed: boolean) => {
    if (!completed) return <Clock className="h-5 w-5 text-gray-400" />
    
    switch (status.toLowerCase()) {
      case 'order placed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'payment confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'order processing':
        return <Package className="h-5 w-5 text-blue-500" />
      case 'dispatched':
        return <Truck className="h-5 w-5 text-orange-500" />
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'default'
      case 'shipped':
        return 'secondary'
      case 'processing':
        return 'outline'
      case 'cancelled':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      {showSearch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Track Your Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Order Number *
                </label>
                <Input
                  type="text"
                  placeholder="SD-1234567890-ABC"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required if not logged in
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleTrackOrder} 
              disabled={loading || !orderNumber.trim()}
              className="w-full"
            >
              {loading ? 'Tracking...' : 'Track Order'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tracking Results */}
      {tracking && (
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Order {tracking.orderNumber}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={getStatusBadgeVariant(tracking.status)}>
                      {tracking.status}
                    </Badge>
                    <Badge variant="outline">
                      Payment: {tracking.paymentStatus}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">
                    £{tracking.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </h4>
                  <div className="text-sm text-muted-foreground">
                    <p>{tracking.shippingAddress.name}</p>
                    <p>{tracking.shippingAddress.address}</p>
                    <p>{tracking.shippingAddress.city}, {tracking.shippingAddress.postalCode}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4" />
                    Need Help?
                  </h4>
                  <div className="text-sm text-muted-foreground">
                    <p>📞 07897813165</p>
                    <p>📧 info@sportsdevil.co.uk</p>
                  </div>
                </div>
              </div>
              
              {tracking.notes && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm">{tracking.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {tracking.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {getStatusIcon(event.status, event.completed)}
                      {index < tracking.timeline.length - 1 && (
                        <div className={`w-px h-12 mt-2 ${
                          event.completed ? 'bg-green-200' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    
                    <div className="flex-1 pb-8">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-medium ${
                          event.completed ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {event.status}
                        </h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.date).toLocaleDateString('en-GB', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <p className={`text-sm ${
                        event.completed ? 'text-muted-foreground' : 'text-muted-foreground/70'
                      }`}>
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h4 className="font-medium">Need to make changes to your order?</h4>
                <p className="text-sm text-muted-foreground">
                  Contact us as soon as possible if you need to modify your delivery address or cancel your order.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Us
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}