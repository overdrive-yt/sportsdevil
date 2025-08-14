import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(price)
}

export function formatPriceSimple(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price)
  return `£${numPrice.toFixed(2)}`
}

export function parsePrice(priceString: string): number {
  const cleanPrice = priceString.replace(/[£$€,\s]/g, '')
  return parseFloat(cleanPrice) || 0
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}
