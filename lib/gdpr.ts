/**
 * GDPR Compliance Framework
 * Handles data privacy, cookie consent, and user data rights
 */

import { prisma } from './prisma'

// Cookie categories for granular consent
export enum CookieCategory {
  ESSENTIAL = 'essential',
  PERFORMANCE = 'performance', 
  FUNCTIONAL = 'functional',
  MARKETING = 'marketing',
  ANALYTICS = 'analytics'
}

// Data processing purposes
export enum ProcessingPurpose {
  CONTRACT = 'contract',
  CONSENT = 'consent',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task',
  LEGITIMATE_INTERESTS = 'legitimate_interests'
}

// User data retention periods (in days)
export const DATA_RETENTION_PERIODS = {
  USER_ACCOUNT: 2555, // 7 years for tax/legal reasons
  ORDER_DATA: 2555, // 7 years for tax/legal reasons
  MARKETING_CONSENT: 1095, // 3 years
  ANALYTICS_DATA: 1095, // 3 years
  SESSION_DATA: 30, // 30 days
  CUSTOMER_SERVICE: 2190, // 6 years
  AUDIT_LOGS: 2555, // 7 years
} as const

// Cookie definitions with GDPR compliance info
export const COOKIE_DEFINITIONS = {
  [CookieCategory.ESSENTIAL]: {
    name: 'Essential Cookies',
    description: 'These cookies are necessary for the website to function and cannot be switched off.',
    purpose: ProcessingPurpose.CONTRACT,
    retention: 'Session or 1 year',
    cookies: [
      {
        name: 'next-auth.session-token',
        description: 'Manages user authentication sessions',
        expiry: '30 days'
      },
      {
        name: 'next-auth.csrf-token',
        description: 'Prevents cross-site request forgery attacks',
        expiry: 'Session'
      },
      {
        name: 'cart-data',
        description: 'Stores shopping cart contents',
        expiry: '30 days'
      },
      {
        name: 'theme-preference',
        description: 'Remembers user theme selection (dark/light mode)',
        expiry: '1 year'
      }
    ]
  },
  [CookieCategory.PERFORMANCE]: {
    name: 'Performance Cookies',
    description: 'These cookies help us understand how visitors interact with our website.',
    purpose: ProcessingPurpose.LEGITIMATE_INTERESTS,
    retention: '2 years',
    cookies: [
      {
        name: '_ga',
        description: 'Google Analytics - distinguishes users',
        expiry: '2 years'
      },
      {
        name: '_gid',
        description: 'Google Analytics - distinguishes users',
        expiry: '24 hours'
      }
    ]
  },
  [CookieCategory.FUNCTIONAL]: {
    name: 'Functional Cookies',
    description: 'These cookies enable the website to provide enhanced functionality.',
    purpose: ProcessingPurpose.CONSENT,
    retention: '1 year',
    cookies: [
      {
        name: 'wishlist-data',
        description: 'Stores user wishlist preferences',
        expiry: '1 year'
      },
      {
        name: 'location-preference',
        description: 'Remembers user location for shipping estimates',
        expiry: '6 months'
      }
    ]
  },
  [CookieCategory.MARKETING]: {
    name: 'Marketing Cookies',
    description: 'These cookies track your online activity to help advertisers deliver relevant advertising.',
    purpose: ProcessingPurpose.CONSENT,
    retention: '1 year',
    cookies: [
      {
        name: 'facebook_pixel',
        description: 'Facebook advertising pixel for conversion tracking',
        expiry: '3 months'
      },
      {
        name: 'google_ads',
        description: 'Google Ads conversion tracking',
        expiry: '90 days'
      }
    ]
  },
  [CookieCategory.ANALYTICS]: {
    name: 'Analytics Cookies',
    description: 'These cookies help us improve our website by collecting information about its use.',
    purpose: ProcessingPurpose.LEGITIMATE_INTERESTS,
    retention: '2 years',
    cookies: [
      {
        name: 'hotjar',
        description: 'Hotjar analytics and user behavior tracking',
        expiry: '1 year'
      },
      {
        name: 'sentry_performance',
        description: 'Error tracking and performance monitoring',
        expiry: '1 year'
      }
    ]
  }
} as const

// GDPR consent interface
export interface GDPRConsent {
  userId?: string
  sessionId: string
  essential: boolean // Always true, cannot be disabled
  performance: boolean
  functional: boolean
  marketing: boolean
  analytics: boolean
  consentDate: Date
  lastUpdated: Date
  ipAddress: string
  userAgent: string
  version: string // Consent banner version
}

// Data subject rights
export enum DataSubjectRight {
  ACCESS = 'access', // Art. 15 - Right of access
  RECTIFICATION = 'rectification', // Art. 16 - Right to rectification
  ERASURE = 'erasure', // Art. 17 - Right to erasure (right to be forgotten)
  RESTRICT_PROCESSING = 'restrict_processing', // Art. 18 - Right to restriction
  DATA_PORTABILITY = 'data_portability', // Art. 20 - Right to data portability
  OBJECT = 'object', // Art. 21 - Right to object
  AUTOMATED_DECISION = 'automated_decision', // Art. 22 - Rights related to automated decision making
  WITHDRAW_CONSENT = 'withdraw_consent' // Art. 7 - Right to withdraw consent
}

