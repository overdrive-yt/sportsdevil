// Universal Product Variations Framework
// Supports different product types with flexible variation options

export type VariationFieldType = 
  | 'select' 
  | 'radio' 
  | 'color' 
  | 'size' 
  | 'checkbox' 
  | 'slider' 
  | 'text' 
  | 'image-select'

export interface VariationOption {
  id: string
  label: string
  value: string
  description?: string
  priceModifier: number
  stockQuantity?: number
  isAvailable: boolean
  metadata?: Record<string, any>
  image?: string
  order: number
}

export interface VariationField {
  id: string
  name: string
  label: string
  type: VariationFieldType
  required: boolean
  options: VariationOption[]
  dependencies?: string[] // Field IDs this field depends on
  validationRules?: {
    min?: number
    max?: number
    pattern?: string
    customValidator?: (value: any, allSelections: Record<string, any>) => boolean
  }
  displayRules?: {
    showWhen?: Record<string, string[]> // Show field when other fields have specific values
    hideWhen?: Record<string, string[]>
  }
  metadata?: Record<string, any>
  order: number
}

export interface ProductVariationTemplate {
  id: string
  name: string
  description: string
  productTypes: string[] // Categories this template applies to
  fields: VariationField[]
  priceCalculation: {
    baseField?: string // Field that affects base price most significantly
    formula?: string // Custom calculation formula
  }
  stockManagement: {
    trackIndividualVariations: boolean
    allowBackorder: boolean
    lowStockThreshold: number
  }
}

export interface VariationSelection {
  fieldId: string
  optionId: string
  value: string
}

export interface ProductVariation {
  id?: string
  productId: string
  selections: VariationSelection[]
  sku: string
  price: number
  stockQuantity: number
  isAvailable: boolean
  description: string
  metadata?: Record<string, any>
}

