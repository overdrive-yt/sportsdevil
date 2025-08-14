export interface PriceCalculation {
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  vatInclusiveSubtotal: number // For transparency - shows VAT amount within the subtotal
}

export interface CartItem {
  price: number
  quantity: number
}

export interface CouponDiscount {
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number
  maximumDiscount?: number
  minimumAmount?: number
}

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

export function calculateTax(subtotal: number, taxRate: number = 0.2): number {
  // For VAT-inclusive pricing, calculate the VAT amount within the subtotal
  return subtotal * (taxRate / (1 + taxRate))
}

export function calculateVATFromInclusive(inclusiveAmount: number, taxRate: number = 0.2): number {
  // Calculate VAT amount from VAT-inclusive price
  return inclusiveAmount * (taxRate / (1 + taxRate))
}

export function calculateShipping(
  subtotal: number,
  freeShippingThreshold: number = 100,
  shippingCost: number = 10,
  itemSlugs: string[] = []
): number {
  // Free shipping for STRIPE TEST ITEM
  if (itemSlugs.includes('stripe-test-item-1-pound')) {
    return 0
  }
  return subtotal >= freeShippingThreshold ? 0 : shippingCost
}

export function applyCouponDiscount(
  subtotal: number,
  coupon?: CouponDiscount
): number {
  if (!coupon) return 0

  if (coupon.minimumAmount && subtotal < coupon.minimumAmount) {
    return 0
  }

  let discount = 0

  if (coupon.type === 'PERCENTAGE') {
    discount = subtotal * (coupon.value / 100)
  } else if (coupon.type === 'FIXED_AMOUNT') {
    discount = coupon.value
  }

  if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
    discount = coupon.maximumDiscount
  }

  return Math.min(discount, subtotal)
}

export function calculateTotal(
  items: CartItem[],
  options: {
    taxRate?: number
    freeShippingThreshold?: number
    shippingCost?: number
    coupon?: CouponDiscount
    itemSlugs?: string[]
  } = {}
): PriceCalculation {
  // All item prices are now VAT-inclusive
  const subtotal = calculateSubtotal(items)
  const discount = applyCouponDiscount(subtotal, options.coupon)
  const discountedSubtotal = subtotal - discount
  
  // Calculate VAT amount for transparency (VAT is already included in prices)
  const vatInclusiveSubtotal = calculateVATFromInclusive(discountedSubtotal, options.taxRate)
  
  // Calculate shipping (with special handling for test item)
  const shipping = calculateShipping(
    subtotal,
    options.freeShippingThreshold,
    options.shippingCost,
    options.itemSlugs
  )
  
  // Total is just subtotal (VAT-inclusive) + shipping - discount
  // No additional VAT is added since prices are already VAT-inclusive
  const total = discountedSubtotal + shipping

  return {
    subtotal,
    tax: vatInclusiveSubtotal, // VAT amount for display purposes only
    shipping,
    discount,
    total,
    vatInclusiveSubtotal, // For transparency - shows VAT amount within the subtotal
  }
}

export function formatPrice(price: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(price)
}

export function formatPriceSimple(price: number): string {
  return `£${price.toFixed(2)}`
}

export function parsePrice(priceString: string): number {
  const cleanPrice = priceString.replace(/[£$€,\s]/g, '')
  return parseFloat(cleanPrice) || 0
}