// GDPR compliance utilities
export class GDPRCompliance {
  // Save user consent preferences
  static async saveConsent(consent: Omit<GDPRConsent, 'consentDate' | 'lastUpdated'>): Promise<void> {
    try {
      await prisma.gdprConsent.upsert({
        where: { 
          sessionId: consent.sessionId 
        },
        update: {
          essential: consent.essential,
          performance: consent.performance,
          functional: consent.functional,
          marketing: consent.marketing,
          analytics: consent.analytics,
          lastUpdated: new Date(),
          ipAddress: consent.ipAddress,
          userAgent: consent.userAgent,
          version: consent.version,
          ...(consent.userId && { userId: consent.userId })
        },
        create: {
          sessionId: consent.sessionId,
          essential: consent.essential,
          performance: consent.performance,
          functional: consent.functional,
          marketing: consent.marketing,
          analytics: consent.analytics,
          consentDate: new Date(),
          lastUpdated: new Date(),
          ipAddress: consent.ipAddress,
          userAgent: consent.userAgent,
          version: consent.version,
          ...(consent.userId && { userId: consent.userId })
        }
      })
    } catch (error) {
      console.error('Failed to save GDPR consent:', error)
      throw new Error('Failed to save consent preferences')
    }
  }

  // Get user consent preferences
  static async getConsent(sessionId: string, userId?: string): Promise<GDPRConsent | null> {
    try {
      const consent = await prisma.gdprConsent.findFirst({
        where: {
          OR: [
            { sessionId },
            ...(userId ? [{ userId }] : [])
          ]
        },
        orderBy: { lastUpdated: 'desc' }
      })

      return consent as any
    } catch (error) {
      console.error('Failed to get GDPR consent:', error)
      return null
    }
  }

