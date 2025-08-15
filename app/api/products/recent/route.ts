// V9.16: Recent Products API for Dashboard
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '4')
  
  try {

    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        name: true,
        price: true,
        stockQuantity: true,
        sku: true,
        slug: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        count: products.length,
        limit
      }
    })

  } catch (error) {
    console.error('Recent products API error:', error)
    
    // Return fallback data if database fails
    const fallbackProducts = [
      {
        id: 'fallback-1',
        name: 'Gray-Nicolls Kaboom Pro',
        price: 89.99,
        stockQuantity: 12,
        sku: 'GN-KABOOM-PRO',
        slug: 'gray-nicolls-kaboom-pro',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'fallback-2',
        name: 'Aero P1 Pro Batting Gloves',
        price: 39.99,
        stockQuantity: 25,
        sku: 'AERO-P1-GLOVES',
        slug: 'aero-p1-pro-batting-gloves',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'fallback-3',
        name: 'Masuri Pro Cricket Helmet',
        price: 79.99,
        stockQuantity: 8,
        sku: 'MASURI-PRO-HELMET',
        slug: 'masuri-pro-cricket-helmet',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'fallback-4',
        name: 'Kookaburra Pro Pads',
        price: 65.99,
        stockQuantity: 15,
        sku: 'KOOK-PRO-PADS',
        slug: 'kookaburra-pro-pads',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    return NextResponse.json({
      success: true,
      data: fallbackProducts,
      meta: {
        count: fallbackProducts.length,
        limit,
        fallback: true
      }
    })
  }
}