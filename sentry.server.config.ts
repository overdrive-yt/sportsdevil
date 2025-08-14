import * as Sentry from "@sentry/nextjs"
import { getCurrentUser } from "@/lib/rbac"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  
  // Performance monitoring (lower sample rate for production)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,
  
  // Enhanced error capture with user context
  beforeSend(event) {
    // Filter out sensitive information
    if (event.request?.data) {
      const data = event.request.data as any
      if (typeof data === 'object' && data !== null) {
        // Remove sensitive fields
        const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization']
        sensitiveFields.forEach(field => {
          if (field in data) {
            (data as any)[field] = '[Filtered]'
          }
        })
      }
    }
    
    // Add server-specific context
    if (event.tags) {
      (event.tags as any).server = "nextjs"
    }
    
    return event
  },
  
  // Custom integrations
  integrations: [
    // Database monitoring
    Sentry.prismaIntegration(),
    
    // HTTP request monitoring
    Sentry.httpIntegration({
      ignoreIncomingRequests: (url: string) => {
        // Ignore health checks and static files
        return url.includes('/health') || 
               url.includes('/_next/static') ||
               url.includes('/favicon.ico')
      },
      ignoreOutgoingRequests: (url: string) => {
        // Ignore internal Next.js requests
        return url.includes('/_next/')
      }
    }),
  ],
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || "development",
  
  // Custom tags for better filtering
  initialScope: {
    tags: {
      component: "server",
      platform: "nodejs",
    },
  },
})

// Enhanced error reporting with user context
export async function captureErrorWithContext(error: Error, context?: Record<string, any>, request?: Request) {
  try {
    // Get current user if available
    let user = null
    if (request) {
      try {
        // This would need to be adapted based on your auth implementation
        user = await getCurrentUser()
      } catch {}
    }
    
    Sentry.withScope((scope) => {
      // Add user context
      if (user) {
        scope.setUser({
          id: user.id,
          email: user.email,
          role: user.role,
        })
      }
      
      // Add custom context
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setTag(key, String(value))
        })
      }
      
      // Add request context
      if (request) {
        scope.setTag("method", request.method)
        scope.setTag("url", request.url)
      }
      
      // Capture the error
      Sentry.captureException(error)
    })
  } catch (sentryError) {
    // Fallback to console logging if Sentry fails
    console.error("Sentry error capture failed:", sentryError)
    console.error("Original error:", error)
  }
}

// Performance monitoring for API routes
export function withSentryPerformance<T extends (...args: any[]) => any>(
  fn: T,
  operationName: string
): T {
  return ((...args: Parameters<T>) => {
    return Sentry.startSpan(
      {
        name: operationName,
        op: "api.route",
      },
      () => fn(...args)
    )
  }) as T
}

// Database operation monitoring
export function withDatabaseMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  operation: string,
  table?: string
): T {
  return ((...args: Parameters<T>) => {
    return Sentry.startSpan(
      {
        name: `db.${operation}${table ? `.${table}` : ''}`,
        op: "db.query",
      },
      () => fn(...args)
    )
  }) as T
}