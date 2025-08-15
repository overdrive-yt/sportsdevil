'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Checkbox } from '../../components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Separator } from '../../components/ui/separator'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Header } from '../../components/header'
import { Footer } from '../../components/footer'
import { DynamicStripePaymentForm } from '../../components/dynamic-loaders'
import { AuthProtectedRoute } from '../../components/auth/protected-route'
import { 
  CreditCard, 
  Truck, 
  Shield, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Lock,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  Package,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { useCartStore } from '../../stores/cart-store'
import { useCurrentUser } from '../../hooks/use-auth-store'
import { formatPriceSimple } from '../../lib/utils'
import { toast } from 'sonner'

const checkoutSchema = z.object({
  // Contact Information
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  
  // Shipping Address
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(5, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  
  // Billing (if different)
  billingSameAsShipping: z.boolean(),
  billingFirstName: z.string().optional(),
  billingLastName: z.string().optional(),
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  billingPostalCode: z.string().optional(),
  billingCountry: z.string().optional(),
  
  // Payment
  cardNumber: z.string().min(16, 'Card number is required'),
  expiryDate: z.string().min(5, 'Expiry date is required'),
  cvv: z.string().min(3, 'CVV is required'),
  cardholderName: z.string().min(2, 'Cardholder name is required'),
  
  // Terms
  agreeToTerms: z.boolean().refine(val => val, 'You must agree to the terms and conditions'),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

function CheckoutContent() {
  const [currentStep, setCurrentStep] = useState<'review' | 'payment'>('review')
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard')
  const [couponCode, setCouponCode] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const router = useRouter()
  const { user } = useCurrentUser()
  const { 
    items, 
    appliedCoupon,
    isLocked,
    getSubtotal,
    getDiscountAmount,
    getTotalItems, 
    clearCartAfterPayment,
    applyCoupon,
    removeCoupon
  } = useCartStore()

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      router.push('/cart')
    }
  }, [items, router])

  // Calculate totals - prices are now VAT-inclusive
  const subtotal = getSubtotal()
  
  // Check if cart contains STRIPE TEST ITEM for free shipping
  const hasStripeTestItem = items.some(item => item.product.slug === 'stripe-test-item-1-pound')
  const shippingCost = hasStripeTestItem ? 0 : (shippingMethod === 'express' ? 9.99 : (subtotal >= 100 ? 0 : 7.99))
  
  const discountAmount = getDiscountAmount()
  const discountedSubtotal = subtotal - discountAmount
  
  // Calculate VAT amount for transparency (VAT is already included in prices)
  const vatAmount = discountedSubtotal * (0.2 / 1.2) // Extract VAT from VAT-inclusive price
  
  // Total is now just subtotal (VAT-inclusive) + shipping - discount
  const total = discountedSubtotal + shippingCost

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          cartTotal: subtotal
        }),
      })

      const result = await response.json()

      if (result.success) {
        applyCoupon({
          code: result.data.code,
          discountAmount: result.data.discountAmount, // Keep for backward compatibility
          discountType: result.data.discountType,
          discountValue: result.data.discountValue,
          description: result.data.description
        })
        setCouponCode('')
        
        // Calculate current discount amount dynamically
        const currentDiscount = result.data.discountType === 'PERCENTAGE' 
          ? Math.round(subtotal * (result.data.discountValue / 100) * 100) / 100
          : Math.min(result.data.discountValue, subtotal)
        
        const discountText = result.data.discountType === 'PERCENTAGE' 
          ? `${result.data.discountValue}% discount` 
          : `£${result.data.discountValue} off`
        
        toast.success(`${result.data.code} applied! ${discountText} - Saved £${currentDiscount.toFixed(2)}`)
      } else {
        toast.error(result.error || 'Invalid coupon code')
      }
    } catch (error) {
      console.error('Error validating coupon:', error)
      toast.error('Failed to apply coupon. Please try again.')
    }
  }

  const handlePaymentSuccess = (orderDetails: any) => {
    // Clear cart after successful payment (bypasses lock)
    clearCartAfterPayment()
    
    // Show success message
    toast.success('🎉 Order confirmed! Redirecting to confirmation page...')
    
    // The StripePaymentForm will handle the redirect
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
    toast.error(`Payment failed: ${error}`)
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>Your Cart is Empty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Add some cricket equipment to your cart before checkout
              </p>
              <Button asChild className="w-full">
                <Link href="/products">Browse Cricket Equipment</Link>
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Secure Checkout</h1>
                <p className="text-muted-foreground">Complete your cricket equipment purchase</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/cart">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cart
                </Link>
              </Button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep === 'review' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'review' ? 'bg-primary text-white' : 'bg-muted'
                }`}>
                  1
                </div>
                <span className="font-medium">Review Order</span>
              </div>
              <div className="w-8 h-px bg-muted"></div>
              <div className={`flex items-center space-x-2 ${currentStep === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'payment' ? 'bg-primary text-white' : 'bg-muted'
                }`}>
                  2
                </div>
                <span className="font-medium">Payment</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Review */}
            {currentStep === 'review' && (
              <>
                <div className="lg:col-span-2 space-y-6">
                  {/* Cart Items */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Cricket Equipment ({getTotalItems()} items)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {items.map((item) => (
                        <div key={`${item.productId}-${item.id}`} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <h3 className="font-medium">{item.product.name}</h3>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>Quantity: {item.quantity}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPriceSimple(Number(item.product.price) * item.quantity)}</p>
                            <p className="text-sm text-muted-foreground">{formatPriceSimple(Number(item.product.price))} each</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Shipping Method */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Delivery Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <Label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-muted/50">
                          <input
                            type="radio"
                            name="shipping"
                            value="standard"
                            checked={shippingMethod === 'standard'}
                            onChange={(e) => setShippingMethod(e.target.value as 'standard')}
                            className="text-primary"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Standard Delivery</span>
                              <span className="font-medium">
                                {hasStripeTestItem 
                                  ? 'FREE' 
                                  : (subtotal >= 100 ? 'FREE' : '£7.99')
                                }
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              3-5 working days • Free on orders over £100
                              {hasStripeTestItem && <br />}
                              {hasStripeTestItem && <span className="text-green-600">Free shipping for test item</span>}
                            </p>
                          </div>
                        </Label>

                        <Label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-muted/50">
                          <input
                            type="radio"
                            name="shipping"
                            value="express"
                            checked={shippingMethod === 'express'}
                            onChange={(e) => setShippingMethod(e.target.value as 'express')}
                            className="text-primary"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Express Delivery</span>
                              <span className="font-medium">£9.99</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Next working day</p>
                          </div>
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Coupon Code */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Discount Code</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-800">Coupon "{appliedCoupon.code}" applied</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              removeCoupon()
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Enter discount code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                          />
                          <Button onClick={handleApplyCoupon} variant="outline">
                            Apply
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Continue to Payment Button */}
                  <Card>
                    <CardContent className="p-6">
                      <Button 
                        onClick={() => setCurrentStep('payment')} 
                        className="w-full" 
                        size="lg"
                      >
                        Continue to Payment
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Payment Form */}
            {currentStep === 'payment' && (
              <div className="lg:col-span-2">
                {/* Back to Review Button */}
                <div className="mb-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep('review')}
                    className="mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Review
                  </Button>
                </div>
                
                <DynamicStripePaymentForm
                  cartItems={items}
                  shippingMethod={shippingMethod}
                  couponCode={appliedCoupon?.code || undefined}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
                
                {paymentError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{paymentError}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Order Summary Sidebar */}
            <div className="space-y-6">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal ({getTotalItems()} items)</span>
                      <span>{formatPriceSimple(subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="ml-4">• includes VAT (20%)</span>
                      <span>{formatPriceSimple(vatAmount)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Delivery ({shippingMethod})</span>
                      <span>{shippingCost === 0 ? 'FREE' : formatPriceSimple(shippingCost)}</span>
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatPriceSimple(discountAmount)}</span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatPriceSimple(total)}</span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <p>All prices include UK VAT</p>
                    </div>
                  </div>

                  <div className="text-center space-y-2 text-sm text-muted-foreground">
                    <p>🔒 Your payment information is encrypted and secure</p>
                    <p>💳 Powered by Stripe - trusted by millions worldwide</p>
                    <p>🇬🇧 UK VAT included • Free returns within 30 days</p>
                  </div>
                </CardContent>
              </Card>

              {/* Security Badge */}
              <Card>
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <Shield className="h-8 w-8 text-green-600 mx-auto" />
                    <h3 className="font-medium">Secure Checkout</h3>
                    <p className="text-xs text-muted-foreground">
                      256-bit SSL encryption • PCI DSS compliant • Stripe secure payments
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function CheckoutPage() {
  return (
    <AuthProtectedRoute>
      <CheckoutContent />
    </AuthProtectedRoute>
  )
}