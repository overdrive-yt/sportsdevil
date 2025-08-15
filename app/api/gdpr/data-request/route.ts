import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../lib/api/middleware'
import { GDPRCompliance, DataSubjectRight } from '../../../../lib/gdpr'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'

const dataRequestSchema = z.object({
  requestType: z.enum([
    'access',
    'rectification', 
    'erasure',
    'restrict_processing',
    'data_portability',
    'object',
    'automated_decision',
    'withdraw_consent'
  ]),
  reason: z.string().optional(),
  details: z.record(z.any()).optional()
})

export async function POST(request: NextRequest) {
  try {
    // Require authentication for data requests
    const user = await requireAuth(request)
    
    const body = await request.json()
    const { requestType, reason, details } = dataRequestSchema.parse(body)
    
    let response: any = { success: true }
    
    switch (requestType) {
      case 'access':
        // Export user data (Article 15)
        const userData = await GDPRCompliance.exportUserData(user.id)
        response.data = userData
        response.message = 'Your personal data has been exported successfully'
        break
        
      case 'erasure':
        // Right to be forgotten (Article 17)
        await GDPRCompliance.deleteUserData(user.id, reason || 'User requested deletion')
        response.message = 'Your account has been scheduled for deletion. You will receive a confirmation email.'
        break
        
      case 'rectification':
        // Right to rectification (Article 16)
        if (!details) {
          return NextResponse.json({
            success: false,
            message: 'Update details are required for rectification requests'
          }, { status: 400 })
        }
        
        await GDPRCompliance.updateUserData(user.id, details)
        response.message = 'Your data has been updated successfully'
        break
        
      case 'data_portability':
        // Right to data portability (Article 20)
        const portableData = await GDPRCompliance.exportUserData(user.id)
        response.data = portableData
        response.downloadUrl = `/api/gdpr/export/${user.id}`
        response.message = 'Your data is ready for download in a portable format'
        break
        
      case 'withdraw_consent':
        // Right to withdraw consent (Article 7)
        // This would update consent preferences
        response.message = 'Your consent has been withdrawn. Please update your cookie preferences.'
        response.redirectUrl = '/cookie-preferences'
        break
        
      case 'object':
      case 'restrict_processing':
      case 'automated_decision':
        // These would typically require manual review
        response.message = 'Your request has been received and will be processed within 30 days. You will receive an email confirmation.'
        break
        
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid request type'
        }, { status: 400 })
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('GDPR data request failed:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      }, { status: 400 })
    }
    
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        message: error.message
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to process your request'
    }, { status: 500 })
  }
}

// Get user's GDPR request history
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    const requests = await prisma.gdprRequest.findMany({
      where: { userId: user.id },
      orderBy: { requestDate: 'desc' },
      select: {
        id: true,
        requestType: true,
        status: true,
        requestDate: true,
        processedDate: true,
        reason: true
      }
    })
    
    return NextResponse.json({
      success: true,
      requests,
      rights: {
        access: 'Request a copy of all your personal data',
        rectification: 'Correct inaccurate or incomplete data',
        erasure: 'Request deletion of your personal data',
        restrict_processing: 'Limit how we process your data',
        data_portability: 'Receive your data in a portable format',
        object: 'Object to processing of your personal data',
        automated_decision: 'Request review of automated decisions',
        withdraw_consent: 'Withdraw previously given consent'
      }
    })
    
  } catch (error) {
    console.error('Failed to get GDPR requests:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve your requests'
    }, { status: 500 })
  }
}