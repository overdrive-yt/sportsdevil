import { NextRequest, NextResponse } from 'next/server'
import { socialShareManager } from '../../../../lib/social-media'
import { z } from 'zod'

const shareRequestSchema = z.object({
  platform: z.enum(['facebook', 'twitter', 'instagram', 'whatsapp', 'linkedin']),
  contentType: z.enum(['product', 'offer', 'post', 'page']),
  contentId: z.string(),
  url: z.string().url(),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  hashtags: z.array(z.string()).optional(),
})

const generateShareUrlsSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  hashtags: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'track') {
      return await handleTrackShare(request)
    } else if (action === 'generate-urls') {
      return await handleGenerateUrls(request)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use track or generate-urls' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Social share API error:', error)
    return NextResponse.json(
      { error: 'Social share API error' },
      { status: 500 }
    )
  }
}

async function handleTrackShare(request: NextRequest) {
  try {
    const body = await request.json()
    const shareData = shareRequestSchema.parse(body)

    // Track the share event
    socialShareManager.trackShareEvent(
      shareData.platform,
      shareData.contentType,
      shareData.contentId
    )

    // Log share tracking
    console.log('Social share tracked:', {
      platform: shareData.platform,
      contentType: shareData.contentType,
      contentId: shareData.contentId,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Share event tracked successfully',
      shareData: {
        platform: shareData.platform,
        contentType: shareData.contentType,
        contentId: shareData.contentId,
        url: shareData.url,
      },
    })

  } catch (error) {
    console.error('Track share error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid share data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to track share event' },
      { status: 500 }
    )
  }
}

async function handleGenerateUrls(request: NextRequest) {
  try {
    const body = await request.json()
    const urlData = generateShareUrlsSchema.parse(body)

    // Generate share URLs for all platforms
    const shareUrls = socialShareManager.generateShareUrls({
      platform: 'facebook', // Default platform, URLs generated for all
      url: urlData.url,
      title: urlData.title,
      description: urlData.description,
      image: urlData.image,
      hashtags: urlData.hashtags,
    })

    // Log URL generation
    console.log('Share URLs generated:', {
      url: urlData.url,
      title: urlData.title,
      platforms: Object.keys(shareUrls),
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Share URLs generated successfully',
      urls: shareUrls,
      meta: {
        originalUrl: urlData.url,
        title: urlData.title,
        platforms: Object.keys(shareUrls),
      },
    })

  } catch (error) {
    console.error('Generate URLs error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid URL data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate share URLs' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Type and ID parameters are required' },
        { status: 400 }
      )
    }

    let shareData

    if (type === 'product') {
      // Generate share data for a product
      // In a real implementation, fetch product from database
      const mockProduct = {
        id,
        name: 'Professional Cricket Bat',
        price: 89.99,
        image: 'https://sportsdevil.co.uk/images/cricket-bat.jpg',
        description: 'Premium English willow cricket bat for professional players'
      }

      shareData = socialShareManager.generateProductShareData(mockProduct)
    } else if (type === 'offer') {
      // Generate share data for an offer
      const mockOffer = {
        title: 'Summer Cricket Sale',
        description: 'Get ready for cricket season with amazing deals on all equipment',
        discount: '20%',
        image: 'https://sportsdevil.co.uk/images/summer-sale.jpg'
      }

      shareData = socialShareManager.generateOfferShareData(mockOffer)
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Use product or offer' },
        { status: 400 }
      )
    }

    // Generate URLs for all platforms
    const shareUrls = socialShareManager.generateShareUrls(shareData)

    return NextResponse.json({
      success: true,
      shareData,
      urls: shareUrls,
      meta: {
        type,
        id,
        platforms: Object.keys(shareUrls),
      },
    })

  } catch (error) {
    console.error('Get share data error:', error)
    return NextResponse.json(
      { error: 'Failed to get share data' },
      { status: 500 }
    )
  }
}