  // Handle data subject access request (Art. 15)
  static async exportUserData(userId: string): Promise<Record<string, any>> {
    try {
      const [user, orders, reviews, loyaltyTransactions, wishlists, appointments] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          include: {
            accounts: true,
            sessions: true,
          }
        }),
        prisma.order.findMany({
          where: { userId },
          include: { 
            orderItems: true
          }
        }),
        prisma.review.findMany({
          where: { userId }
        }),
        prisma.loyaltyTransaction.findMany({
          where: { userId }
        }),
        prisma.wishlist.findMany({
          where: { userId },
          include: { 
            items: true
          }
        }),
        prisma.appointment.findMany({
          where: { userId }
        })
      ])

      return {
        personal_data: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          phone: user?.phone,
          address: user?.address,
          city: user?.city,
          postal_code: user?.postalCode,
          country: user?.country,
          created_at: user?.createdAt,
          updated_at: user?.updatedAt,
          last_login: user?.sessions?.[0]?.expires
        },
        account_data: {
          loyalty_points: user?.loyaltyPoints,
          total_spent: user?.totalSpent,
          email_verified: user?.emailVerified
        },
        order_history: orders,
        reviews: reviews,
        loyalty_transactions: loyaltyTransactions,
        wishlists: wishlists,
        appointments: appointments,
        export_date: new Date().toISOString(),
        data_controller: {
          name: 'W3 Sports Devil Ltd',
          address: 'UK',
          email: 'privacy@sportsdevil.co.uk'
        }
      }
    } catch (error) {
      console.error('Failed to export user data:', error)
      throw new Error('Failed to export user data')
    }
  }

  // Handle right to erasure (Art. 17) - Right to be forgotten
  static async deleteUserData(userId: string, reason: string): Promise<void> {
    try {
      // Check if user has pending orders (cannot delete immediately)
      const pendingOrders = await prisma.order.findMany({
        where: {
          userId,
          status: {
            in: ['PENDING', 'CONFIRMED', 'PROCESSING']
          }
        }
      })

      if (pendingOrders.length > 0) {
        throw new Error('Cannot delete user data with pending orders. Please complete or cancel orders first.')
      }

      // Log the deletion request for compliance
      await prisma.gdprRequest.create({
        data: {
          userId,
          requestType: 'ERASURE',
          status: 'PROCESSING',
          requestDate: new Date(),
          reason,
          processedBy: 'SYSTEM'
        }
      })

      // Anonymize rather than hard delete (for order history integrity)
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: 'DELETED USER',
          email: `deleted_${userId}@anonymized.local`,
          phone: null,
          address: null,
          city: null,
          postalCode: null,
          country: null,
          image: null,
          emailVerified: null
        }
      })

      // Delete personal sessions and accounts
      await prisma.session.deleteMany({ where: { userId } })
      await prisma.account.deleteMany({ where: { userId } })

      // Mark as completed
      await prisma.gdprRequest.updateMany({
        where: { 
          userId,
          requestType: 'ERASURE',
          status: 'PROCESSING'
        },
        data: {
          status: 'COMPLETED',
          processedDate: new Date()
        }
      })
    } catch (error) {
      console.error('Failed to delete user data:', error)
      throw error
    }
  }

  // Handle data rectification request (Art. 16)
  static async updateUserData(userId: string, updates: Partial<any>): Promise<void> {
    try {
      await prisma.gdprRequest.create({
        data: {
          userId,
          requestType: 'RECTIFICATION',
          status: 'COMPLETED',
          requestDate: new Date(),
          processedDate: new Date(),
          details: JSON.stringify(updates),
          processedBy: 'USER_PORTAL'
        }
      })

      // Update user data
      await prisma.user.update({
        where: { id: userId },
        data: updates
      })
    } catch (error) {
      console.error('Failed to update user data:', error)
      throw new Error('Failed to update user data')
    }
  }

  // Check if data should be deleted based on retention periods
  static async checkDataRetention(): Promise<void> {
    try {
      const now = new Date()

      // Delete expired marketing consents
      const marketingExpiry = new Date(now.getTime() - DATA_RETENTION_PERIODS.MARKETING_CONSENT * 24 * 60 * 60 * 1000)
      
      await prisma.gdprConsent.deleteMany({
        where: {
          lastUpdated: { lt: marketingExpiry },
          marketing: true
        }
      })

      // Delete expired session data
      const sessionExpiry = new Date(now.getTime() - DATA_RETENTION_PERIODS.SESSION_DATA * 24 * 60 * 60 * 1000)
      
      await prisma.session.deleteMany({
        where: {
          expires: { lt: sessionExpiry }
        }
      })

      console.log('Data retention cleanup completed')
    } catch (error) {
      console.error('Data retention cleanup failed:', error)
    }
  }

  // Generate GDPR compliance report
  static async generateComplianceReport(): Promise<Record<string, any>> {
    try {
      const [
        totalUsers,
        consentRecords,
        gdprRequests,
        expiredSessions,
        retentionCompliance
      ] = await Promise.all([
        prisma.user.count(),
        prisma.gdprConsent.count(),
        prisma.gdprRequest.groupBy({
          by: ['requestType', 'status'],
          _count: true
        }),
        prisma.session.count({
          where: { expires: { lt: new Date() } }
        }),
        GDPRCompliance.checkDataRetention()
      ])

      return {
        report_date: new Date().toISOString(),
        data_subjects: totalUsers,
        consent_records: consentRecords,
        subject_rights_requests: gdprRequests,
        expired_sessions_to_cleanup: expiredSessions,
        compliance_status: 'COMPLIANT',
        data_controller: {
          name: 'W3 Sports Devil Ltd',
          dpo_contact: 'privacy@sportsdevil.co.uk',
          registration: 'ICO Registration Number: [TO BE ADDED]'
        },
        legal_basis_summary: {
          contract_processing: 'User accounts, order processing, customer service',
          consent_processing: 'Marketing communications, analytics, functional cookies',
          legitimate_interests: 'Security monitoring, fraud prevention, website analytics'
        }
      }
    } catch (error) {
      console.error('Failed to generate compliance report:', error)
      throw new Error('Failed to generate compliance report')
    }
  }
}

// Cookie consent management
export class CookieConsent {
  // Check if consent is required (new user or consent expired)
  static isConsentRequired(consent: GDPRConsent | null): boolean {
    if (!consent) return true
    
    // Check if consent is older than 1 year
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    return consent.lastUpdated < oneYearAgo
  }

  // Get allowed cookie categories based on consent
  static getAllowedCookies(consent: GDPRConsent): CookieCategory[] {
    const allowed: CookieCategory[] = [CookieCategory.ESSENTIAL] // Always allowed
    
    if (consent.performance) allowed.push(CookieCategory.PERFORMANCE)
    if (consent.functional) allowed.push(CookieCategory.FUNCTIONAL)
    if (consent.marketing) allowed.push(CookieCategory.MARKETING)
    if (consent.analytics) allowed.push(CookieCategory.ANALYTICS)
    
    return allowed
  }

  // Generate consent configuration for client-side
  static generateConsentConfig(consent: GDPRConsent | null) {
    return {
      required: CookieConsent.isConsentRequired(consent),
      current: consent ? {
        essential: consent.essential,
        performance: consent.performance,
        functional: consent.functional,
        marketing: consent.marketing,
        analytics: consent.analytics,
        version: consent.version,
        date: consent.lastUpdated
      } : null,
      categories: COOKIE_DEFINITIONS
    }
  }
}

export default {
  GDPRCompliance,
  CookieConsent,
  COOKIE_DEFINITIONS,
  DATA_RETENTION_PERIODS,
  CookieCategory,
  ProcessingPurpose,
  DataSubjectRight
}