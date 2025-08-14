// Cricket Bat Variations System
// This handles the complex cricket bat configuration with grades, weights, grains, handles

export interface CricketBatGrade {
  id: string
  name: string
  description: string
  priceModifier: number // Additional cost
  order: number
}

export interface CricketBatWeight {
  id: string
  label: string
  minWeight: number // in lbs
  maxWeight: number
  priceModifier: number
  availability: string[] // Grade IDs that support this weight
  order: number
}

export interface CricketBatGrain {
  id: string
  name: string
  description: string
  minGrains: number
  maxGrains: number
  visual: string // Image URL or pattern
  availability: string[] // Grade IDs that support this grain
  order: number
}

export interface CricketBatHandle {
  id: string
  name: string
  description: string
  priceModifier: number
  availability: string[] // Grade IDs that support this handle
  order: number
}

export interface CricketBatVariation {
  gradeId: string
  weightId: string
  grainId: string
  handleId: string
  totalPrice: number
  sku: string
  stockQuantity: number
  isAvailable: boolean
}

// Cricket Bat Configuration Data
export const CRICKET_BAT_GRADES: CricketBatGrade[] = [
  {
    id: 'grade-1-ew',
    name: 'Grade 1 English Willow',
    description: 'Premium quality with 8-12 straight grains, excellent pick-up and performance',
    priceModifier: 50,
    order: 1
  },
  {
    id: 'grade-2-ew',
    name: 'Grade 2 English Willow',
    description: 'High quality with 6-10 grains, great balance of performance and value',
    priceModifier: 25,
    order: 2
  },
  {
    id: 'grade-3-ew',
    name: 'Grade 3 English Willow',
    description: 'Good quality with 4-8 grains, ideal for club cricket',
    priceModifier: 0,
    order: 3
  },
  {
    id: 'kashmir-willow',
    name: 'Kashmir Willow',
    description: 'Affordable option with 5-9 grains, perfect for beginners',
    priceModifier: -30,
    order: 4
  }
]

export const CRICKET_BAT_WEIGHTS: CricketBatWeight[] = [
  {
    id: 'light-2.6-2.7',
    label: '2lb 6oz - 2lb 7oz',
    minWeight: 2.6,
    maxWeight: 2.7,
    priceModifier: 0,
    availability: ['kashmir-willow'],
    order: 1
  },
  {
    id: 'medium-light-2.7-2.9',
    label: '2lb 7oz - 2lb 9oz',
    minWeight: 2.7,
    maxWeight: 2.9,
    priceModifier: 0,
    availability: ['grade-1-ew', 'kashmir-willow'],
    order: 2
  },
  {
    id: 'medium-2.8-3.0',
    label: '2lb 8oz - 2lb 10oz',
    minWeight: 2.8,
    maxWeight: 3.0,
    priceModifier: 0,
    availability: ['grade-1-ew', 'grade-2-ew', 'grade-3-ew'],
    order: 3
  },
  {
    id: 'medium-heavy-2.9-3.1',
    label: '2lb 9oz - 2lb 11oz',
    minWeight: 2.9,
    maxWeight: 3.1,
    priceModifier: 0,
    availability: ['grade-2-ew', 'grade-3-ew'],
    order: 4
  },
  {
    id: 'custom-weight',
    label: 'Custom Weight',
    minWeight: 2.5,
    maxWeight: 3.2,
    priceModifier: 10,
    availability: ['grade-1-ew', 'grade-2-ew'],
    order: 5
  }
]

export const CRICKET_BAT_GRAINS: CricketBatGrain[] = [
  {
    id: 'straight-12-plus',
    name: '12+ Straight Grains',
    description: 'Premium straight grains for maximum performance',
    minGrains: 12,
    maxGrains: 16,
    visual: '/images/grains/straight-12-plus.jpg',
    availability: ['grade-1-ew'],
    order: 1
  },
  {
    id: 'straight-8-12',
    name: '8-12 Straight Grains',
    description: 'Excellent straight grain pattern',
    minGrains: 8,
    maxGrains: 12,
    visual: '/images/grains/straight-8-12.jpg',
    availability: ['grade-1-ew', 'grade-2-ew'],
    order: 2
  },
  {
    id: 'good-6-10',
    name: '6-10 Good Grains',
    description: 'Quality grain pattern with good performance',
    minGrains: 6,
    maxGrains: 10,
    visual: '/images/grains/good-6-10.jpg',
    availability: ['grade-2-ew', 'grade-3-ew'],
    order: 3
  },
  {
    id: 'standard-4-8',
    name: '4-8 Standard Grains',
    description: 'Standard grain pattern suitable for regular play',
    minGrains: 4,
    maxGrains: 8,
    visual: '/images/grains/standard-4-8.jpg',
    availability: ['grade-3-ew'],
    order: 4
  },
  {
    id: 'natural-5-9',
    name: '5-9 Natural Grains',
    description: 'Natural grain pattern with consistent performance',
    minGrains: 5,
    maxGrains: 9,
    visual: '/images/grains/natural-5-9.jpg',
    availability: ['kashmir-willow'],
    order: 5
  }
]

