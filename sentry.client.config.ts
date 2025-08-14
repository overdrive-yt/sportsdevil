import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Session replay for debugging
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.01 : 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Enhanced error capture
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
    
    return event
  },
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: process.env.NODE_ENV === "production",
      blockAllMedia: process.env.NODE_ENV === "production",
    }),
    Sentry.browserTracingIntegration(),
  ],
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || "development",
  
  // Custom tags for better filtering
  initialScope: {
    tags: {
      component: "client",
      platform: "web",
    },
  },
})