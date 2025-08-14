import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined')
    }
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

export const createCheckoutSession = async (orderData: {
  orderId: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  customerEmail?: string
  customerName?: string
  shippingAddress?: any
  billingAddress?: any
}) => {
  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create checkout session')
  }

  const { sessionId, url } = await response.json()
  
  // Redirect to Stripe Checkout
  if (url) {
    window.location.href = url
    return { sessionId, url }
  }
  
  // Fallback to programmatic redirect
  const stripe = await getStripe()
  if (stripe) {
    const { error } = await stripe.redirectToCheckout({ sessionId })
    if (error) {
      throw new Error(error.message)
    }
  }
  
  return { sessionId, url }
}