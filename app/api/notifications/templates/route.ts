import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { TemplateManager } from '../../../../lib/notifications'
import { z } from 'zod'

const templateManager = new TemplateManager()

// Template preview request schema
const previewRequestSchema = z.object({
  templateId: z.string(),
  type: z.enum(['email', 'sms']),
  variables: z.record(z.string()),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Allow authenticated users to view templates
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'preview') {
      // Preview template with variables
      const templateId = searchParams.get('templateId')
      const type = searchParams.get('type') as 'email' | 'sms'
      
      if (!templateId || !type) {
        return NextResponse.json(
          { error: 'templateId and type are required for preview' },
          { status: 400 }
        )
      }

      // Get sample variables for preview
      const sampleVariables = getSampleVariables(templateId)
      
      if (type === 'email') {
        const rendered = templateManager.renderEmailTemplate(templateId, sampleVariables)
        if (!rendered) {
          return NextResponse.json(
            { error: 'Template not found' },
            { status: 404 }
          )
        }
        return NextResponse.json({
          type: 'email',
          templateId,
          rendered,
          sampleVariables,
        })
      } else {
        const rendered = templateManager.renderSMSTemplate(templateId, sampleVariables)
        if (!rendered) {
          return NextResponse.json(
            { error: 'Template not found' },
            { status: 404 }
          )
        }
        return NextResponse.json({
          type: 'sms',
          templateId,
          rendered,
          sampleVariables,
        })
      }
    }

    // Default: List all available templates
    const emailTemplates = [
      'order_confirmation',
      'order_shipped',
      'low_stock_alert',
      'season_reminder'
    ].map(id => {
      const template = templateManager.getEmailTemplate(id)
      return template ? {
        id: template.id,
        name: template.name,
        type: 'email',
        variables: template.variables,
      } : null
    }).filter(Boolean)

    const smsTemplates = [
      'order_confirmation',
      'order_shipped',
      'back_in_stock'
    ].map(id => {
      const template = templateManager.getSMSTemplate(id)
      return template ? {
        id: template.id,
        name: template.name,
        type: 'sms',
        variables: template.variables,
      } : null
    }).filter(Boolean)

    return NextResponse.json({
      templates: {
        email: emailTemplates,
        sms: smsTemplates,
      },
      total: emailTemplates.length + smsTemplates.length,
    })

  } catch (error) {
    console.error('Failed to fetch templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow authenticated users
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const previewRequest = previewRequestSchema.parse(body)

    if (previewRequest.type === 'email') {
      const rendered = templateManager.renderEmailTemplate(
        previewRequest.templateId, 
        previewRequest.variables
      )
      
      if (!rendered) {
        return NextResponse.json(
          { error: 'Email template not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        type: 'email',
        templateId: previewRequest.templateId,
        rendered,
        variables: previewRequest.variables,
      })
    } else {
      const rendered = templateManager.renderSMSTemplate(
        previewRequest.templateId, 
        previewRequest.variables
      )
      
      if (!rendered) {
        return NextResponse.json(
          { error: 'SMS template not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        type: 'sms',
        templateId: previewRequest.templateId,
        rendered,
        variables: previewRequest.variables,
      })
    }

  } catch (error) {
    console.error('Template preview error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to preview template' },
      { status: 500 }
    )
  }
}

function getSampleVariables(templateId: string): Record<string, string> {
  const sampleData = {
    order_confirmation: {
      customerName: 'John Smith',
      orderNumber: 'SD-2025-001',
      orderDate: 'January 1, 2025',
      orderTotal: '89.99',
      orderItems: `
        <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
          <strong>Professional Cricket Bat</strong><br>
          SKU: BAT-PRO-001 | Qty: 1 | £79.99
        </div>
        <div style="padding: 10px 0;">
          <strong>Batting Gloves</strong><br>
          SKU: GLOVE-BAT-001 | Qty: 1 | £19.99
        </div>
      `,
      orderItemsText: 'Professional Cricket Bat (£79.99), Batting Gloves (£19.99)',
      deliveryAddress: 'John Smith\n123 Cricket Lane\nBirmingham B1 1AA\nUnited Kingdom',
      estimatedDelivery: 'January 3-5, 2025'
    },
    order_shipped: {
      customerName: 'John Smith',
      orderNumber: 'SD-2025-001',
      trackingNumber: 'TRK123456789',
      carrier: 'Royal Mail',
      expectedDelivery: 'January 3, 2025',
      trackingUrl: 'https://track.royalmail.com/TRK123456789',
      deliveryAddress: 'John Smith\n123 Cricket Lane\nBirmingham B1 1AA\nUnited Kingdom'
    },
    low_stock_alert: {
      productName: 'Professional Cricket Bat - English Willow',
      productSku: 'BAT-PRO-001',
      currentStock: '3',
      reorderLevel: '10',
      adminUrl: 'https://sportsdevil.co.uk/admin/inventory'
    },
    season_reminder: {
      customerName: 'John Smith'
    },
    back_in_stock: {
      productName: 'Professional Cricket Bat',
      price: '79.99',
      productSlug: 'professional-cricket-bat-english-willow',
      total: '89.99',
      itemCount: '2',
      deliveryDate: 'January 3, 2025',
      trackingNumber: 'TRK123456789',
      trackingUrl: 'https://track.royalmail.com/TRK123456789'
    }
  }

  return sampleData[templateId as keyof typeof sampleData] || {}
}