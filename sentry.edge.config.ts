import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  
  // Performance monitoring (minimal for edge)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.01 : 0.5,
  
  // Edge-specific configuration
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
    
    // Add edge runtime context
    if (event.tags) {
      (event.tags as any).runtime = "edge"
    }
    
    return event
  },
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || "development",
  
  // Custom tags for better filtering
  initialScope: {
    tags: {
      component: "edge",
      platform: "edge-runtime",
    },
  },
})