// Pre-defined Variation Templates
export const VARIATION_TEMPLATES: ProductVariationTemplate[] = [
  // Cricket Bat Template
  {
    id: 'cricket-bat',
    name: 'Cricket Bat Variations',
    description: 'Complex cricket bat configuration with grade, weight, grain, and handle options',
    productTypes: ['cricket-bats'],
    fields: [
      {
        id: 'grade',
        name: 'grade',
        label: 'Wood Grade',
        type: 'radio',
        required: true,
        order: 1,
        options: [
          { id: 'grade-1', label: 'Grade 1 English Willow', value: 'grade-1', priceModifier: 50, isAvailable: true, order: 1 },
          { id: 'grade-2', label: 'Grade 2 English Willow', value: 'grade-2', priceModifier: 25, isAvailable: true, order: 2 },
          { id: 'grade-3', label: 'Grade 3 English Willow', value: 'grade-3', priceModifier: 0, isAvailable: true, order: 3 },
          { id: 'kashmir', label: 'Kashmir Willow', value: 'kashmir', priceModifier: -30, isAvailable: true, order: 4 }
        ]
      },
      {
        id: 'weight',
        name: 'weight',
        label: 'Weight Range',
        type: 'select',
        required: true,
        order: 2,
        dependencies: ['grade'],
        options: [
          { id: 'light', label: '2lb 6oz - 2lb 7oz', value: 'light', priceModifier: 0, isAvailable: true, order: 1 },
          { id: 'medium-light', label: '2lb 7oz - 2lb 9oz', value: 'medium-light', priceModifier: 0, isAvailable: true, order: 2 },
          { id: 'medium', label: '2lb 8oz - 2lb 10oz', value: 'medium', priceModifier: 0, isAvailable: true, order: 3 },
          { id: 'medium-heavy', label: '2lb 9oz - 2lb 11oz', value: 'medium-heavy', priceModifier: 0, isAvailable: true, order: 4 },
          { id: 'custom', label: 'Custom Weight', value: 'custom', priceModifier: 10, isAvailable: true, order: 5 }
        ]
      }
    ],
    priceCalculation: {
      baseField: 'grade'
    },
    stockManagement: {
      trackIndividualVariations: true,
      allowBackorder: false,
      lowStockThreshold: 5
    }
  },

  // Tennis Racket Template
  {
    id: 'tennis-racket',
    name: 'Tennis Racket Variations',
    description: 'Tennis racket with grip size, string tension, and weight options',
    productTypes: ['tennis-rackets'],
    fields: [
      {
        id: 'grip-size',
        name: 'gripSize',
        label: 'Grip Size',
        type: 'select',
        required: true,
        order: 1,
        options: [
          { id: '4-1/8', label: '4 1/8"', value: '4-1/8', priceModifier: 0, isAvailable: true, order: 1 },
          { id: '4-1/4', label: '4 1/4"', value: '4-1/4', priceModifier: 0, isAvailable: true, order: 2 },
          { id: '4-3/8', label: '4 3/8"', value: '4-3/8', priceModifier: 0, isAvailable: true, order: 3 },
          { id: '4-1/2', label: '4 1/2"', value: '4-1/2', priceModifier: 0, isAvailable: true, order: 4 },
          { id: '4-5/8', label: '4 5/8"', value: '4-5/8', priceModifier: 0, isAvailable: true, order: 5 }
        ]
      },
      {
        id: 'string-tension',
        name: 'stringTension',
        label: 'String Tension',
        type: 'select',
        required: false,
        order: 2,
        options: [
          { id: 'low', label: 'Low (50-55 lbs)', value: 'low', priceModifier: 0, isAvailable: true, order: 1 },
          { id: 'medium', label: 'Medium (55-60 lbs)', value: 'medium', priceModifier: 0, isAvailable: true, order: 2 },
          { id: 'high', label: 'High (60-65 lbs)', value: 'high', priceModifier: 0, isAvailable: true, order: 3 },
          { id: 'custom', label: 'Custom Tension', value: 'custom', priceModifier: 5, isAvailable: true, order: 4 }
        ]
      }
    ],
    priceCalculation: {},
    stockManagement: {
      trackIndividualVariations: false,
      allowBackorder: true,
      lowStockThreshold: 3
    }
  },

  // Football Boots Template  
  {
    id: 'football-boots',
    name: 'Football Boots Variations',
    description: 'Football boots with size, width, and stud type options',
    productTypes: ['football-boots'],
    fields: [
      {
        id: 'size',
        name: 'size',
        label: 'Size',
        type: 'select',
        required: true,
        order: 1,
        options: [
          { id: 'uk-6', label: 'UK 6', value: 'uk-6', priceModifier: 0, isAvailable: true, order: 1 },
          { id: 'uk-7', label: 'UK 7', value: 'uk-7', priceModifier: 0, isAvailable: true, order: 2 },
          { id: 'uk-8', label: 'UK 8', value: 'uk-8', priceModifier: 0, isAvailable: true, order: 3 },
          { id: 'uk-9', label: 'UK 9', value: 'uk-9', priceModifier: 0, isAvailable: true, order: 4 },
          { id: 'uk-10', label: 'UK 10', value: 'uk-10', priceModifier: 0, isAvailable: true, order: 5 },
          { id: 'uk-11', label: 'UK 11', value: 'uk-11', priceModifier: 0, isAvailable: true, order: 6 },
          { id: 'uk-12', label: 'UK 12', value: 'uk-12', priceModifier: 0, isAvailable: true, order: 7 }
        ]
      },
      {
        id: 'width',
        name: 'width',
        label: 'Width',
        type: 'radio',
        required: false,
        order: 2,
        options: [
          { id: 'regular', label: 'Regular', value: 'regular', priceModifier: 0, isAvailable: true, order: 1 },
          { id: 'wide', label: 'Wide', value: 'wide', priceModifier: 5, isAvailable: true, order: 2 }
        ]
      },
      {
        id: 'stud-type',
        name: 'studType',
        label: 'Stud Type',
        type: 'image-select',
        required: true,
        order: 3,
        options: [
          { id: 'fg', label: 'Firm Ground (FG)', value: 'fg', priceModifier: 0, isAvailable: true, order: 1, image: '/images/studs/fg.jpg' },
          { id: 'sg', label: 'Soft Ground (SG)', value: 'sg', priceModifier: 10, isAvailable: true, order: 2, image: '/images/studs/sg.jpg' },
          { id: 'ag', label: 'Artificial Grass (AG)', value: 'ag', priceModifier: 5, isAvailable: true, order: 3, image: '/images/studs/ag.jpg' },
          { id: 'tf', label: 'Turf (TF)', value: 'tf', priceModifier: -5, isAvailable: true, order: 4, image: '/images/studs/tf.jpg' }
        ]
      }
    ],
    priceCalculation: {},
    stockManagement: {
      trackIndividualVariations: true,
      allowBackorder: false,
      lowStockThreshold: 2
    }
  },

  // Simple Color/Size Template
  {
    id: 'color-size',
    name: 'Color & Size Variations',
    description: 'Basic color and size options for clothing and simple products',
    productTypes: ['clothing', 'accessories', 'equipment'],
    fields: [
      {
        id: 'color',
        name: 'color',
        label: 'Color',
        type: 'color',
        required: true,
        order: 1,
        options: [
          { id: 'black', label: 'Black', value: '#000000', priceModifier: 0, isAvailable: true, order: 1 },
          { id: 'white', label: 'White', value: '#FFFFFF', priceModifier: 0, isAvailable: true, order: 2 },
          { id: 'red', label: 'Red', value: '#FF0000', priceModifier: 0, isAvailable: true, order: 3 },
          { id: 'blue', label: 'Blue', value: '#0066CC', priceModifier: 0, isAvailable: true, order: 4 },
          { id: 'green', label: 'Green', value: '#00AA00', priceModifier: 0, isAvailable: true, order: 5 }
        ]
      },
      {
        id: 'size',
        name: 'size',
        label: 'Size',
        type: 'size',
        required: true,
        order: 2,
        options: [
          { id: 'xs', label: 'XS', value: 'xs', priceModifier: 0, isAvailable: true, order: 1 },
          { id: 's', label: 'S', value: 's', priceModifier: 0, isAvailable: true, order: 2 },
          { id: 'm', label: 'M', value: 'm', priceModifier: 0, isAvailable: true, order: 3 },
          { id: 'l', label: 'L', value: 'l', priceModifier: 0, isAvailable: true, order: 4 },
          { id: 'xl', label: 'XL', value: 'xl', priceModifier: 0, isAvailable: true, order: 5 },
          { id: 'xxl', label: 'XXL', value: 'xxl', priceModifier: 2, isAvailable: true, order: 6 }
        ]
      }
    ],
    priceCalculation: {},
    stockManagement: {
      trackIndividualVariations: true,
      allowBackorder: false,
      lowStockThreshold: 5
    }
  }
]

