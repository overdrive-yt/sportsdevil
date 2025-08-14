// Cricket Bat Add-on Services System
// Provides 4 specialized services for cricket bats only

export interface AddOnService {
  id: string
  name: string
  description: string
  basePrice: number
  category: 'personalization' | 'maintenance' | 'customization'
  applicableProductTypes: string[]
  options?: AddOnOption[]
  maxQuantity: number
  isAvailable: boolean
  estimatedDays: number // Delivery time impact
  order: number
}

export interface AddOnOption {
  id: string
  name: string
  description?: string
  priceModifier: number // Additional cost beyond base price
  metadata?: Record<string, any>
  isAvailable: boolean
  order: number
}

export interface SelectedAddOn {
  serviceId: string
  optionId?: string
  quantity: number
  customText?: string // For engraving
  totalPrice: number
  estimatedDays: number
}

export interface AddOnBundle {
  id: string
  name: string
  description: string
  services: string[] // Service IDs included
  discount: number // Percentage discount
  minServiceCount: number
  isAvailable: boolean
}

// Cricket Bat Add-on Service Definitions (4 Services Only)
export const ADD_ON_SERVICES: AddOnService[] = [
  {
    id: 'personalized-engraving',
    name: 'Personalized Engraving',
    description: 'Custom text engraving on your cricket bat (max 20 characters)',
    basePrice: 15,
    category: 'personalization',
    applicableProductTypes: ['cricket-bats'], // Cricket bats only
    maxQuantity: 1,
    isAvailable: true,
    estimatedDays: 3,
    order: 1,
    options: [
      {
        id: 'standard-engraving',
        name: 'Standard Text',
        description: 'Name or short text (max 20 chars)',
        priceModifier: 0,
        isAvailable: true,
        order: 1
      },
      {
        id: 'premium-engraving',
        name: 'Premium Font Style',
        description: 'Elegant script or decorative fonts',
        priceModifier: 5,
        isAvailable: true,
        order: 2
      }
    ]
  },
  {
    id: 'oiling-scuff-sheet',
    name: 'Oiling & Scuff Sheet',
    description: 'Professional bat oiling service with protective scuff sheet application',
    basePrice: 12,
    category: 'maintenance',
    applicableProductTypes: ['cricket-bats'], // Cricket bats only
    maxQuantity: 1,
    isAvailable: true,
    estimatedDays: 2,
    order: 2,
    options: [
      {
        id: 'standard-oiling',
        name: 'Standard Oiling & Scuff Sheet',
        description: 'Premium linseed oil treatment with basic scuff sheet',
        priceModifier: 0,
        isAvailable: true,
        order: 1
      },
      {
        id: 'premium-oiling',
        name: 'Premium Oiling & Scuff Sheet',
        description: 'High-grade oil treatment with premium protective scuff sheet',
        priceModifier: 8,
        isAvailable: true,
        order: 2
      }
    ]
  },
  {
    id: 'extra-grip',
    name: 'Extra Grip',
    description: 'Additional grip installation for enhanced bat handling',
    basePrice: 10,
    category: 'customization',
    applicableProductTypes: ['cricket-bats'], // Cricket bats only
    maxQuantity: 5, // Allow multiple grips with increase/decrease buttons
    isAvailable: true,
    estimatedDays: 1,
    order: 3,
    options: [
      {
        id: 'standard-grip',
        name: 'Standard Grip',
        description: 'Basic rubber grip in black',
        priceModifier: 0,
        isAvailable: true,
        order: 1
      },
      {
        id: 'premium-grip',
        name: 'Premium Grip',
        description: 'High-quality grip with enhanced feel',
        priceModifier: 5,
        isAvailable: true,
        order: 2
      },
      {
        id: 'colored-grip',
        name: 'Colored Grip',
        description: 'Choice of colors: Red, Blue, Green, Yellow',
        priceModifier: 3,
        isAvailable: true,
        order: 3
      }
    ]
  },
  {
    id: 'bat-knocking',
    name: 'Bat Knocking',
    description: 'Professional bat knocking service to prepare your bat for play',
    basePrice: 20,
    category: 'maintenance',
    applicableProductTypes: ['cricket-bats'], // Cricket bats only
    maxQuantity: 1,
    isAvailable: true,
    estimatedDays: 5,
    order: 4,
    options: [
      {
        id: 'basic-knocking',
        name: 'Basic Knocking',
        description: 'Standard bat knocking service (6-8 hours)',
        priceModifier: 0,
        isAvailable: true,
        order: 1
      },
      {
        id: 'premium-knocking',
        name: 'Premium Knocking',
        description: 'Extended knocking service with edge rounding (10-12 hours)',
        priceModifier: 10,
        isAvailable: true,
        order: 2
      }
    ]
  }
]

