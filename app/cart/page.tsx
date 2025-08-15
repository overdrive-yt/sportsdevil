'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Separator } from '../../components/ui/separator'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Header } from '../../components/header'
import { Footer } from '../../components/footer'
import { Plus, Minus, X, ShoppingBag, Truck, Shield, ArrowRight } from 'lucide-react'
import { useCartStore } from '../../stores/cart-store'
import { formatPriceSimple } from '../../lib/utils'

export default function CartPage() {
  const [couponCode, setCouponCode] = useState('')
  
  const { 
    items, 
    appliedCoupon,
    updateQuantity, 
    removeItem, 
    getSubtotal,
    getDiscountAmount,
    getFinalTotal,
    getTotalItems,
    clearCart,
    applyCoupon,
    removeCoupon
  } = useCartStore()

  const subtotal = getSubtotal()
  
  // Check if cart contains STRIPE TEST ITEM for free shipping
  const hasStripeTestItem = items?.some(item => item.product.slug === 'stripe-test-item-1-pound') || false
  const shippingCost = hasStripeTestItem ? 0 : (subtotal >= 100 ? 0 : 7.99)
  
  const discountAmount = getDiscountAmount()
  const discountedSubtotal = subtotal - discountAmount
  
  // Calculate VAT amount for transparency (VAT is already included in prices)
  const vatAmount = discountedSubtotal * (0.2 / 1.2) // Extract VAT from VAT-inclusive price
  
  // Total is now VAT-inclusive subtotal + shipping - discount
  const total = discountedSubtotal + shippingCost

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

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
        
        // Show success toast
        const successMessage = `${result.data.code} applied! Saved £${currentDiscount.toFixed(2)}`
        alert(successMessage) // You can replace with toast later
      } else {
        alert(result.error || 'Invalid coupon code')
      }
    } catch (error) {
      console.error('Error validating coupon:', error)
      alert('Error validating coupon code. Please try again.')
    }
  }

  const handleRemoveCoupon = () => {
    removeCoupon()
  }

  if (!items || items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Button asChild size="lg">
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Start Shopping
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
            <p className="text-muted-foreground">
              {getTotalItems()} item{getTotalItems() > 1 ? 's' : ''} in your cart
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Cart Items</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-destructive hover:text-destructive"
                  >
                    Clear Cart
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items?.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium line-clamp-2">{item.product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatPriceSimple(Number(item.product.price))} each
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-medium">
                            {formatPriceSimple(Number(item.product.price) * item.quantity)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive p-1"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {index < (items?.length || 0) - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Continue Shopping */}
              <div className="mt-6">
                <Button variant="outline" asChild>
                  <Link href="/products">
                    <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Coupon Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Coupon Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                      <div>
                        <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                        <p className="text-sm text-green-600">
                          -{formatPriceSimple(discountAmount)} discount applied
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-green-800 hover:text-green-900"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <Button onClick={handleApplyCoupon} disabled={!couponCode.trim()}>
                          Apply
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPriceSimple(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="ml-4">• includes VAT (20%)</span>
                    <span>{formatPriceSimple(vatAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="flex items-center space-x-1">
                      <Truck className="h-4 w-4" />
                      <span>Shipping</span>
                    </span>
                    <span>
                      {shippingCost === 0 ? (
                        <Badge variant="secondary">
                          {hasStripeTestItem ? 'Free (Test Item)' : 'Free'}
                        </Badge>
                      ) : (
                        formatPriceSimple(shippingCost)
                      )}
                    </span>
                  </div>

                  {subtotal < 100 && (
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Add {formatPriceSimple(100 - subtotal)} more for free shipping!
                      </AlertDescription>
                    </Alert>
                  )}

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPriceSimple(discountAmount)}</span>
                    </div>
                  )}

                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPriceSimple(total)}</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <p>All prices include UK VAT</p>
                  </div>

                  <Button asChild className="w-full" size="lg">
                    <Link href="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4" />
                      <span>Free returns within 30 days</span>
                    </div>
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