// Utility Functions
export function getTemplateByProductType(productType: string): ProductVariationTemplate | null {
  return VARIATION_TEMPLATES.find(template => 
    template.productTypes.includes(productType)
  ) || null
}

export function validateSelections(
  template: ProductVariationTemplate, 
  selections: Record<string, string>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check required fields
  template.fields.forEach(field => {
    if (field.required && !selections[field.id]) {
      errors.push(`${field.label} is required`)
    }
  })
  
  // Check field dependencies
  template.fields.forEach(field => {
    if (field.dependencies && selections[field.id]) {
      field.dependencies.forEach(depId => {
        if (!selections[depId]) {
          errors.push(`${field.label} requires ${template.fields.find(f => f.id === depId)?.label} to be selected first`)
        }
      })
    }
  })
  
  // Custom validation rules
  template.fields.forEach(field => {
    if (field.validationRules?.customValidator && selections[field.id]) {
      if (!field.validationRules.customValidator(selections[field.id], selections)) {
        errors.push(`Invalid selection for ${field.label}`)
      }
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function calculateVariationPrice(
  basePrice: number,
  template: ProductVariationTemplate,
  selections: Record<string, string>
): number {
  let totalPrice = basePrice
  
  template.fields.forEach(field => {
    const selectedOptionId = selections[field.id]
    if (selectedOptionId) {
      const option = field.options.find(opt => opt.id === selectedOptionId)
      if (option) {
        totalPrice += option.priceModifier
      }
    }
  })
  
  return totalPrice
}

export function generateVariationSKU(
  baseSku: string,
  template: ProductVariationTemplate,
  selections: Record<string, string>
): string {
  const suffixes: string[] = []
  
  template.fields
    .sort((a, b) => a.order - b.order)
    .forEach(field => {
      const selectedOptionId = selections[field.id]
      if (selectedOptionId) {
        const option = field.options.find(opt => opt.id === selectedOptionId)
        if (option) {
          // Use first 3 characters of option ID as suffix
          suffixes.push(option.id.substring(0, 3).toUpperCase())
        }
      }
    })
  
  return `${baseSku}-${suffixes.join('-')}`
}

export function getVariationDescription(
  template: ProductVariationTemplate,
  selections: Record<string, string>
): string {
  const descriptions: string[] = []
  
  template.fields
    .sort((a, b) => a.order - b.order)
    .forEach(field => {
      const selectedOptionId = selections[field.id]
      if (selectedOptionId) {
        const option = field.options.find(opt => opt.id === selectedOptionId)
        if (option) {
          descriptions.push(`${field.label}: ${option.label}`)
        }
      }
    })
  
  return descriptions.join(', ')
}

export function getAvailableOptionsForField(
  field: VariationField,
  allSelections: Record<string, string>
): VariationOption[] {
  let availableOptions = field.options.filter(opt => opt.isAvailable)
  
  // Apply display rules
  if (field.displayRules?.showWhen) {
    const shouldShow = Object.entries(field.displayRules.showWhen).some(([fieldId, values]) => {
      const selectedValue = allSelections[fieldId]
      return selectedValue && values.includes(selectedValue)
    })
    if (!shouldShow) return []
  }
  
  if (field.displayRules?.hideWhen) {
    const shouldHide = Object.entries(field.displayRules.hideWhen).some(([fieldId, values]) => {
      const selectedValue = allSelections[fieldId]
      return selectedValue && values.includes(selectedValue)
    })
    if (shouldHide) return []
  }
  
  return availableOptions.sort((a, b) => a.order - b.order)
}