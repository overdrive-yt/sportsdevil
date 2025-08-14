/**
 * Comprehensive monitoring and logging system for Sports Devil Cricket Equipment
 * Tracks errors, performance, user behavior, and business metrics
 */

export interface LogEvent {
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  category: string
  metadata?: Record<string, any>
  timestamp: Date
  userId?: string
  sessionId?: string
  userAgent?: string
  url?: string
}

export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count' | 'percent'
  category: 'page-load' | 'api-call' | 'user-interaction' | 'core-web-vital'
  timestamp: Date
  metadata?: Record<string, any>
}

export interface ErrorEvent {
  message: string
  stack?: string
  code?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'javascript' | 'api' | 'database' | 'payment' | 'auth'
  timestamp: Date
  userId?: string
  url?: string
  userAgent?: string
  metadata?: Record<string, any>
}

export interface BusinessEvent {
  event: string
  category: 'ecommerce' | 'user' | 'inventory' | 'marketing'
  properties: Record<string, any>
  timestamp: Date
  userId?: string
  sessionId?: string
}

/**
 * Logger class for structured logging
 */
export class Logger {
  private static instance: Logger
  private logs: LogEvent[] = []
  private maxLogs = 1000

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private createLogEvent(
    level: LogEvent['level'],
    message: string,
    category: string,
    metadata?: Record<string, any>
  ): LogEvent {
    return {
      level,
      message,
      category,
      metadata,
      timestamp: new Date(),
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    }
  }

  private getCurrentUserId(): string | undefined {
    // In a real application, get from auth context
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || undefined
    }
    return undefined
  }

  private getSessionId(): string | undefined {
    // Generate or retrieve session ID
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('sessionId')
      if (!sessionId) {
        sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2)
        sessionStorage.setItem('sessionId', sessionId)
      }
      return sessionId
    }
    return undefined
  }

  private addLog(logEvent: LogEvent) {
    this.logs.push(logEvent)
    
    // Keep only recent logs in memory
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      const { level, message, category, metadata } = logEvent
      console[level === 'warn' || level === 'error' ? level : 'log'](
        `[${level.toUpperCase()}] ${category}: ${message}`,
        metadata
      )
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(logEvent)
    }
  }

  private async sendToMonitoringService(logEvent: LogEvent) {
    try {
      // Send to your monitoring service (e.g., DataDog, New Relic, etc.)
      await fetch('/api/monitoring/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEvent),
      })
    } catch (error) {
      console.error('Failed to send log to monitoring service:', error)
    }
  }

  // Public logging methods
  info(message: string, category: string, metadata?: Record<string, any>) {
    this.addLog(this.createLogEvent('info', message, category, metadata))
  }

  warn(message: string, category: string, metadata?: Record<string, any>) {
    this.addLog(this.createLogEvent('warn', message, category, metadata))
  }

  error(message: string, category: string, metadata?: Record<string, any>) {
    this.addLog(this.createLogEvent('error', message, category, metadata))
  }

  debug(message: string, category: string, metadata?: Record<string, any>) {
    this.addLog(this.createLogEvent('debug', message, category, metadata))
  }

  // Get recent logs for debugging
  getRecentLogs(limit = 100): LogEvent[] {
    return this.logs.slice(-limit)
  }
}

