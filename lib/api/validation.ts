import { z } from 'zod'

// Product validation schemas
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  originalPrice: z.number().positive().optional(),
  sku: z.string().min(1, 'SKU is required').max(100),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative'),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  attributes: z.record(z.string()).default({}),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
  metaKeywords: z.string().max(255).optional(),
})

export const productUpdateSchema = productSchema.partial()

export const productQuerySchema = z.object({
  page: z.string().optional().transform((val) => val ? Number(val) : undefined),
  limit: z.string().optional().transform((val) => val ? Number(val) : undefined),
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.string().optional().transform((val) => val ? Number(val) : undefined),
  maxPrice: z.string().optional().transform((val) => val ? Number(val) : undefined),
  featured: z.string().optional().transform((val) => val ? val === 'true' : undefined),
  new: z.string().optional().transform((val) => val ? val === 'true' : undefined),
  inStock: z.string().optional().transform((val) => val ? val === 'true' : undefined),
  sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

// Category validation schemas
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255),
  description: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).optional(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
  metaKeywords: z.string().max(255).optional(),
})

export const categoryUpdateSchema = categorySchema.partial()

// Cart validation schemas
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  selectedColor: z.string().optional(),
  selectedSize: z.string().optional(),
})

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be positive'),
})

// User profile validation schemas
export const userProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Order validation schemas - Updated for payment-flow integration
export const orderSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  cartItems: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    selectedColor: z.string().optional(),
    selectedSize: z.string().optional(),
    product: z.object({
      name: z.string(),
      price: z.union([z.string(), z.number()]),
      image: z.string().optional(),
      primaryImage: z.object({
        url: z.string(),
        alt: z.string(),
      }).optional(),
    }),
  })).min(1, 'Cart must contain at least one item'),
  shippingMethod: z.enum(['standard', 'express']),
  couponCode: z.string().optional(),
})

// Legacy order schema for backward compatibility (if needed)
export const legacyOrderSchema = z.object({
  shippingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  billingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  paymentMethod: z.enum(['CARD', 'PAYPAL', 'CASH_ON_DELIVERY']),
  notes: z.string().max(500).optional(),
})

export const orderStatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  trackingNumber: z.string().optional(),
  notes: z.string().max(500).optional(),
})

// Coupon validation schemas
export const couponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').max(50),
  description: z.string().min(1, 'Description is required').max(255),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().positive('Discount value must be positive'),
  minimumAmount: z.number().min(0).optional(),
  maximumDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  usedCount: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  validFrom: z.string().transform((str) => new Date(str)),
  validUntil: z.string().transform((str) => new Date(str)),
})

export const applyCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
})

// Appointment validation schemas
export const appointmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required').max(20),
  service: z.string().min(1, 'Service is required').max(255),
  preferredDate: z.string().transform((str) => new Date(str)),
  preferredTime: z.string().min(1, 'Preferred time is required'),
  notes: z.string().max(500).optional(),
})

export const appointmentUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  confirmedDate: z.string().transform((str) => new Date(str)).optional(),
  confirmedTime: z.string().optional(),
  notes: z.string().max(500).optional(),
})

// Search validation schemas
export const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  type: z.enum(['products', 'categories', 'all']).default('all'),
  limit: z.string().transform(Number).optional(),
})

export const filtersSchema = z.object({
  categories: z.array(z.string()).optional(),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().positive(),
  }).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  inStock: z.boolean().optional(),
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
})

// Common ID schema
export const idSchema = z.object({
  id: z.string().min(1, 'ID is required'),
})