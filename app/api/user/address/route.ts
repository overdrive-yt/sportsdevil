import { NextRequest, NextResponse } from 'next/server'
import { requireValidUser } from '../../../../lib/auth-validation'
import { prisma } from '../../lib/prisma'
import { handleApiError } from '../../lib/api/errors'
import { z } from 'zod'

const addressSchema = z.object({
  name: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().optional()
})

// Save address to user account (from Stripe checkout)
export async function POST(request: NextRequest) {
  try {
    // Validate user session
    const validation = await requireValidUser(request)
    if (!validation.success) {
      return validation.response
    }

    const body = await request.json()
    const addressData = addressSchema.parse(body)
    
    console.log('📍 Saving address to user account:', {
      userId: validation.user?.id,
      address: addressData.address,
      city: addressData.city,
      postalCode: addressData.postalCode
    })

    // Update user account with address information
    const updatedUser = await prisma.user.update({
      where: { id: validation.user!.id },
      data: {
        name: addressData.name || validation.user!.name,
        address: addressData.address,
        addressLine2: addressData.addressLine2,
        city: addressData.city,
        postalCode: addressData.postalCode,
        country: addressData.country,
        phone: addressData.phone,
        updatedAt: new Date()
      }
    })

    console.log('✅ Address saved successfully for user:', validation.user?.email)

    return NextResponse.json({
      success: true,
      message: 'Address saved to account',
      data: {
        address: updatedUser.address,
        city: updatedUser.city,
        postalCode: updatedUser.postalCode,
        country: updatedUser.country
      }
    })

  } catch (error: any) {
    console.error('❌ Error saving address to user account:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid address data', details: error.errors },
        { status: 400 }
      )
    }
    
    return handleApiError(error)
  }
}

// Get user's saved address (for pre-filling forms)
export async function GET(request: NextRequest) {
  try {
    // Validate user session
    const validation = await requireValidUser(request)
    if (!validation.success) {
      return validation.response
    }

    // Get user with address information
    const user = await prisma.user.findUnique({
      where: { id: validation.user!.id },
      select: {
        name: true,
        address: true,
        addressLine2: true,
        city: true,
        postalCode: true,
        country: true,
        phone: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        name: user.name,
        address: user.address,
        addressLine2: user.addressLine2,
        city: user.city,
        postalCode: user.postalCode,
        country: user.country || 'GB',
        phone: user.phone,
        hasAddress: !!(user.address && user.city && user.postalCode)
      }
    })

  } catch (error) {
    console.error('❌ Error getting user address:', error)
    return handleApiError(error)
  }
}