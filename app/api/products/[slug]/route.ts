import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '../../../../lib/services/product.service'
import { createSuccessResponse } from '../../../../lib/api/responses'
import { handleApiError } from '../../../../lib/api/errors'
import { checkRateLimit, getRateLimitIdentifier } from '../../../../lib/api/middleware'
import { prisma } from '../../../../lib/prisma'

interface RouteParams {
  params: Promise<{
    slug: string
  }>
}

// Helper function to check if slug is actually an ID (for admin operations)
function isValidId(slug: string): boolean {
  // Check if it's a CUID (starts with 'c' and is 25+ characters) or UUID pattern
  return /^c[a-z0-9]{24,}$/.test(slug) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(slug)
}

// GET: Get product by slug or ID
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 100, 60000)) {
      return handleApiError(new Error('Too many requests'))
    }

    const { slug } = await context.params
    
    let product
    if (isValidId(slug)) {
      // Admin request using ID
      product = await prisma.product.findUnique({
        where: { id: slug },
        include: {
          images: true,
          productCategories: {
            include: {
              category: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        }
      })
      
      if (!product) {
        return NextResponse.json({
          success: false,
          error: 'Product not found'
        }, { status: 404 })
      }

      // Calculate average rating
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0

      const productData = {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length
      }

      return NextResponse.json({
        success: true,
        data: productData
      })
    } else {
      // Public request using slug
      product = await ProductService.getProductBySlug(slug)
      return createSuccessResponse(product, 'Product retrieved successfully')
    }
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE: Delete a product (admin only, expects ID)
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { slug } = await context.params
    const productId = slug // In admin context, this will be an ID

    if (!isValidId(productId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid product identifier for deletion'
      }, { status: 400 })
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true }
    })

    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 })
    }

    // Check for dependencies (orders, cart items, etc.)
    const orderItems = await prisma.orderItem.count({
      where: { productId }
    })

    const cartItems = await prisma.cartItem.count({
      where: { productId }
    })

    if (orderItems > 0 || cartItems > 0) {
      // Instead of deleting, mark as inactive
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: { 
          isActive: false,
          status: 'INACTIVE'
        }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'PRODUCT_DEACTIVATE',
          userId: 'system',
          entityType: 'product',
          entityId: productId,
          details: JSON.stringify({
            name: existingProduct.name,
            reason: 'Has dependencies (orders/cart items)',
            orderItems,
            cartItems
          })
        }
      }).catch(console.error)

      return NextResponse.json({
        success: true,
        message: 'Product deactivated (has order/cart dependencies)',
        data: updatedProduct,
        deactivated: true
      })
    }

    // Safe to delete - no dependencies
    await prisma.product.delete({
      where: { id: productId }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'PRODUCT_DELETE',
        userId: 'system',
        entityType: 'product',
        entityId: productId,
        details: JSON.stringify({
          name: existingProduct.name,
          deletedAt: new Date()
        })
      }
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      deleted: true
    })

  } catch (error) {
    console.error('Product delete error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete product'
    }, { status: 500 })
  }
}

// PUT: Update product (admin only, expects ID)
export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const { slug } = await context.params
    const productId = slug // In admin context, this will be an ID
    const updates = await request.json()

    if (!isValidId(productId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid product identifier for update'
      }, { status: 400 })
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 })
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'PRODUCT_UPDATE',
        userId: 'system',
        entityType: 'product',
        entityId: productId,
        details: JSON.stringify({
          name: updatedProduct.name,
          changes: updates
        })
      }
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    })

  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update product'
    }, { status: 500 })
  }
}