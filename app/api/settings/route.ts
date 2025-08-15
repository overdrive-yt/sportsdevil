// V9.15: Settings Persistence API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

interface SystemSettings {
  general: {
    siteName: string
    siteUrl: string
    adminEmail: string
    timezone: string
    language: string
    maintenanceMode: boolean
    debugMode: boolean
  }
  integrations: {
    autoSync: boolean
    syncInterval: number
    maxRetries: number
    webhookTimeout: number
    rateLimitPerMinute: number
    enableLogging: boolean
  }
  security: {
    requireTwoFactor: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    passwordComplexity: 'basic' | 'moderate' | 'strict'
    enableAuditLog: boolean
    ipWhitelist: string[]
  }
  performance: {
    cacheEnabled: boolean
    cacheTtl: number
    compressionEnabled: boolean
    cdnEnabled: boolean
    lazyLoading: boolean
    imageOptimization: boolean
  }
  notifications: {
    emailEnabled: boolean
    smsEnabled: boolean
    pushEnabled: boolean
    slackWebhook?: string
    discordWebhook?: string
    emailTemplates: {
      orderConfirmation: boolean
      systemAlerts: boolean
      maintenanceNotices: boolean
    }
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    primaryColor: string
    brandLogo?: string
    favicon?: string
    customCss?: string
    showBranding: boolean
  }
}

const DEFAULT_SETTINGS: SystemSettings = {
  general: {
    siteName: 'Sports Devil',
    siteUrl: 'https://sportsdevil.co.uk',
    adminEmail: 'admin@sportsdevil.co.uk',
    timezone: 'Europe/London',
    language: 'en',
    maintenanceMode: false,
    debugMode: false
  },
  integrations: {
    autoSync: true,
    syncInterval: 15,
    maxRetries: 3,
    webhookTimeout: 30,
    rateLimitPerMinute: 100,
    enableLogging: true
  },
  security: {
    requireTwoFactor: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordComplexity: 'moderate',
    enableAuditLog: true,
    ipWhitelist: []
  },
  performance: {
    cacheEnabled: true,
    cacheTtl: 3600,
    compressionEnabled: true,
    cdnEnabled: false,
    lazyLoading: true,
    imageOptimization: true
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    emailTemplates: {
      orderConfirmation: true,
      systemAlerts: true,
      maintenanceNotices: true
    }
  },
  appearance: {
    theme: 'system',
    primaryColor: '#3b82f6',
    showBranding: true
  }
}

// GET: Retrieve current settings
export async function GET(request: NextRequest) {
  try {
    // Try to get settings from database
    const settingsRecord = await prisma.systemSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    })

    if (settingsRecord) {
      return NextResponse.json({
        success: true,
        data: JSON.parse(settingsRecord.settings),
        meta: {
          lastUpdated: settingsRecord.updatedAt,
          version: settingsRecord.version
        }
      })
    }

    // Return default settings if none exist
    return NextResponse.json({
      success: true,
      data: DEFAULT_SETTINGS,
      meta: {
        lastUpdated: null,
        version: '1.0.0',
        isDefault: true
      }
    })

  } catch (error) {
    console.error('Settings GET error:', error)
    
    // Return default settings on error
    return NextResponse.json({
      success: true,
      data: DEFAULT_SETTINGS,
      meta: {
        lastUpdated: null,
        version: '1.0.0',
        isDefault: true,
        fallback: true
      }
    })
  }
}

// POST: Save/Update settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings, userId } = body

    if (!settings) {
      return NextResponse.json({
        success: false,
        error: 'Settings data is required'
      }, { status: 400 })
    }

    // Validate settings structure
    const validatedSettings = validateSettings(settings)
    if (!validatedSettings.valid) {
      return NextResponse.json({
        success: false,
        error: validatedSettings.error
      }, { status: 400 })
    }

    // Save settings to database
    const savedSettings = await prisma.systemSettings.create({
      data: {
        settings: JSON.stringify(settings),
        version: '1.0.0',
        updatedBy: userId || 'system'
      }
    })

    // Log the settings change
    if (settings.security?.enableAuditLog) {
      await prisma.auditLog.create({
        data: {
          action: 'SETTINGS_UPDATE',
          userId: userId || 'system',
          details: JSON.stringify({
            timestamp: new Date(),
            changes: Object.keys(settings)
          })
        }
      }).catch(console.error) // Don't fail if audit log fails
    }

    return NextResponse.json({
      success: true,
      data: settings,
      meta: {
        lastUpdated: savedSettings.updatedAt,
        version: savedSettings.version,
        id: savedSettings.id
      }
    })

  } catch (error) {
    console.error('Settings POST error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to save settings',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 })
  }
}

// PUT: Reset settings to defaults
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    // Save default settings
    const savedSettings = await prisma.systemSettings.create({
      data: {
        settings: JSON.stringify(DEFAULT_SETTINGS),
        version: '1.0.0',
        updatedBy: userId || 'system'
      }
    })

    // Log the settings reset
    await prisma.auditLog.create({
      data: {
        action: 'SETTINGS_RESET',
        userId: userId || 'system',
        details: JSON.stringify({
          timestamp: new Date(),
          message: 'Settings reset to defaults'
        })
      }
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      data: DEFAULT_SETTINGS,
      meta: {
        lastUpdated: savedSettings.updatedAt,
        version: savedSettings.version,
        id: savedSettings.id,
        reset: true
      }
    })

  } catch (error) {
    console.error('Settings PUT error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to reset settings'
    }, { status: 500 })
  }
}

function validateSettings(settings: any): { valid: boolean; error?: string } {
  // Basic structure validation
  const requiredSections = ['general', 'integrations', 'security', 'performance', 'notifications', 'appearance']
  
  for (const section of requiredSections) {
    if (!settings[section]) {
      return { valid: false, error: `Missing required section: ${section}` }
    }
  }

  // Validate specific fields
  if (settings.general.siteName && typeof settings.general.siteName !== 'string') {
    return { valid: false, error: 'Site name must be a string' }
  }

  if (settings.security.sessionTimeout && (settings.security.sessionTimeout < 5 || settings.security.sessionTimeout > 1440)) {
    return { valid: false, error: 'Session timeout must be between 5 and 1440 minutes' }
  }

  if (settings.integrations.syncInterval && settings.integrations.syncInterval < 1) {
    return { valid: false, error: 'Sync interval must be at least 1 minute' }
  }

  if (settings.performance.cacheTtl && settings.performance.cacheTtl < 60) {
    return { valid: false, error: 'Cache TTL must be at least 60 seconds' }
  }

  return { valid: true }
}