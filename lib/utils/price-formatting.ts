// Price Formatting Utilities
// Handles Prisma Decimal objects and provides safe price formatting across the application

import { Decimal } from '@prisma/client/runtime/library'

// Type guard to check if value is a Prisma Decimal
export function isDecimal(value: any): value is Decimal {
  return value && typeof value === 'object' && typeof value.toNumber === 'function'
}

// Safely convert Prisma Decimal or any price value to number
export function toNumber(price: number | string | Decimal | null | undefined): number {
  if (price === null || price === undefined) {
    return 0
  }
  
  if (typeof price === 'number') {
    return isNaN(price) ? 0 : price
  }
  
  if (typeof price === 'string') {
    const parsed = parseFloat(price)
    return isNaN(parsed) ? 0 : parsed
  }
  
  if (isDecimal(price)) {
    try {
      return price.toNumber()
    } catch (error) {
      console.warn('Failed to convert Decimal to number:', error)
      return 0
    }
  }
  
  // Fallback for unknown types
  const parsed = parseFloat(String(price))
  return isNaN(parsed) ? 0 : parsed
}

// Format price with currency symbol
export function formatPrice(price: number | string | Decimal | null | undefined, currency: string = '£'): string {
  const numPrice = toNumber(price)
  return `${currency}${numPrice.toFixed(2)}`
}

// Format price range (for products with min/max pricing)
export function formatPriceRange(
  minPrice: number | string | Decimal | null | undefined,
  maxPrice: number | string | Decimal | null | undefined,
  currency: string = '£'
): string {
  const min = toNumber(minPrice)
  const max = toNumber(maxPrice)
  
  if (min === max || max === 0) {
    return formatPrice(min, currency)
  }
  
  return `${currency}${min.toFixed(2)} - ${currency}${max.toFixed(2)}`
}

// Calculate discount percentage safely
export function calculateDiscountPercentage(
  originalPrice: number | string | Decimal | null | undefined,
  salePrice: number | string | Decimal | null | undefined
): number {
  const original = toNumber(originalPrice)
  const sale = toNumber(salePrice)
  
  if (original === 0 || sale >= original) {
    return 0
  }
  
  return Math.round(((original - sale) / original) * 100)
}

// Check if product has discount
export function hasDiscount(
  originalPrice: number | string | Decimal | null | undefined,
  salePrice: number | string | Decimal | null | undefined
): boolean {
  const original = toNumber(originalPrice)
  const sale = toNumber(salePrice)
  
  return original > 0 && sale > 0 && original > sale
}

// Format price with discount information
export function formatPriceWithDiscount(
  price: number | string | Decimal | null | undefined,
  originalPrice?: number | string | Decimal | null | undefined,
  currency: string = '£'
): {
  currentPrice: string
  originalPrice?: string
  discountPercentage?: number
  hasDiscount: boolean
} {
  const current = toNumber(price)
  const original = originalPrice ? toNumber(originalPrice) : null
  
  const result: any = {
    currentPrice: formatPrice(current, currency),
    hasDiscount: false
  }
  
  if (original && hasDiscount(original, current)) {
    result.originalPrice = formatPrice(original, currency)
    result.discountPercentage = calculateDiscountPercentage(original, current)
    result.hasDiscount = true
  }
  
  return result
}

// Safe price comparison
export function comparePrices(
  price1: number | string | Decimal | null | undefined,
  price2: number | string | Decimal | null | undefined
): number {
  const p1 = toNumber(price1)
  const p2 = toNumber(price2)
  
  if (p1 < p2) return -1
  if (p1 > p2) return 1
  return 0
}

// Validate price value
export function isValidPrice(price: any): boolean {
  const num = toNumber(price)
  return num >= 0 && num < 999999 // Reasonable price limits
}

// Convert price for API responses (ensure consistent number format)
export function serializePrice(price: number | string | Decimal | null | undefined): number {
  return toNumber(price)
}

// Batch convert prices in product objects
export function serializePricesInProduct<T extends Record<string, any>>(product: T): T {
  const result = { ...product }
  
  // Convert common price fields
  const priceFields = ['price', 'originalPrice', 'salePrice', 'minPrice', 'maxPrice', 'basePrice']
  
  for (const field of priceFields) {
    if (field in result && result[field] !== null && result[field] !== undefined) {
      (result as any)[field] = serializePrice(result[field])
    }
  }
  
  return result
}

// Batch convert prices in array of products
export function serializePricesInProducts<T extends Record<string, any>>(products: T[]): T[] {
  return products.map(product => serializePricesInProduct(product))
}