/**
 * Performance monitoring for Sports Devil
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private logger = Logger.getInstance()

  private constructor() {
    this.initializeWebVitalsMonitoring()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  private initializeWebVitalsMonitoring() {
    if (typeof window === 'undefined') return

    try {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: 'LCP',
            value: entry.startTime,
            unit: 'ms',
            category: 'core-web-vital',
            timestamp: new Date(),
            metadata: { url: window.location.pathname }
          })
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay (FID)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: 'FID',
            value: (entry as any).processingStart - entry.startTime,
            unit: 'ms',
            category: 'core-web-vital',
            timestamp: new Date(),
            metadata: { url: window.location.pathname }
          })
        }
      }).observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        this.recordMetric({
          name: 'CLS',
          value: clsValue,
          unit: 'count',
          category: 'core-web-vital',
          timestamp: new Date(),
          metadata: { url: window.location.pathname }
        })
      }).observe({ entryTypes: ['layout-shift'] })

    } catch (error) {
      this.logger.warn('Failed to initialize Web Vitals monitoring', 'performance', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    
    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendMetricToService(metric)
    }

    // Log significant performance issues
    if (metric.category === 'core-web-vital') {
      let threshold = 0
      switch (metric.name) {
        case 'LCP':
          threshold = 2500 // 2.5s
          break
        case 'FID':
          threshold = 100 // 100ms
          break
        case 'CLS':
          threshold = 0.1
          break
      }

      if (metric.value > threshold) {
        this.logger.warn(
          `Poor ${metric.name} performance: ${metric.value}${metric.unit}`,
          'performance',
          { metric, threshold }
        )
      }
    }
  }

  private async sendMetricToService(metric: PerformanceMetric) {
    try {
      await fetch('/api/monitoring/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      })
    } catch (error) {
      console.error('Failed to send metric to monitoring service:', error)
    }
  }

  // Measure API call performance
  async measureApiCall<T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> {
    const startTime = performance.now()
    
    try {
      const result = await apiCall()
      const duration = performance.now() - startTime
      
      this.recordMetric({
        name: 'api-call-success',
        value: duration,
        unit: 'ms',
        category: 'api-call',
        timestamp: new Date(),
        metadata: { endpoint, status: 'success' }
      })
      
      // Log slow API calls
      if (duration > 1000) {
        this.logger.warn(`Slow API call: ${endpoint}`, 'performance', { duration, endpoint })
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      this.recordMetric({
        name: 'api-call-error',
        value: duration,
        unit: 'ms',
        category: 'api-call',
        timestamp: new Date(),
        metadata: { endpoint, status: 'error', error: error instanceof Error ? error.message : String(error) }
      })
      
      throw error
    }
  }

  // Measure page load performance
  measurePageLoad(pageName: string) {
    if (typeof window === 'undefined') return

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      const metrics = [
        {
          name: 'page-load-total',
          value: navigation.loadEventEnd - navigation.fetchStart,
          unit: 'ms' as const,
          category: 'page-load' as const,
          timestamp: new Date(),
          metadata: { page: pageName }
        },
        {
          name: 'dom-content-loaded',
          value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          unit: 'ms' as const,
          category: 'page-load' as const,
          timestamp: new Date(),
          metadata: { page: pageName }
        },
        {
          name: 'ttfb',
          value: navigation.responseStart - navigation.requestStart,
          unit: 'ms' as const,
          category: 'page-load' as const,
          timestamp: new Date(),
          metadata: { page: pageName }
        }
      ]

      metrics.forEach(metric => this.recordMetric(metric))
    })
  }

  getMetrics(category?: PerformanceMetric['category']): PerformanceMetric[] {
    return category 
      ? this.metrics.filter(m => m.category === category)
      : this.metrics
  }
}

/**
 * Error tracking for Sports Devil
 */
export class ErrorTracker {
  private static instance: ErrorTracker
  private logger = Logger.getInstance()