export const CRICKET_BAT_HANDLES: CricketBatHandle[] = [
  {
    id: 'short-handle',
    name: 'Short Handle',
    description: 'Standard length for better control',
    priceModifier: 0,
    availability: ['grade-1-ew', 'grade-2-ew', 'grade-3-ew', 'kashmir-willow'],
    order: 1
  },
  {
    id: 'long-handle',
    name: 'Long Handle',
    description: 'Extended length for taller players',
    priceModifier: 15,
    availability: ['grade-1-ew', 'grade-2-ew', 'grade-3-ew'],
    order: 2
  },
  {
    id: 'standard-handle',
    name: 'Standard Handle',
    description: 'Regular handle with balanced feel',
    priceModifier: 0,
    availability: ['grade-2-ew', 'grade-3-ew', 'kashmir-willow'],
    order: 3
  },
  {
    id: 'custom-handle',
    name: 'Custom Handle',
    description: 'Customized handle grip and binding',
    priceModifier: 25,
    availability: ['grade-1-ew', 'grade-2-ew'],
    order: 4
  },
  {
    id: 'youth-handle',
    name: 'Youth Handle',
    description: 'Shorter handle designed for young players',
    priceModifier: -5,
    availability: ['kashmir-willow'],
    order: 5
  }
]

// Validation and Helper Functions
export function isValidCombination(
  gradeId: string,
  weightId: string,
  grainId: string,
  handleId: string
): boolean {
  const weight = CRICKET_BAT_WEIGHTS.find(w => w.id === weightId)
  const grain = CRICKET_BAT_GRAINS.find(g => g.id === grainId)
  const handle = CRICKET_BAT_HANDLES.find(h => h.id === handleId)

  if (!weight || !grain || !handle) return false

  // Check if weight is available for this grade
  if (!weight.availability.includes(gradeId)) return false

  // Check if grain is available for this grade  
  if (!grain.availability.includes(gradeId)) return false

  // Check if handle is available for this grade
  if (!handle.availability.includes(gradeId)) return false

  return true
}

export function calculateVariationPrice(
  basePrice: number,
  gradeId: string,
  weightId: string,
  grainId: string,
  handleId: string
): number {
  const grade = CRICKET_BAT_GRADES.find(g => g.id === gradeId)
  const weight = CRICKET_BAT_WEIGHTS.find(w => w.id === weightId)
  const handle = CRICKET_BAT_HANDLES.find(h => h.id === handleId)

  if (!grade || !weight || !handle) return basePrice

  return basePrice + grade.priceModifier + weight.priceModifier + handle.priceModifier
}

export function generateVariationSKU(
  baseSku: string,
  gradeId: string,
  weightId: string,
  grainId: string,
  handleId: string
): string {
  const gradeCode = gradeId.split('-')[0].toUpperCase()
  const weightCode = weightId.split('-')[0].toUpperCase()
  const grainCode = grainId.split('-')[0].toUpperCase()
  const handleCode = handleId.split('-')[0].toUpperCase()

  return `${baseSku}-${gradeCode}-${weightCode}-${grainCode}-${handleCode}`
}

export function getAvailableOptions(gradeId: string) {
  return {
    weights: CRICKET_BAT_WEIGHTS.filter(w => w.availability.includes(gradeId)),
    grains: CRICKET_BAT_GRAINS.filter(g => g.availability.includes(gradeId)),
    handles: CRICKET_BAT_HANDLES.filter(h => h.availability.includes(gradeId))
  }
}

export function getVariationDescription(
  gradeId: string,
  weightId: string,
  grainId: string,
  handleId: string
): string {
  const grade = CRICKET_BAT_GRADES.find(g => g.id === gradeId)
  const weight = CRICKET_BAT_WEIGHTS.find(w => w.id === weightId)
  const grain = CRICKET_BAT_GRAINS.find(g => g.id === grainId)
  const handle = CRICKET_BAT_HANDLES.find(h => h.id === handleId)

  if (!grade || !weight || !grain || !handle) return ''

  return `${grade.name} cricket bat with ${weight.label} weight, ${grain.name.toLowerCase()}, and ${handle.name.toLowerCase()}`
}