/**
 * Intelligent Product Categorization System
 * 
 * Smart category assignment logic to prevent future primary category issues
 * and automatically apply multi-category logic for junior products.
 */

export interface CategorySuggestion {
  categoryName: string
  isPrimary: boolean
  confidence: number
  reasoning: string
}

export interface ProductAnalysis {
  isJunior: boolean
  isBat: boolean
  brand: string | null
  productType: string | null
  suggestedCategories: CategorySuggestion[]
}

/**
 * Analyze product and suggest intelligent category assignments
 */
export function analyzeProductForCategories(
  productName: string,
  description?: string,
  additionalData?: {
    size?: string
    ageGroup?: string
    brand?: string
  }
): ProductAnalysis {
  const analysis: ProductAnalysis = {
    isJunior: false,
    isBat: false,
    brand: null,
    productType: null,
    suggestedCategories: []
  }
  
  const name = productName.toLowerCase()
  const desc = description?.toLowerCase() || ''
  const fullText = `${name} ${desc}`.trim()
  
  // Step 1: Detect if product is junior/youth
  analysis.isJunior = detectJuniorProduct(fullText, additionalData)
  
  // Step 2: Detect product type and brand
  analysis.isBat = detectBat(fullText)
  analysis.brand = extractBrand(productName)
  analysis.productType = detectProductType(fullText)
  
  // Step 3: Generate smart category suggestions
  analysis.suggestedCategories = generateCategorySuggestions(analysis, fullText, additionalData)
  
  return analysis
}

/**
 * Detect if product is for junior/youth market
 */
function detectJuniorProduct(text: string, additionalData?: any): boolean {
  // Size-based detection
  if (additionalData?.size) {
    const size = additionalData.size.toLowerCase()
    if (size.includes('3') || size.includes('4') || size.includes('5') || size.includes('6')) {
      return true
    }
  }
  
  // Age group detection
  if (additionalData?.ageGroup?.toLowerCase().includes('junior') || 
      additionalData?.ageGroup?.toLowerCase().includes('youth')) {
    return true
  }
  
  // Text-based detection with improved Harrow logic
  const juniorKeywords = [
    'junior', 'youth', 'boys', 'girls', 'small boy',
    'size 3', 'size 4', 'size 5', 'size 6', 'young player'
  ]
  
  // Special handling for Harrow - only junior if combined with other junior indicators
  if (text.includes('harrow')) {
    // Harrow alone is not enough - need additional junior context
    const additionalJuniorContext = [
      'junior', 'youth', 'boys', 'small', 'children',
      'size 3', 'size 4', 'size 5', 'size 6'
    ]
    
    // If product name explicitly mentions junior/youth alongside Harrow, it's junior
    if (additionalJuniorContext.some(keyword => text.includes(keyword))) {
      return true
    }
    
    // If it's just "Harrow" in a product name without junior context, treat as adult
    // This handles cases like "SG Ashes XI Duffle Kit Bag - Harrow" which is adult size
    return false
  }
  
  return juniorKeywords.some(keyword => text.includes(keyword))
}

/**
 * Detect if product is a cricket bat
 */
function detectBat(text: string): boolean {
  const batKeywords = ['bat', 'blade', 'willow']
  const exclusions = ['batting', 'batman', 'bat grip', 'bat cover', 'bat padded cover'] // Exclude batting gloves, etc.
  
  // Check for explicit bat keywords first
  const hasExplicitBatKeyword = batKeywords.some(keyword => text.includes(keyword)) &&
                               !exclusions.some(exclusion => text.includes(exclusion))
  
  if (hasExplicitBatKeyword) {
    return true
  }
  
  // Advanced cricket bat detection for branded bats
  // Many cricket bats are just named by brand + model without "bat" in the name
  const cricketBatPatterns = [
    // Brand + Model patterns that indicate cricket bats
    /^(a2|bas|bdm|ceat|dsc|gm|kg|mrf|rns|sf|sg|ss)\s+[a-z0-9\-\+\.\s]+(\s+grade\s+\d+)?$/i,
    /willow/i, // English/Kashmir willow indicates bat
    /grains?\s*\d+/i, // Grain count indicates bat
    /grade\s*[1-4]/i, // Grade indicates bat quality
    /profile/i, // Bat profile
    /edition/i, // Special editions usually bats
    // Specific model names that are clearly bats
    /coronet|omega|vertex|vampire|checkmate|colossus|nitro|hypernova|chroma|zelos|clifton|genius|wizard|larsons|incredible|hybrid|savage|finisher|smacker|master/i
  ]
  
  // Check if this looks like a cricket bat based on patterns
  if (cricketBatPatterns.some(pattern => pattern.test(text))) {
    // Additional validation - make sure it's not accessories
    if (!text.includes('glove') && 
        !text.includes('pad') && 
        !text.includes('helmet') && 
        !text.includes('guard') && 
        !text.includes('grip') && 
        !text.includes('bag') && 
        !text.includes('ball') &&
        !text.includes('cover') &&
        !text.includes('stumps')) {
      return true
    }
  }
  
  return false
}

