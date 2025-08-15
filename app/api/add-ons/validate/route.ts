import { NextRequest, NextResponse } from 'next/server'
import {
  validateAddOnSelection,
  calculateServicePrice,
  calculateAddOnTotal,
  type SelectedAddOn
} from '../../../../lib/add-ons/services'

export async function POST(request: NextRequest) {
  try {
    const {
      selections,
      productType
    }: {
      selections: Array<{
        serviceId: string
        optionId?: string
        quantity: number
        customText?: string
      }>
      productType: string
    } = await request.json()

    const results: {
      isValid: boolean
      validatedAddOns: SelectedAddOn[]
      errors: Record<string, string[]>
      totals: {
        subtotal: number
        bundleDiscount: number
        total: number
        maxEstimatedDays: number
      }
    } = {
      isValid: true,
      validatedAddOns: [],
      errors: {},
      totals: {
        subtotal: 0,
        bundleDiscount: 0,
        total: 0,
        maxEstimatedDays: 0
      }
    }

    // Validate each selection
    for (const selection of selections) {
      const validation = validateAddOnSelection(
        selection.serviceId,
        selection.optionId,
        selection.quantity,
        productType,
        selection.customText
      )

      if (!validation.isValid) {
        results.isValid = false
        results.errors[selection.serviceId] = validation.errors
      } else {
        // Calculate service details
        const totalPrice = calculateServicePrice(
          selection.serviceId,
          selection.optionId,
          selection.quantity
        )

        // Get service details for estimated days
        const { ADD_ON_SERVICES } = await import('@/lib/add-ons/services')
        const service = ADD_ON_SERVICES.find(s => s.id === selection.serviceId)
        
        if (service) {
          results.validatedAddOns.push({
            serviceId: selection.serviceId,
            optionId: selection.optionId,
            quantity: selection.quantity,
            customText: selection.customText,
            totalPrice,
            estimatedDays: service.estimatedDays
          })
        }
      }
    }

    // Calculate totals for valid selections
    if (results.validatedAddOns.length > 0) {
      results.totals = calculateAddOnTotal(results.validatedAddOns)
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Add-on validation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to validate add-on selections',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}