'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/hooks/use-auth-store'
import {
  Elements,
  PaymentElement,
  AddressElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Shield, CreditCard, Smartphone, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/stores/cart-store'

interface CartItem {
  productId: string
  quantity: number
  selectedColor?: string
  selectedSize?: string
  product: {
    name: string
    price: string | number
    image?: string
    primaryImage?: {
      url: string
      alt: string
    }
  }
}

interface OrderTotals {
  subtotal: number
  vat: number
  shipping: number
  discount: number
  total: number
}

interface StripePaymentFormProps {
  cartItems: CartItem[]
  shippingMethod: 'standard' | 'express'
  couponCode?: string
  onSuccess: (orderDetails: any) => void
  onError: (error: string) => void
}

// Main payment form wrapper
export function StripePaymentForm({
  cartItems,
  shippingMethod,
  couponCode,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<string[]>(['card'])
  const [paymentMethodsConfig, setPaymentMethodsConfig] = useState<any>({ card: { displayName: 'Card' } })
  const [stripeLoadError, setStripeLoadError] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const stripePromise = getStripe()

  // Always use real Stripe form - no fallback for testing
  useEffect(() => {
    // Force enable all payment methods
    setAvailablePaymentMethods(['card', 'apple_pay', 'google_pay', 'klarna'])
    setPaymentMethodsConfig({ 
      card: { displayName: 'Credit/Debit Card' },
      apple_pay: { displayName: 'Apple Pay' },
      google_pay: { displayName: 'Google Pay' },
      klarna: { displayName: 'Klarna' }
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Payment Method Availability Notice */}
      {Object.keys(paymentMethodsConfig).length > 1 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">Multiple Payment Options Available</h3>
                <p className="text-sm text-green-700">
                  {Object.values(paymentMethodsConfig).map((config: any) => config.displayName).join(', ')} accepted
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Form with Address Collection */}
      <div>
        <StripeElementsWrapper 
          stripePromise={stripePromise}
          cartItems={cartItems}
          shippingMethod={shippingMethod}
          couponCode={couponCode}
          onSuccess={onSuccess}
          onError={onError}
          availablePaymentMethods={availablePaymentMethods}
          paymentMethodsConfig={paymentMethodsConfig}
        />
      </div>
    </div>
  )
}

// Stripe Elements wrapper that handles clientSecret initialization
function StripeElementsWrapper({
  stripePromise,
  cartItems,
  shippingMethod,
  couponCode,
  onSuccess,
  onError,
  availablePaymentMethods,
  paymentMethodsConfig,
}: {
  stripePromise: Promise<any>
  cartItems: CartItem[]
  shippingMethod: 'standard' | 'express'
  couponCode?: string
  onSuccess: (orderDetails: any) => void
  onError: (error: string) => void
  availablePaymentMethods: string[]
  paymentMethodsConfig: any
}) {
  const { user } = useCurrentUser()
  const [clientSecret, setClientSecret] = useState<string>('')
  const [elementsError, setElementsError] = useState(false)

  // Calculate real cart total - prices are now VAT-inclusive
  // Add debugging and validation for cart items
  console.log('🛒 Cart items for checkout:', cartItems.map(item => ({
    productId: item.productId,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    total: parseFloat(item.product.price.toString()) * item.quantity
  })))
  
  // Validate cart items for suspicious quantities
  const suspiciousItems = cartItems.filter(item => item.quantity > 10 && parseFloat(item.product.price.toString()) === 1)
  if (suspiciousItems.length > 0) {
    console.error('🚨 SUSPICIOUS CART QUANTITIES DETECTED:', suspiciousItems)
    console.error('🚨 This looks like a quantity bug - quantities over 10 for £1 items are unusual')
  }
  
  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price.toString()) * item.quantity), 0)
  
  // Check if cart contains STRIPE TEST ITEM for free shipping
  const hasStripeTestItem = cartItems.some(item => item.productId === 'stripe-test-item-1-pound' || 
    (item.product && typeof item.product === 'object' && 'slug' in item.product && item.product.slug === 'stripe-test-item-1-pound'))
  
  const shippingCost = hasStripeTestItem ? 0 : (shippingMethod === 'express' ? 9.99 : (subtotal >= 100 ? 0 : 7.99))
  
  // Total is now VAT-inclusive subtotal + shipping (no additional VAT)
  const total = Math.round((subtotal + shippingCost) * 100) // Convert to pence

  // Initialize payment intent with improved error handling
  useEffect(() => {
    const createPaymentIntent = async () => {
      console.log('🔄 Creating payment intent for total:', total)
      
      try {
        const requestData = {
          amount: total,
          currency: 'gbp',
          customerEmail: user?.email,
          cartItems: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            color: item.selectedColor,
            size: item.selectedSize,
          })),
          shippingMethod,
          couponCode,
        }
        
        console.log('📤 Payment intent request data:', JSON.stringify(requestData, null, 2))
        
        // Add timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
        
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        console.log('📥 Payment intent response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Payment intent creation failed:', response.status, errorText)
          throw new Error(`Payment setup failed (${response.status}): ${errorText}`)
        }

        const data = await response.json()
        console.log('✅ Payment intent response data:', data)
        
        if (data.clientSecret) {
          console.log('✅ Client secret received, setting up payment form')
          setClientSecret(data.clientSecret)
        } else {
          console.error('❌ No client secret in response:', data)
          throw new Error('Payment setup incomplete - missing client secret')
        }
      } catch (error: any) {
        console.error('❌ Payment intent creation failed:', error)
        
        if (error.name === 'AbortError') {
          console.error('⏰ Payment intent creation timed out')
          setElementsError(true)
        } else {
          setElementsError(true)
        }
      }
    }

    if (total > 0 && user?.email) {
      createPaymentIntent()
    } else if (total <= 0) {
      console.warn('⚠️ Invalid total amount:', total)
      setElementsError(true)
    } else if (!user?.email) {
      console.warn('⚠️ No user email available for payment intent')
      setElementsError(true)
    }
  }, [total, cartItems, shippingMethod, couponCode, user?.email])

  // Enhanced error and loading states
  if (elementsError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-red-600">
            <p className="font-medium">Payment System Error</p>
            <p className="text-sm mt-2">Unable to initialize secure payment form</p>
          </div>
          <div className="space-y-2 text-sm text-red-600">
            <p>Please try the following:</p>
            <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
              <li>Refresh the page and try again</li>
              <li>Clear your browser cache</li>
              <li>Check your internet connection</li>
              <li>Contact support if the issue persists</li>
            </ul>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-4"
          >
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!clientSecret) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-lg font-medium">Setting up secure payment...</p>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>🔒 Initializing encrypted payment form</p>
            <p>💳 Connecting to Stripe secure servers</p>
            <p>This may take a few moments</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  try {
    console.log('🎨 Rendering Stripe Elements with clientSecret:', clientSecret?.substring(0, 20) + '...')
    
    return (
      <Elements 
        stripe={stripePromise} 
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#000000',
              borderRadius: '8px',
              fontSizeBase: '16px'
            }
          },
          loader: 'auto'
        }}
      >
        <PaymentForm
          cartItems={cartItems}
          shippingMethod={shippingMethod}
          couponCode={couponCode}
          onSuccess={onSuccess}
          onError={onError}
          availablePaymentMethods={availablePaymentMethods}
          paymentMethodsConfig={paymentMethodsConfig}
        />
      </Elements>
    )
  } catch (error) {
    console.error('❌ Elements initialization error:', error)
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-red-600">
            <p className="font-medium">Payment Form Initialization Failed</p>
            <p className="text-sm mt-2">Unable to load secure payment interface</p>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-4"
          >
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    )
  }
}