/**
 * Extract brand from product name
 */
function extractBrand(productName: string): string | null {
  const name = productName.toLowerCase()
  
  const brands = [
    { name: 'A2', patterns: [/^a2\s/, /^a2\b/] },
    { name: 'BAS', patterns: [/^bas\s/, /^bas\b/] },
    { name: 'BDM', patterns: [/^bdm\s/, /^bdm\b/] },
    { name: 'CEAT', patterns: [/^ceat\s/, /^ceat\b/] },
    { name: 'DSC', patterns: [/^dsc\s/, /^dsc\b/] },
    { name: 'GM', patterns: [/^gm\s/, /^gunn.*moore/, /gunn & moore/] },
    { name: 'KG', patterns: [/^kg\s/, /^kg\b/] },
    { name: 'MRF', patterns: [/^mrf\s/, /^mrf\b/] },
    { name: 'NB', patterns: [/^new balance/, /^nb\s/] },
    { name: 'RNS', patterns: [/^rns\s/, /^rns\b/] },
    { name: 'SF', patterns: [/^sf\s/, /^sf\b/] },
    { name: 'SG', patterns: [/^sg\s/, /^sg\b/] },
    { name: 'SS', patterns: [/^ss\s/, /single s/, /^single-s/] },
    { name: 'Gray-Nicolls', patterns: [/gray.?nicolls?/, /grey.?nicolls?/] },
    { name: 'Kookaburra', patterns: [/kookaburra/] }
  ]
  
  for (const brand of brands) {
    if (brand.patterns.some(pattern => pattern.test(name))) {
      return brand.name
    }
  }
  
  return null
}

/**
 * Detect specific product type
 */
function detectProductType(text: string): string | null {
  const productTypes = [
    // Protection
    { name: 'helmet', keywords: ['helmet'] },
    { name: 'batting-gloves', keywords: ['batting glove', 'batting gloves'] },
    { name: 'batting-pads', keywords: ['batting pad', 'leg guard', 'batting pads'] },
    { name: 'wicket-keeping-gloves', keywords: ['wicket keeping glove', 'wk glove', 'keeping glove'] },
    { name: 'wicket-keeping-pads', keywords: ['wicket keeping pad', 'wk pad', 'keeping pad'] },
    { name: 'chest-guard', keywords: ['chest guard'] },
    { name: 'thigh-pad', keywords: ['thigh pad', 'thigh guard'] },
    { name: 'elbow-guard', keywords: ['elbow guard'] },
    { name: 'abdomen-guard', keywords: ['abdomen guard', 'abdominal guard'] },
    
    // Equipment
    { name: 'kit-bag', keywords: ['kit bag', 'duffle bag', 'duffle kit bag'] },
    { name: 'cricket-ball', keywords: ['cricket ball', 'leather ball'] },
    { name: 'bat-grip', keywords: ['bat grip', 'grip'] },
    
    // Training
    { name: 'training-equipment', keywords: ['stumps', 'training', 'coaching'] }
  ]
  
  for (const type of productTypes) {
    if (type.keywords.some(keyword => text.includes(keyword))) {
      return type.name
    }
  }
  
  return null
}

/**
 * Generate intelligent category suggestions
 */
