import { NextRequest, NextResponse } from 'next/server'
import { GDPRCompliance, CookieConsent } from '@/lib/gdpr'
import { z } from 'zod'

const consentSchema = z.object({
  sessionId: z.string().min(1),
  essential: z.boolean().default(true),
  performance: z.boolean().default(false),
  functional: z.boolean().default(false),
  marketing: z.boolean().default(false),
  analytics: z.boolean().default(false),
  version: z.string().default('1.0'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = consentSchema.parse(body)
    
    // Get IP address from request
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     '0.0.0.0'
    
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Save consent preferences
    await GDPRCompliance.saveConsent({
      ...validatedData,
      ipAddress,
      userAgent
    })
    
    return NextResponse.json({
      success: true,
      message: 'Consent preferences saved successfully',
      allowedCookies: CookieConsent.getAllowedCookies({
        ...validatedData,
        consentDate: new Date(),
        lastUpdated: new Date(),
        ipAddress,
        userAgent
      })
    })
    
  } catch (error) {
    console.error('Failed to save GDPR consent:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid consent data',
        errors: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to save consent preferences'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        message: 'Session ID is required'
      }, { status: 400 })
    }
    
    // Get current consent
    const consent = await GDPRCompliance.getConsent(sessionId, userId || undefined)
    
    // Generate consent configuration
    const config = CookieConsent.generateConsentConfig(consent)
    
    return NextResponse.json({
      success: true,
      consent: config
    })
    
  } catch (error) {
    console.error('Failed to get GDPR consent:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve consent preferences'
    }, { status: 500 })
  }
}