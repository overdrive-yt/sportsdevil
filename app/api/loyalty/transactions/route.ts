import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get loyalty transactions
    const transactions = await prisma.loyaltyTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true
          }
        }
      }
    })

    // Get total count for pagination
    const totalCount = await prisma.loyaltyTransaction.count({
      where: { userId: user.id }
    })

    return NextResponse.json({
      transactions: transactions.map(transaction => ({
        id: transaction.id,
        type: transaction.type,
        points: transaction.points,
        description: transaction.description,
        createdAt: transaction.createdAt,
        order: transaction.order ? {
          id: transaction.order.id,
          orderNumber: transaction.order.orderNumber,
          totalAmount: transaction.order.totalAmount
        } : null
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: (offset + limit) < totalCount
      }
    })

  } catch (error) {
    console.error('Error fetching loyalty transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}