function generateCategorySuggestions(
  analysis: ProductAnalysis,
  text: string,
  additionalData?: any
): CategorySuggestion[] {
  const suggestions: CategorySuggestion[] = []
  
  // Cricket Bats Logic
  if (analysis.isBat) {
    if (analysis.isJunior) {
      // Junior bat - primary is Cricket Junior Bats
      suggestions.push({
        categoryName: 'Cricket Junior Bats',
        isPrimary: true,
        confidence: 0.95,
        reasoning: 'Junior cricket bat detected'
      })
      
      // Also add to general Cricket Bats for brand filtering
      suggestions.push({
        categoryName: 'Cricket Bats',
        isPrimary: false,
        confidence: 0.9,
        reasoning: 'Junior bat needs visibility in general bats for brand filtering'
      })
      
      // Add to Cricket Junior Stock parent
      suggestions.push({
        categoryName: 'Cricket Junior Stock',
        isPrimary: false,
        confidence: 0.85,
        reasoning: 'Junior product belongs in junior stock parent category'
      })
      
      // Add brand category if detected
      if (analysis.brand) {
        suggestions.push({
          categoryName: analysis.brand,
          isPrimary: false,
          confidence: 0.8,
          reasoning: `Brand category for ${analysis.brand} bat`
        })
      }
    } else {
      // Adult bat - primary is Cricket Bats
      suggestions.push({
        categoryName: 'Cricket Bats',
        isPrimary: true,
        confidence: 0.95,
        reasoning: 'Cricket bat detected'
      })
      
      // Add brand category if detected
      if (analysis.brand) {
        suggestions.push({
          categoryName: analysis.brand,
          isPrimary: false,
          confidence: 0.9,
          reasoning: `Brand category for ${analysis.brand} bat`
        })
      }
    }
    
    return suggestions
  }
  
  // Protection Equipment Logic
  if (analysis.productType) {
    const protectionTypes = {
      'helmet': 'Cricket Helmets',
      'batting-gloves': 'Cricket Batting Gloves',
      'batting-pads': 'Cricket Batting Pads/Leg Guards',
      'wicket-keeping-gloves': 'Cricket Wicket Keeping Gloves',
      'wicket-keeping-pads': 'Cricket Wicket Keeping Pads',
      'chest-guard': 'Cricket Chest Guards',
      'thigh-pad': 'Cricket Thigh Pads',
      'elbow-guard': 'Cricket Elbow Guards',
      'abdomen-guard': 'Cricket Abdomen Guards'
    }
    
    // Junior protection types - use exact database category names
    const juniorProtectionTypes = {
      'helmet': 'Cricket Junior Helmets',
      'batting-gloves': 'Cricket Junior Batting Gloves', 
      'batting-pads': 'Cricket Junior Batting Pads', // Note: Database doesn't have /Leg Guards suffix for junior
      'wicket-keeping-gloves': 'Cricket Junior Wicket Keeping Gloves',
      'wicket-keeping-pads': 'Cricket Junior Wicket Keeping Pads',
      'chest-guard': 'Cricket Junior Chest Guards',
      'thigh-pad': 'Cricket Junior Thigh Pads',
      'elbow-guard': 'Cricket Junior Elbow Guards',
      'abdomen-guard': 'Cricket Junior Abdomen Guards'
    }
    
    if (analysis.isJunior) {
      // Junior protection item - use exact database category names
      const juniorCategory = juniorProtectionTypes[analysis.productType as keyof typeof juniorProtectionTypes]
      const adultCategory = protectionTypes[analysis.productType as keyof typeof protectionTypes]
      
      if (juniorCategory && adultCategory) {
        suggestions.push({
          categoryName: juniorCategory,
          isPrimary: true,
          confidence: 0.95,
          reasoning: `Junior ${analysis.productType} detected`
        })
        
        // Also add to adult category for broader visibility
        suggestions.push({
          categoryName: adultCategory,
          isPrimary: false,
          confidence: 0.85,
          reasoning: 'Junior item needs visibility in adult protection category'
        })
        
        // Add to Cricket Junior Stock and Cricket Protection parents
        suggestions.push({
          categoryName: 'Cricket Junior Stock',
          isPrimary: false,
          confidence: 0.8,
          reasoning: 'Junior product belongs in junior stock parent'
        })
        
        suggestions.push({
          categoryName: 'Cricket Protection',
          isPrimary: false,
          confidence: 0.75,
          reasoning: 'Protection item belongs in protection parent'
        })
        
        return suggestions
      }
    } else {
      // Adult protection item
      const adultCategory = protectionTypes[analysis.productType as keyof typeof protectionTypes]
      
      if (adultCategory) {
        suggestions.push({
          categoryName: adultCategory,
          isPrimary: true,
          confidence: 0.95,
          reasoning: `${analysis.productType} protection equipment detected`
        })
        
        suggestions.push({
          categoryName: 'Cricket Protection',
          isPrimary: false,
          confidence: 0.9,
          reasoning: 'Protection equipment belongs in protection parent'
        })
        
        return suggestions
      }
    }
  }
  
  // Kit Bags Logic
  if (analysis.productType === 'kit-bag') {
    if (analysis.isJunior) {
      suggestions.push({
        categoryName: 'Cricket Junior Stock',
        isPrimary: true,
        confidence: 0.95,
        reasoning: 'Junior kit bag detected'
      })
      
      suggestions.push({
        categoryName: 'Cricket Kit Bags',
        isPrimary: false,
        confidence: 0.8,
        reasoning: 'Junior kit bag also appears in general kit bags'
      })
    } else {
      suggestions.push({
        categoryName: 'Cricket Kit Bags',
        isPrimary: true,
        confidence: 0.95,
        reasoning: 'Cricket kit bag detected'
      })
    }
    
    return suggestions
  }
  
  // Cricket Balls Logic
  if (analysis.productType === 'cricket-ball') {
    suggestions.push({
      categoryName: 'Cricket Balls',
      isPrimary: true,
      confidence: 0.95,
      reasoning: 'Cricket ball detected'
    })
    
    return suggestions
  }
  
  // Wicket Keeping Logic (additional detection)
  if (text.includes('wicket keeping') || text.includes('wk ') || text.includes('keeping')) {
    if (text.includes('glove')) {
      suggestions.push({
        categoryName: 'Cricket Wicket Keeping Gloves',
        isPrimary: true,
        confidence: 0.9,
        reasoning: 'Wicket keeping gloves detected'
      })
    } else if (text.includes('pad')) {
      suggestions.push({
        categoryName: 'Cricket Wicket Keeping Pads',
        isPrimary: true,
        confidence: 0.9,
        reasoning: 'Wicket keeping pads detected'
      })
    } else {
      suggestions.push({
        categoryName: 'Cricket Wicket Keeping',
        isPrimary: true,
        confidence: 0.8,
        reasoning: 'General wicket keeping equipment detected'
      })
    }
    
    return suggestions
  }
  
  // Check for bat grips and covers (should go to Cricket Clothing & Accessories)
  if (text.includes('grip') || text.includes('cover') && text.includes('bat')) {
    suggestions.push({
      categoryName: 'Cricket Clothing & Accessories',
      isPrimary: true,
      confidence: 0.9,
      reasoning: 'Cricket bat grip or cover accessory detected'
    })
    
    // Add brand if detected
    if (analysis.brand) {
      suggestions.push({
        categoryName: analysis.brand,
        isPrimary: false,
        confidence: 0.8,
        reasoning: `Brand category for ${analysis.brand} grip/cover`
      })
    }
    
    return suggestions
  }
  
  // Default fallback suggestions
  if (analysis.isJunior) {
    suggestions.push({
      categoryName: 'Cricket Junior Stock',
      isPrimary: true,
      confidence: 0.6,
      reasoning: 'Junior product detected - default to junior stock'
    })
  } else {
    suggestions.push({
      categoryName: 'Cricket Clothing & Accessories',
      isPrimary: true,
      confidence: 0.5,
      reasoning: 'Default category for unclassified cricket equipment'
    })
  }
  
  return suggestions
}

