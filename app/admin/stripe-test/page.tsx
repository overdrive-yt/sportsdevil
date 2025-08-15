'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Separator } from '../../../components/ui/separator'
import { Badge } from '../../../components/ui/badge'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import { createCheckoutSession } from '../../../lib/stripe-client'
import { 
  CreditCard, 
  ShoppingCart, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

export default function StripeTestPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [testOrder, setTestOrder] = useState({
    customerEmail: 'test@sportsdevil.co.uk',
    customerName: 'Test Customer',
    items: [
      {
        id: 'test-bat-1',
        name: 'Test Cricket Bat - Gray Nicolls GN5',
        price: 149.99,
        quantity: 1
      },
      {
        id: 'test-gloves-1', 
        name: 'Test Batting Gloves - SS Premium',
        price: 69.99,
        quantity: 1
      }
    ]
  })

  const handleCreateTestOrder = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // First, create a test order in your database
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: testOrder.items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          customerInfo: {
            name: testOrder.customerName,
            email: testOrder.customerEmail,
            address: 'Test Address',
            city: 'Test City',
            postalCode: 'TE5T 1NG',
            country: 'UK'
          },
          shippingAddress: {
            name: testOrder.customerName,
            address: 'Test Address',
            city: 'Test City', 
            postalCode: 'TE5T 1NG',
            country: 'UK'
          }
        })
      })

      if (!orderResponse.ok) {
        // If order creation fails, create a mock order ID for testing
        console.warn('Order creation failed, using mock order for Stripe test')
        const mockOrderId = 'test-order-' + Date.now()
        
        await createCheckoutSession({
          orderId: mockOrderId,
          items: testOrder.items,
          customerEmail: testOrder.customerEmail,
          customerName: testOrder.customerName
        })
        return
      }

      const order = await orderResponse.json()
      
      // Create Stripe checkout session
      await createCheckoutSession({
        orderId: order.id,
        items: testOrder.items,
        customerEmail: testOrder.customerEmail,
        customerName: testOrder.customerName
      })

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to create checkout session')
      console.error('Stripe test error:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = testOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin" className="text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold">Stripe Payment Integration Test</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Test Environment
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Test the complete Stripe checkout flow with sample cricket equipment products
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Test Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Test Order Configuration
              </CardTitle>
              <CardDescription>
                Configure your test order details and customer information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  id="customerEmail"
                  value={testOrder.customerEmail}
                  onChange={(e) => setTestOrder(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="customer@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={testOrder.customerName}
                  onChange={(e) => setTestOrder(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Customer Name"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Test Products</Label>
                {testOrder.items.map((item, index) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">£{item.price.toFixed(2)}</p>
                  </div>
                ))}
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <p className="font-semibold">Total Amount:</p>
                  <p className="font-bold text-lg">£{totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Stripe Integration Test
              </CardTitle>
              <CardDescription>
                Click below to test the complete Stripe checkout flow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Redirecting to Stripe Checkout...
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <Button 
                  onClick={handleCreateTestOrder}
                  disabled={loading || success}
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Checkout Session...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Redirecting to Stripe...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Create Test Checkout
                    </>
                  )}
                </Button>

                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong>What happens next:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Creates a test order in the database</li>
                    <li>Generates a Stripe checkout session</li>
                    <li>Redirects you to Stripe's hosted checkout</li>
                    <li>Use test card: 4242 4242 4242 4242</li>
                    <li>Any future date and CVC</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold">Test Card Numbers:</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Success:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">4242 4242 4242 4242</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Decline:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">4000 0000 0000 0002</code>
                  </div>
                  <div className="flex justify-between">
                    <span>3D Secure:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">4000 0027 6000 3184</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
            <CardDescription>
              How to test the complete Stripe integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Payment Testing:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Click "Create Test Checkout" above</li>
                  <li>You'll be redirected to Stripe Checkout</li>
                  <li>Use test card 4242 4242 4242 4242</li>
                  <li>Enter any future expiry date</li>
                  <li>Enter any 3-digit CVC</li>
                  <li>Complete the checkout process</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">View Results:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Check the Payments tab in admin dashboard</li>
                  <li>View payment history and analytics</li>
                  <li>Check webhook processing in console</li>
                  <li>Verify order status updates</li>
                  <li>Test refund functionality</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}