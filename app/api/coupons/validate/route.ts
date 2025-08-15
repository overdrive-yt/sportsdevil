import { NextRequest, NextResponse } from 'next/server'
import { requireValidUser } from '../../../../lib/auth-validation'
import { prisma } from '../../lib/prisma'
import { handleApiError } from '../../lib/api/errors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, cartTotal } = body
    
    console.log('🎫 Coupon validation request:', {
      code: code ? code.toUpperCase() : 'none',
      cartTotal,
      hasCode: !!code,
      codeType: typeof code,
      timestamp: new Date().toISOString()
    })

    if (!code || typeof code !== 'string') {
      console.warn('⚠️ Invalid coupon code provided:', { code, type: typeof code })
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      )
    }
    
    if (typeof cartTotal !== 'number' || cartTotal < 0) {
      console.warn('⚠️ Invalid cart total:', { cartTotal, type: typeof cartTotal })
      return NextResponse.json(
        { success: false, error: 'Valid cart total is required' },
        { status: 400 }
      )
    }

    // Find the coupon in database
    const couponCode = code.toUpperCase().trim()
    console.log('🔍 Looking for coupon:', couponCode)
    
    const coupon = await prisma.coupon.findUnique({
      where: { 
        code: couponCode,
      }
    })

    if (!coupon) {
      console.log('❌ Coupon not found in database:', couponCode)
      return NextResponse.json(
        { success: false, error: 'Invalid coupon code' },
        { status: 404 }
      )
    }
    
    console.log('✅ Coupon found:', {
      code: coupon.code,
      type: coupon.discountType,
      value: coupon.discountValue,
      isActive: coupon.isActive,
      validFrom: coupon.validFrom.toISOString(),
      validUntil: coupon.validUntil.toISOString(),
      usedCount: coupon.usedCount,
      usageLimit: coupon.usageLimit
    })

    // Special validation for FIRST7 coupon (new user only)
    if (coupon.code === 'FIRST7') {
      console.log('🔍 FIRST7 coupon validation starting...')
      
      // Validate user session and database existence
      const validation = await requireValidUser(request)
      if (!validation.success) {
        console.error('❌ User validation failed for FIRST7:', validation.response)
        return validation.response
      }
      
      console.log('✅ User validation passed for FIRST7:', {
        userId: validation.user?.id,
        userEmail: validation.user?.email
      })

      // Get user details including address and order history
      const user = await prisma.user.findUnique({
        where: { email: validation.user?.email },
        include: {
          orders: {
            select: { id: true, status: true, createdAt: true }
          },
          couponUsages: {
            where: { couponId: coupon.id },
            select: { id: true, usedAt: true }
          }
        }
      })
      
      console.log('👤 User details for FIRST7 validation:', {
        userId: user?.id,
        email: user?.email,
        createdAt: user?.createdAt?.toISOString(),
        orderCount: user?.orders?.length || 0,
        couponUsageCount: user?.couponUsages?.length || 0,
        hasAddress: !!(user?.address && user?.city && user?.postalCode)
      })

      // This should never happen due to validation, but keep as safety check
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User data synchronization error' },
          { status: 500 }
        )
      }

      // Check if user has already used FIRST7
      if (user.couponUsages.length > 0) {
        return NextResponse.json(
          { success: false, error: 'You have already used the FIRST7 new customer discount' },
          { status: 400 }
        )
      }

      // Check if user has any previous orders (new user validation)
      if (user.orders.length > 0) {
        return NextResponse.json(
          { success: false, error: 'This coupon is only available for first-time customers' },
          { status: 400 }
        )
      }

      // Check if user account is too old (must be within last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      if (user.createdAt < thirtyDaysAgo) {
        return NextResponse.json(
          { success: false, error: 'This new customer coupon has expired for your account' },
          { status: 400 }
        )
      }

      // Address-based abuse prevention
      if (user.address && user.city && user.postalCode) {
        const addressString = `${user.address.toLowerCase().trim()}, ${user.city.toLowerCase().trim()}, ${user.postalCode.toLowerCase().trim()}`
        console.log('🏠 Checking address-based abuse prevention for:', addressString)
        
        // Check if another user has used FIRST7 from the same address
        const existingAddressUsers = await prisma.user.findMany({
          where: {
            AND: [
              { id: { not: user.id } }, // Not the current user
              { address: { equals: user.address.toLowerCase().trim() } },
              { city: { equals: user.city.toLowerCase().trim() } },
              { postalCode: { equals: user.postalCode.toLowerCase().trim() } }
            ]
          },
          include: {
            couponUsages: {
              where: { couponId: coupon.id },
              select: { id: true, usedAt: true }
            }
          }
        })
        
        console.log('🔍 Found users at same address:', {
          count: existingAddressUsers.length,
          users: existingAddressUsers.map(u => ({
            id: u.id,
            email: u.email,
            couponUsages: u.couponUsages.length
          }))
        })

        // Check if any user at this address has used FIRST7
        const addressHasUsedFirst7 = existingAddressUsers.some(u => u.couponUsages.length > 0)
        
        if (addressHasUsedFirst7) {
          console.log('❌ FIRST7 already used at this address by another user')
          return NextResponse.json(
            { success: false, error: 'This new customer discount has already been used at this address' },
            { status: 400 }
          )
        }
        
        console.log('✅ Address check passed - no previous FIRST7 usage at this address')
      } else {
        console.log('⚠️ Skipping address-based validation - user address incomplete:', {
          hasAddress: !!user.address,
          hasCity: !!user.city,
          hasPostalCode: !!user.postalCode
        })
      }
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: 'This coupon is no longer active' },
        { status: 400 }
      )
    }

    // Check if coupon is within valid date range
    const now = new Date()
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return NextResponse.json(
        { success: false, error: 'This coupon has expired or is not yet valid' },
        { status: 400 }
      )
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: 'This coupon has reached its usage limit' },
        { status: 400 }
      )
    }

    // Check minimum amount requirement
    if (coupon.minimumAmount && cartTotal < Number(coupon.minimumAmount)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Minimum order amount of £${coupon.minimumAmount} required for this coupon` 
        },
        { status: 400 }
      )
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (cartTotal * Number(coupon.discountValue)) / 100
      // Apply maximum discount limit if set
      if (coupon.maximumDiscount && discountAmount > Number(coupon.maximumDiscount)) {
        discountAmount = Number(coupon.maximumDiscount)
      }
    } else if (coupon.discountType === 'FIXED_AMOUNT') {
      discountAmount = Number(coupon.discountValue)
    }

    // Ensure discount doesn't exceed cart total
    discountAmount = Math.min(discountAmount, cartTotal)

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        discountAmount: Number(discountAmount.toFixed(2)),
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        description: coupon.description
      }
    })

  } catch (error: any) {
    console.error('❌ Coupon validation error:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    return handleApiError(error)
  }
}