/**
 * Get category recommendations for product upload form
 */
export function getCategoryRecommendations(productName: string, description?: string) {
  const analysis = analyzeProductForCategories(productName, description)
  
  return {
    analysis,
    recommendations: {
      primaryCategory: analysis.suggestedCategories.find(c => c.isPrimary)?.categoryName || 'Cricket Clothing & Accessories',
      secondaryCategories: analysis.suggestedCategories.filter(c => !c.isPrimary).map(c => c.categoryName),
      confidence: Math.max(...analysis.suggestedCategories.map(c => c.confidence)),
      reasoning: analysis.suggestedCategories.find(c => c.isPrimary)?.reasoning || 'Manual category assignment required'
    }
  }
}

/**
 * Validate category assignments to prevent missing primary categories
 */
export function validateCategoryAssignments(categories: Array<{name: string, isPrimary: boolean}>): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check for primary category
  const primaryCategories = categories.filter(c => c.isPrimary)
  if (primaryCategories.length === 0) {
    errors.push('No primary category assigned - every product must have exactly one primary category')
  } else if (primaryCategories.length > 1) {
    errors.push(`Multiple primary categories assigned (${primaryCategories.length}) - only one primary category allowed`)
  }
  
  // Check for reasonable number of categories
  if (categories.length > 6) {
    warnings.push(`High number of categories (${categories.length}) - consider if all are necessary`)
  }
  
  // Check for common category combinations
  const categoryNames = categories.map(c => c.name)
  if (categoryNames.includes('Cricket Junior Stock') && 
      !categoryNames.some(name => name.startsWith('Cricket Junior '))) {
    warnings.push('Product assigned to Cricket Junior Stock but no specific junior subcategory')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}