// Cricket Bat Service Bundle Definitions
export const ADD_ON_BUNDLES: AddOnBundle[] = [
  {
    id: 'complete-cricket-preparation',
    name: 'Complete Cricket Bat Preparation',
    description: 'Full preparation package: Oiling & Scuff Sheet + Bat Knocking',
    services: ['oiling-scuff-sheet', 'bat-knocking'],
    discount: 10, // 10% discount
    minServiceCount: 2,
    isAvailable: true
  },
  {
    id: 'personalized-bat-setup',
    name: 'Personalized Cricket Bat Setup', 
    description: 'Personalization + Maintenance: Engraving + Oiling & Scuff Sheet + Extra Grip',
    services: ['personalized-engraving', 'oiling-scuff-sheet', 'extra-grip'],
    discount: 12, // 12% discount
    minServiceCount: 3,
    isAvailable: true
  }
]

// Utility Functions

/**
 * Maps product category information to add-on service product types
 * This ensures proper integration between the categorization system and add-on services
 */
export function getProductTypeForAddOns(product: {
  category?: { name?: string; slug?: string }
  name?: string
  description?: string
}): string {
  // Direct category mapping
  const categoryName = product.category?.name?.toLowerCase() || ''
  const categorySlug = product.category?.slug?.toLowerCase() || ''
  
  // Check for cricket bat categories
  if (categoryName.includes('cricket') && categoryName.includes('bat') ||
      categorySlug.includes('cricket') && categorySlug.includes('bat') ||
      categorySlug === 'bats' || categorySlug === 'cricket-bats') {
    return 'cricket-bats'
  }
  
  // Fallback: analyze product name and description for bat patterns
  const productName = product.name?.toLowerCase() || ''
  const description = product.description?.toLowerCase() || ''
  const fullText = `${productName} ${description}`.trim()
  
  // Use the same logic as intelligent categorization for detecting bats
  if (isCricketBat(fullText)) {
    return 'cricket-bats'
  }
  
  // Default fallback - return the category slug or a generic type
  return categorySlug || categoryName || 'general'
}

/**
 * Detects if a product is a cricket bat based on text analysis
 * Uses similar logic to the intelligent categorization system
 */
function isCricketBat(text: string): boolean {
  const batKeywords = ['bat', 'blade', 'willow']
  const exclusions = ['batting', 'batman', 'bat grip', 'bat cover', 'bat padded cover']
  
  // Check for explicit bat keywords first
  const hasExplicitBatKeyword = batKeywords.some(keyword => text.includes(keyword)) &&
                               !exclusions.some(exclusion => text.includes(exclusion))
  
  if (hasExplicitBatKeyword) {
    return true
  }
  
  // Cricket bat brand patterns that indicate bats
  const cricketBatPatterns = [
    /^(a2|bas|bdm|ceat|dsc|gm|kg|mrf|rns|sf|sg|ss)\s+[a-z0-9\-\+\.\s]+/i,
    /willow/i,
    /grains?\s*\d+/i,
    /grade\s*[1-4]/i,
    /profile/i,
    /edition/i
  ]
  
  return cricketBatPatterns.some(pattern => pattern.test(text)) &&
         !text.includes('glove') && 
         !text.includes('pad') && 
         !text.includes('helmet') && 
         !text.includes('grip') && 
         !text.includes('bag') &&
         !text.includes('cover')
}