// Internal payment form component
function PaymentForm({
  cartItems,
  shippingMethod,
  couponCode,
  onSuccess,
  onError,
  availablePaymentMethods,
  paymentMethodsConfig,
}: {
  cartItems: CartItem[]
  shippingMethod: 'standard' | 'express'
  couponCode?: string
  onSuccess: (orderDetails: any) => void
  onError: (error: string) => void
  availablePaymentMethods: string[]
  paymentMethodsConfig: any
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { user } = useCurrentUser()
  const { lockCart, unlockCart } = useCartStore()
  
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay' | 'klarna'>('card')
  const [addressData, setAddressData] = useState<any>(null)

  // Enhanced order creation with auth verification and retry logic
  const createOrderWithRetry = async (paymentIntentId: string, cartItems: any[], shippingMethod: string, couponCode?: string, maxRetries = 3): Promise<any | null> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Order creation attempt ${attempt}/${maxRetries} for payment ${paymentIntentId}`)
        
        // Verify authentication before order creation
        const sessionResponse = await fetch('/api/auth/session')
        const session = await sessionResponse.json()
        
        if (!session?.user) {
          console.error('❌ No authenticated session found for order creation')
          // Try to refresh session and retry
          if (attempt < maxRetries) {
            console.log('🔄 Refreshing session and retrying...')
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
            continue
          }
          return null
        }

        console.log('✅ Session verified, creating order for user:', session.user.email)
        
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId,
            cartItems,
            shippingMethod,
            couponCode,
          }),
        })

        if (!orderResponse.ok) {
          // Read error response body only once
          let errorData = {}
          try {
            errorData = await orderResponse.json()
          } catch (e) {
            console.warn('Could not parse error response as JSON')
            errorData = { message: 'Unknown error occurred' }
          }
          
          console.error(`❌ Order creation failed (attempt ${attempt}):`, errorData)
          
          // If authentication error and we have retries left, try again
          if (orderResponse.status === 401 && attempt < maxRetries) {
            console.log('🔄 Authentication error, retrying...')
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
            continue
          }
          
          // If server error and we have retries left, try again
          if (orderResponse.status >= 500 && attempt < maxRetries) {
            console.log('🔄 Server error, retrying...')
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
            continue
          }
          
          // Final attempt or non-retryable error
          if (attempt === maxRetries) {
            console.error('❌ All order creation attempts failed')
            return null
          }
          
          // This shouldn't be reached, but just in case
          return null
        }

        // Success path - read response body only once
        let orderData
        try {
          orderData = await orderResponse.json()
          console.log('✅ Order created successfully:', orderData)
          return orderData
        } catch (e) {
          console.error('❌ Failed to parse successful order response:', e)
          return null
        }
        
      } catch (error) {
        console.error(`❌ Order creation attempt ${attempt} failed:`, error)
        
        if (attempt < maxRetries) {
          console.log(`🔄 Retrying order creation in ${1000 * attempt}ms...`)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
          continue
        }
        
        console.error('❌ All order creation attempts failed due to network error')
        return null
      }
    }
    
    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setMessage('')
    
    // Lock cart during payment processing
    lockCart()

    try {
      // Get address data from AddressElement for billing details
      const addressElement = elements.getElement('address')
      let billingDetails = {
        email: user?.email || '', // Required since email field is set to 'never'
      }
      
      if (addressElement) {
        const addressValue = await addressElement.getValue()
        if (addressValue.complete && addressValue.value) {
          billingDetails = {
            ...billingDetails,
            name: addressValue.value.name || user?.name || '',
            phone: addressValue.value.phone || '',
            address: {
              line1: addressValue.value.address?.line1 || '',
              line2: addressValue.value.address?.line2 || '',
              city: addressValue.value.address?.city || '',
              state: addressValue.value.address?.state || '',
              postal_code: addressValue.value.address?.postal_code || '',
              country: addressValue.value.address?.country || 'GB'
            }
          }
          console.log('📍 Using billing details from address:', billingDetails)
        }
      } else {
        // Fallback when no address element (include basic user info)
        billingDetails = {
          ...billingDetails,
          name: user?.name || '',
        }
      }

      // Confirm the payment using Stripe Elements with billing details
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/confirmation`,
          payment_method_data: {
            billing_details: billingDetails
          }
        },
        redirect: 'if_required',
      })

      if (error) {
        throw new Error(error.message || 'Payment failed')
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful
        toast.success('Payment successful! Creating your order...')
        
        // Create order in our system with retry logic
        const orderData = await createOrderWithRetry(paymentIntent.id, cartItems, shippingMethod, couponCode)
        
        if (orderData) {
          toast.success('Order confirmed! Redirecting...')
          // Cart will be cleared and unlocked via clearCartAfterPayment in the parent component
          onSuccess(orderData)
          // Redirect to order confirmation
          router.push(`/checkout/confirmation?order=${paymentIntent.id}`)
        } else {
          // Payment succeeded but order creation failed - show recovery options
          setMessage('Payment successful but order creation failed. Please contact support with payment ID: ' + paymentIntent.id)
          toast.error('Order creation failed. Your payment was processed successfully.')
          // Unlock cart since we won't be clearing it
          unlockCart()
        }

      } else if (paymentIntent && paymentIntent.status === 'processing') {
        setMessage('Your payment is being processed. Please wait...')
        
        // Enhanced polling with exponential backoff
        setTimeout(() => checkPaymentStatus(paymentIntent.id, ''), 2000)

      } else {
        throw new Error('Payment was not completed')
      }

    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setMessage(errorMessage)
      onError(errorMessage)
      toast.error(errorMessage)
      
      // Unlock cart on payment error
      unlockCart()
    } finally {
      setProcessing(false)
    }
  }

  const checkPaymentStatus = async (paymentIntentId: string, orderId: string, attempt: number = 1, maxAttempts: number = 10) => {
    try {
      console.log(`🔄 Checking payment status (attempt ${attempt}/${maxAttempts}) for payment ${paymentIntentId}`)
      
      const response = await fetch(
        `/api/payments/confirm?payment_intent_id=${paymentIntentId}`
      )
      
      if (!response.ok) {
        throw new Error(`Payment status check failed: ${response.status}`)
      }
      
      const data = await response.json()

      if (data.order?.status === 'CONFIRMED') {
        console.log('✅ Payment confirmed successfully')
        toast.success('Payment confirmed!')
        
        // Try to create order if not already created
        if (!data.order.orderNumber) {
          const orderData = await createOrderWithRetry(paymentIntentId, cartItems, shippingMethod, couponCode)
          if (orderData) {
            // Cart will be cleared and unlocked via clearCartAfterPayment in the parent component
            onSuccess(orderData)
            router.push(`/checkout/confirmation?order=${paymentIntentId}`)
          } else {
            setMessage('Payment confirmed but order creation failed. Please contact support.')
            unlockCart()
          }
        } else {
          // Cart will be cleared and unlocked via clearCartAfterPayment in the parent component
          onSuccess(data)
          router.push(`/checkout/confirmation?order=${data.order.orderNumber}`)
        }
        
      } else if (data.order?.paymentStatus === 'PROCESSING' || data.paymentStatus === 'processing') {
        if (attempt >= maxAttempts) {
          console.error('❌ Payment status check timed out after maximum attempts')
          setMessage('Payment is taking longer than expected. Please check your email for confirmation or contact support.')
          toast.warning('Payment status check timed out. Please contact support if needed.')
          unlockCart()
          return
        }
        
        // Exponential backoff: start at 2s, max 30s
        const delay = Math.min(2000 * Math.pow(1.5, attempt - 1), 30000)
        const nextAttempt = attempt + 1
        
        setMessage(`Payment is still processing... (${nextAttempt}/${maxAttempts})`)
        console.log(`⏳ Payment still processing, retrying in ${delay}ms (attempt ${nextAttempt}/${maxAttempts})`)
        
        setTimeout(() => checkPaymentStatus(paymentIntentId, orderId, nextAttempt, maxAttempts), delay)
        
      } else if (data.paymentStatus === 'succeeded') {
        console.log('✅ Payment succeeded, creating order')
        // Payment succeeded but no order yet - create it
        const orderData = await createOrderWithRetry(paymentIntentId, cartItems, shippingMethod, couponCode)
        if (orderData) {
          toast.success('Payment confirmed and order created!')
          // Cart will be cleared and unlocked via clearCartAfterPayment in the parent component
          onSuccess(orderData)
          router.push(`/checkout/confirmation?order=${paymentIntentId}`)
        } else {
          setMessage('Payment succeeded but order creation failed. Please contact support with payment ID: ' + paymentIntentId)
          unlockCart()
        }
        
      } else if (data.paymentStatus === 'failed' || data.order?.paymentStatus === 'FAILED') {
        console.error('❌ Payment failed during processing')
        setMessage('Payment failed during processing. Please try again.')
        toast.error('Payment failed. Please try again or use a different payment method.')
        unlockCart()
        
      } else {
        console.warn('🤔 Unknown payment status:', data)
        if (attempt < maxAttempts) {
          const delay = Math.min(3000 * attempt, 15000) // 3s, 6s, 9s, up to 15s
          setTimeout(() => checkPaymentStatus(paymentIntentId, orderId, attempt + 1, maxAttempts), delay)
        } else {
          setMessage('Unable to confirm payment status. Please contact support.')
          toast.error('Payment status unclear. Please contact support.')
          unlockCart()
        }
      }
      
    } catch (error) {
      console.error(`❌ Error checking payment status (attempt ${attempt}):`, error)
      
      if (attempt < maxAttempts) {
        // Exponential backoff for network errors
        const delay = Math.min(2000 * Math.pow(2, attempt - 1), 30000)
        const nextAttempt = attempt + 1
        
        console.log(`🔄 Retrying payment status check in ${delay}ms (attempt ${nextAttempt}/${maxAttempts})`)
        setMessage(`Connection error, retrying... (${nextAttempt}/${maxAttempts})`)
        
        setTimeout(() => checkPaymentStatus(paymentIntentId, orderId, nextAttempt, maxAttempts), delay)
      } else {
        console.error('❌ All payment status check attempts failed')
        setMessage('Unable to check payment status due to connection issues. Please contact support.')
        toast.error('Connection error. Please check your email for payment confirmation.')
        unlockCart()
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Collection */}
          <div>
            <h3 className="font-medium mb-4">Delivery Address</h3>
            <div className="min-h-[200px] transition-all duration-300 ease-in-out">
              <AddressElement options={{
                mode: 'shipping',
                autocomplete: {
                  mode: 'automatic'
                },
                display: {
                  name: 'full' // Use full name field to avoid conflicts
                },
                fields: {
                  phone: 'always' // Always show phone field
                },
                validation: {
                  phone: {
                    required: 'always'
                  }
                },
                // Pre-fill with existing user data if available
                defaultValues: user ? {
                  name: user.name || '',
                  address: {
                    line1: (user as any).address || '',
                    line2: (user as any).addressLine2 || '',
                    city: (user as any).city || '',
                    state: (user as any).state || '',
                    postal_code: (user as any).postalCode || '',
                    country: (user as any).country || 'GB'
                  },
                  phone: (user as any).phone || ''
                } : undefined
              }} />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="font-medium mb-4">Payment Method</h3>
            <PaymentElement options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false
              },
              fields: {
                billingDetails: {
                  name: 'never',    // Don't show name field (already in AddressElement)
                  email: 'never',   // Don't show email field (user already logged in)
                  phone: 'never',   // Don't show phone field (already in AddressElement)
                  address: 'never'  // Don't show address field (already in AddressElement)
                }
              },
              terms: {
                card: 'never'        // Disable card terms (account creation)
              }
            }} />
          </div>


          {/* Error/Status Message with Recovery Actions */}
          {message && (
            <Alert variant={message.includes('error') || message.includes('failed') ? 'destructive' : 'default'}>
              <AlertDescription>
                <div className="space-y-2">
                  <p>{message}</p>
                  
                  {/* Recovery actions based on message content */}
                  {message.includes('order creation failed') && (
                    <div className="space-y-2 mt-3">
                      <p className="text-sm font-medium">What you can do:</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Your payment was processed successfully - you will not be charged again</li>
                        <li>Check your email for payment confirmation from Stripe</li>
                        <li>Contact support with the payment ID shown above</li>
                        <li>Do not attempt to place the order again</li>
                      </ul>
                    </div>
                  )}
                  
                  {message.includes('Payment failed') && (
                    <div className="space-y-2 mt-3">
                      <p className="text-sm font-medium">What you can try:</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Check that your card details are correct</li>
                        <li>Ensure you have sufficient funds or credit available</li>
                        <li>Try a different payment method</li>
                        <li>Contact your bank if the problem persists</li>
                      </ul>
                    </div>
                  )}
                  
                  {message.includes('Connection error') && (
                    <div className="space-y-2 mt-3">
                      <p className="text-sm font-medium">Connection issues:</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Check your internet connection</li>
                        <li>Try refreshing the page</li>
                        <li>If payment was processing, check your email for confirmation</li>
                        <li>Contact support if you're unsure about payment status</li>
                      </ul>
                    </div>
                  )}
                  
                  {message.includes('taking longer than expected') && (
                    <div className="space-y-2 mt-3">
                      <p className="text-sm font-medium">Payment processing delay:</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Your payment may still be processing - do not retry</li>
                        <li>Check your email for updates from Stripe</li>
                        <li>Check your bank account or card statement</li>
                        <li>Contact support if no confirmation received within 30 minutes</li>
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!stripe || processing}
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Complete Order
              </>
            )}
          </Button>

          {/* Security Notice */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>🔒 Your payment information is encrypted and secure</p>
            <p>💳 Powered by Stripe - trusted by millions worldwide</p>
            <p>🇬🇧 UK VAT included • Free returns within 30 days</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Fallback payment form for when Stripe is not configured
function FallbackPaymentForm({ cartItems, shippingMethod }: {
  cartItems: CartItem[]
  shippingMethod: 'standard' | 'express'
}) {
  const { user } = useCurrentUser()
  const [formData, setFormData] = useState({
    // Delivery Address
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: 'GB',
    
    // Payment Method
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: user?.name || '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.error('Stripe payment processing is not configured. Please contact support to complete your order.')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Order</CardTitle>
        <Alert>
          <AlertDescription>
            Payment processing is currently being configured. You can preview the checkout form below.
          </AlertDescription>
        </Alert>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Delivery Address */}
          <div>
            <h3 className="font-medium mb-4">Delivery Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+44 7xxx xxx xxx"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                <Input
                  id="addressLine1"
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  placeholder="Street number and name"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>
              
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder="SW1A 1AA"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="country">Country *</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="font-medium mb-4">Payment Method</h3>
            <div className="space-y-4">
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Credit or Debit Card</span>
                </div>
                <p className="text-sm text-blue-700">We accept Visa and Mastercard</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                    <Input
                      id="expiryDate"
                      type="text"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cvv">CVV *</Label>
                    <Input
                      id="cvv"
                      type="text"
                      value={formData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="cardholderName">Cardholder Name *</Label>
                  <Input
                    id="cardholderName"
                    type="text"
                    value={formData.cardholderName}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                    placeholder="Name as it appears on card"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            variant="outline"
            disabled
          >
            <Shield className="h-4 w-4 mr-2" />
            Payment Processing Setup Required
          </Button>

          {/* Security Notice */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>🔒 Your payment information is encrypted and secure</p>
            <p>💳 Powered by Stripe - trusted by millions worldwide</p>
            <p>🇬🇧 UK VAT included • Free returns within 30 days</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}