  private constructor() {
    this.initializeGlobalErrorHandling()
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker()
    }
    return ErrorTracker.instance
  }

  private initializeGlobalErrorHandling() {
    if (typeof window === 'undefined') return

    // Catch unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        severity: 'high',
        category: 'javascript',
        timestamp: new Date(),
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      })
    })

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        severity: 'high',
        category: 'javascript',
        timestamp: new Date(),
        metadata: {
          reason: event.reason,
        }
      })
    })
  }

  trackError(error: ErrorEvent) {
    this.logger.error(error.message, error.category, {
      stack: error.stack,
      severity: error.severity,
      ...error.metadata
    })

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToService(error)
    }
  }

  private async sendErrorToService(error: ErrorEvent) {
    try {
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      })
    } catch (err) {
      console.error('Failed to send error to monitoring service:', err)
    }
  }

  // Track specific error types
  trackApiError(endpoint: string, error: Error, severity: ErrorEvent['severity'] = 'medium') {
    this.trackError({
      message: `API Error: ${error.message}`,
      stack: error.stack,
      severity,
      category: 'api',
      timestamp: new Date(),
      metadata: { endpoint }
    })
  }

  trackPaymentError(error: Error, metadata?: Record<string, any>) {
    this.trackError({
      message: `Payment Error: ${error.message}`,
      stack: error.stack,
      severity: 'critical',
      category: 'payment',
      timestamp: new Date(),
      metadata
    })
  }

  trackAuthError(error: Error, metadata?: Record<string, any>) {
    this.trackError({
      message: `Auth Error: ${error.message}`,
      stack: error.stack,
      severity: 'high',
      category: 'auth',
      timestamp: new Date(),
      metadata
    })
  }
}

/**
 * Business events tracking for Sports Devil
 */
export class BusinessTracker {
  private static instance: BusinessTracker
  private logger = Logger.getInstance()

  private constructor() {}

  static getInstance(): BusinessTracker {
    if (!BusinessTracker.instance) {
      BusinessTracker.instance = new BusinessTracker()
    }
    return BusinessTracker.instance
  }

  trackEvent(event: BusinessEvent) {
    this.logger.info(
      `Business Event: ${event.event}`,
      event.category,
      { properties: event.properties }
    )

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendEventToService(event)
    }
  }

  private async sendEventToService(event: BusinessEvent) {
    try {
      await fetch('/api/monitoring/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.error('Failed to send event to analytics service:', error)
    }
  }

  // Cricket equipment specific events
  trackProductView(productId: string, productName: string, category: string) {
    this.trackEvent({
      event: 'product_viewed',
      category: 'ecommerce',
      properties: { productId, productName, category },
      timestamp: new Date(),
    })
  }

  trackAddToCart(productId: string, productName: string, quantity: number, price: number) {
    this.trackEvent({
      event: 'add_to_cart',
      category: 'ecommerce',
      properties: { productId, productName, quantity, price },
      timestamp: new Date(),
    })
  }

  trackPurchase(orderId: string, total: number, items: any[]) {
    this.trackEvent({
      event: 'purchase_completed',
      category: 'ecommerce',
      properties: { orderId, total, itemCount: items.length, items },
      timestamp: new Date(),
    })
  }

  trackInventoryAlert(productId: string, productName: string, stockLevel: number) {
    this.trackEvent({
      event: 'low_stock_alert',
      category: 'inventory',
      properties: { productId, productName, stockLevel },
      timestamp: new Date(),
    })
  }

  trackUserRegistration(method: string) {
    this.trackEvent({
      event: 'user_registered',
      category: 'user',
      properties: { method },
      timestamp: new Date(),
    })
  }

  trackLogin(method: string) {
    this.trackEvent({
      event: 'user_login',
      category: 'user',
      properties: { method },
      timestamp: new Date(),
    })
  }
}

/**
 * Initialize monitoring for Sports Devil
 */
export const initializeMonitoring = () => {
  const logger = Logger.getInstance()
  const performanceMonitor = PerformanceMonitor.getInstance()
  const errorTracker = ErrorTracker.getInstance()
  const businessTracker = BusinessTracker.getInstance()

  logger.info('Monitoring system initialized', 'system', {
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })

  return {
    logger,
    performanceMonitor,
    errorTracker,
    businessTracker,
  }
}

// Export singleton instances
export const logger = Logger.getInstance()
export const performanceMonitor = PerformanceMonitor.getInstance()
export const errorTracker = ErrorTracker.getInstance()
export const businessTracker = BusinessTracker.getInstance()

export default {
  Logger,
  PerformanceMonitor,
  ErrorTracker,
  BusinessTracker,
  initializeMonitoring,
  logger,
  performanceMonitor,
  errorTracker,
  businessTracker,
}