"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Calculator, 
  Clock, 
  Percent, 
  Package, 
  Plus,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import {
  calculateAddOnTotal,
  getServiceDescription,
  type SelectedAddOn
} from '@/lib/add-ons/services'

interface PriceCalculatorProps {
  basePrice: number
  productName: string
  selectedAddOns: SelectedAddOn[]
  productVariationPrice?: number
  onAddToCart?: () => void
  loading?: boolean
}

export function PriceCalculator({
  basePrice,
  productName,
  selectedAddOns,
  productVariationPrice,
  onAddToCart,
  loading = false
}: PriceCalculatorProps) {
  const [totals, setTotals] = useState({
    subtotal: 0,
    bundleDiscount: 0,
    total: 0,
    maxEstimatedDays: 0
  })

  const [finalTotals, setFinalTotals] = useState({
    productPrice: basePrice,
    addOnsSubtotal: 0,
    addOnsDiscount: 0,
    addOnsTotal: 0,
    orderTotal: basePrice,
    estimatedDelivery: 0
  })

  useEffect(() => {
    const addOnTotals = calculateAddOnTotal(selectedAddOns)
    setTotals(addOnTotals)

    // Calculate final order totals
    const productPrice = productVariationPrice || basePrice
    const orderTotal = productPrice + addOnTotals.total
    const estimatedDelivery = Math.max(addOnTotals.maxEstimatedDays, 0)

    setFinalTotals({
      productPrice,
      addOnsSubtotal: addOnTotals.subtotal,
      addOnsDiscount: addOnTotals.bundleDiscount,
      addOnsTotal: addOnTotals.total,
      orderTotal,
      estimatedDelivery
    })
  }, [selectedAddOns, basePrice, productVariationPrice])

  const hasAddOns = selectedAddOns.length > 0
  const hasDiscount = totals.bundleDiscount > 0

  return (
    <div className="space-y-4">
      {/* Quick Add-on Summary (when collapsed) */}
      {hasAddOns && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {selectedAddOns.length} Add-on Service{selectedAddOns.length === 1 ? '' : 's'}
                </span>
                {hasDiscount && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    Bundle Savings
                  </Badge>
                )}
              </div>
              <div className="text-right">
                {hasDiscount && (
                  <div className="text-xs text-green-600 line-through">
                    £{totals.subtotal.toFixed(2)}
                  </div>
                )}
                <div className="font-semibold text-blue-700">
                  +£{totals.total.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Price Calculator */}
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Product Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">{productName}</span>
              {productVariationPrice && productVariationPrice !== basePrice && (
                <div className="text-sm text-gray-500">
                  With selected options
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="font-semibold">
                £{finalTotals.productPrice.toFixed(2)}
              </div>
              {productVariationPrice && productVariationPrice !== basePrice && (
                <div className="text-xs text-gray-500">
                  Base: £{basePrice.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Add-on Services */}
          {hasAddOns && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Add-on Services</span>
                </div>

                {/* Individual Services */}
                {selectedAddOns.map((addon, index) => (
                  <div key={index} className="ml-6 flex items-start justify-between text-sm">
                    <div className="flex-1">
                      <div className="font-medium">
                        {getServiceDescription(addon.serviceId, addon.optionId)}
                      </div>
                      {addon.quantity > 1 && (
                        <div className="text-xs text-gray-500">
                          Qty: {addon.quantity}
                        </div>
                      )}
                      {addon.customText && (
                        <div className="text-xs text-gray-500">
                          "{addon.customText}"
                        </div>
                      )}
                      {addon.estimatedDays > 0 && (
                        <div className="text-xs text-amber-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          +{addon.estimatedDays} day{addon.estimatedDays === 1 ? '' : 's'}
                        </div>
                      )}
                    </div>
                    <span className="font-medium">
                      £{addon.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}

                {/* Add-ons Subtotal */}
                <div className="ml-6 flex items-center justify-between text-sm border-t pt-2">
                  <span>Services Subtotal:</span>
                  <span>£{finalTotals.addOnsSubtotal.toFixed(2)}</span>
                </div>

                {/* Bundle Discount */}
                {hasDiscount && (
                  <div className="ml-6 flex items-center justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      Bundle Discount:
                    </span>
                    <span>-£{finalTotals.addOnsDiscount.toFixed(2)}</span>
                  </div>
                )}

                {/* Add-ons Total */}
                <div className="ml-6 flex items-center justify-between font-medium border-t pt-2">
                  <span>Services Total:</span>
                  <span className="text-blue-600">
                    £{finalTotals.addOnsTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Order Total */}
          <Separator />
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-green-600">
              £{finalTotals.orderTotal.toFixed(2)}
            </span>
          </div>

          {/* Delivery Information */}
          {finalTotals.estimatedDelivery > 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Extended Processing Time</span>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                Add-on services will add {finalTotals.estimatedDelivery} extra day{finalTotals.estimatedDelivery === 1 ? '' : 's'} to delivery
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Ready for Standard Delivery</span>
              </div>
            </div>
          )}

          {/* Savings Display */}
          {hasDiscount && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Bundle Savings:
                  </span>
                </div>
                <span className="text-sm font-bold text-green-700">
                  £{finalTotals.addOnsDiscount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          {onAddToCart && (
            <Button 
              className="w-full" 
              size="lg" 
              onClick={onAddToCart}
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              {loading ? 'Adding to Cart...' : `Add to Cart - £${finalTotals.orderTotal.toFixed(2)}`}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}