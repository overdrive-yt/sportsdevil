import { NextRequest, NextResponse } from 'next/server'
import {
  getAvailableServicesForProduct,
  ADD_ON_BUNDLES
} from '@/lib/add-ons/services'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productType = searchParams.get('productType')

    if (!productType) {
      return NextResponse.json(
        { error: 'Product type is required' },
        { status: 400 }
      )
    }

    const availableServices = getAvailableServicesForProduct(productType)
    const availableBundles = ADD_ON_BUNDLES.filter(bundle => bundle.isAvailable)

    return NextResponse.json({
      services: availableServices,
      bundles: availableBundles,
      productType
    })
  } catch (error) {
    console.error('Add-on services API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch add-on services',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}