export function getAvailableServicesForProduct(productType: string): AddOnService[] {
  return ADD_ON_SERVICES.filter(service => 
    service.isAvailable && (
      service.applicableProductTypes.includes('*') ||
      service.applicableProductTypes.includes(productType)
    )
  ).sort((a, b) => a.order - b.order)
}

export function calculateServicePrice(
  serviceId: string, 
  optionId?: string, 
  quantity: number = 1
): number {
  const service = ADD_ON_SERVICES.find(s => s.id === serviceId)
  if (!service) return 0

  let totalPrice = service.basePrice * quantity
  
  if (optionId && service.options) {
    const option = service.options.find(o => o.id === optionId)
    if (option) {
      totalPrice += option.priceModifier * quantity
    }
  }

  return totalPrice
}

export function calculateAddOnTotal(selectedAddOns: SelectedAddOn[]): {
  subtotal: number
  bundleDiscount: number
  total: number
  maxEstimatedDays: number
} {
  const subtotal = selectedAddOns.reduce((sum, addon) => sum + addon.totalPrice, 0)
  const maxEstimatedDays = Math.max(...selectedAddOns.map(addon => addon.estimatedDays), 0)
  
  // Check for applicable bundles
  let bundleDiscount = 0
  const serviceIds = selectedAddOns.map(addon => addon.serviceId)
  
  for (const bundle of ADD_ON_BUNDLES) {
    if (!bundle.isAvailable) continue
    
    const matchingServices = bundle.services.filter(serviceId => 
      serviceIds.includes(serviceId)
    )
    
    if (matchingServices.length >= bundle.minServiceCount) {
      // Calculate discount on matching services
      const bundleServiceTotal = selectedAddOns
        .filter(addon => bundle.services.includes(addon.serviceId))
        .reduce((sum, addon) => sum + addon.totalPrice, 0)
      
      const discount = bundleServiceTotal * (bundle.discount / 100)
      bundleDiscount = Math.max(bundleDiscount, discount)
    }
  }

  return {
    subtotal,
    bundleDiscount,
    total: subtotal - bundleDiscount,
    maxEstimatedDays
  }
}

export function getApplicableBundles(selectedServiceIds: string[]): AddOnBundle[] {
  return ADD_ON_BUNDLES.filter(bundle => {
    if (!bundle.isAvailable) return false
    
    const matchingServices = bundle.services.filter(serviceId => 
      selectedServiceIds.includes(serviceId)
    )
    
    return matchingServices.length >= bundle.minServiceCount
  })
}

export function validateAddOnSelection(
  serviceId: string,
  optionId: string | undefined,
  quantity: number,
  productType: string,
  customText?: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const service = ADD_ON_SERVICES.find(s => s.id === serviceId)

  if (!service) {
    errors.push('Service not found')
    return { isValid: false, errors }
  }

  if (!service.isAvailable) {
    errors.push('Service is currently unavailable')
  }

  if (!service.applicableProductTypes.includes('*') && 
      !service.applicableProductTypes.includes(productType)) {
    errors.push('Service not applicable to this product type')
  }

  if (quantity < 1 || quantity > service.maxQuantity) {
    errors.push(`Quantity must be between 1 and ${service.maxQuantity}`)
  }

  if (optionId && service.options) {
    const option = service.options.find(o => o.id === optionId)
    if (!option) {
      errors.push('Selected option not found')
    } else if (!option.isAvailable) {
      errors.push('Selected option is currently unavailable')
    }
  }

  // Validate custom text for engraving
  if (serviceId === 'personalized-engraving' && customText) {
    if (customText.length > 20) {
      errors.push('Engraving text must be 20 characters or less')
    }
    if (customText.trim().length === 0) {
      errors.push('Engraving text cannot be empty')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function getServiceDescription(serviceId: string, optionId?: string): string {
  const service = ADD_ON_SERVICES.find(s => s.id === serviceId)
  if (!service) return ''

  let description = service.name

  if (optionId && service.options) {
    const option = service.options.find(o => o.id === optionId)
    if (option) {
      description += ` - ${option.name}`
    }
  }

  return description
}