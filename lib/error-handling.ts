/**
 * Comprehensive Error Handling and Monitoring System
 * Integrates with Sentry for production error tracking
 */

import * as Sentry from "@sentry/nextjs"
import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

// Error types for better categorization
export enum ErrorType {
  VALIDATION = "VALIDATION",
  DATABASE = "DATABASE",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  RATE_LIMIT = "RATE_LIMIT",
  EXTERNAL_API = "EXTERNAL_API",
  INTERNAL = "INTERNAL",
  SECURITY = "SECURITY",
}

// Error severity levels
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Enhanced error class with context
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly severity: ErrorSeverity
  public readonly statusCode: number
  public readonly context?: Record<string, any>
  public readonly isOperational: boolean

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    statusCode: number = 500,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, any>,
    isOperational: boolean = true
  ) {
    super(message)
    
    this.type = type
    this.severity = severity
    this.statusCode = statusCode
    this.context = context
    this.isOperational = isOperational
    this.name = this.constructor.name

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}

// Specific error classes
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorType.VALIDATION, 400, ErrorSeverity.LOW, context)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required", context?: Record<string, any>) {
    super(message, ErrorType.AUTHENTICATION, 401, ErrorSeverity.MEDIUM, context)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions", context?: Record<string, any>) {
    super(message, ErrorType.AUTHORIZATION, 403, ErrorSeverity.MEDIUM, context)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource", context?: Record<string, any>) {
    super(`${resource} not found`, ErrorType.INTERNAL, 404, ErrorSeverity.LOW, context)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded", context?: Record<string, any>) {
    super(message, ErrorType.RATE_LIMIT, 429, ErrorSeverity.MEDIUM, context)
  }
}

export class SecurityError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorType.SECURITY, 403, ErrorSeverity.HIGH, context)
  }
}

// Error parsing and enhancement
export function parseError(error: unknown, context?: Record<string, any>): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return new ValidationError("Validation failed", {
      ...context,
      validationErrors: error.errors,
    })
  }

  // Prisma database errors
  if (error instanceof PrismaClientKnownRequestError) {
    const dbContext = {
      ...context,
      prismaCode: error.code,
      prismaMessage: error.message,
    }

    switch (error.code) {
      case "P2002":
        return new ValidationError("Unique constraint violation", dbContext)
      case "P2025":
        return new NotFoundError("Database record", dbContext)
      case "P2003":
        return new ValidationError("Foreign key constraint violation", dbContext)
      default:
        return new AppError("Database operation failed", ErrorType.DATABASE, 500, ErrorSeverity.HIGH, dbContext)
    }
  }

  // Standard Error
  if (error instanceof Error) {
    // Check for specific error messages to categorize
    const message = error.message.toLowerCase()
    
    if (message.includes("unauthorized") || message.includes("authentication")) {
      return new AuthenticationError(error.message, context)
    }
    
    if (message.includes("forbidden") || message.includes("permission")) {
      return new AuthorizationError(error.message, context)
    }
    
    if (message.includes("not found")) {
      return new NotFoundError(error.message, context)
    }

    return new AppError(error.message, ErrorType.INTERNAL, 500, ErrorSeverity.MEDIUM, {
      ...context,
      originalStack: error.stack,
    })
  }

  // Unknown error
  return new AppError(
    typeof error === "string" ? error : "An unknown error occurred",
    ErrorType.INTERNAL,
    500,
    ErrorSeverity.MEDIUM,
    context
  )
}

// Enhanced error logging with Sentry integration
export async function logError(
  error: AppError | Error,
  request?: NextRequest,
  additionalContext?: Record<string, any>
) {
  const parsedError = error instanceof AppError ? error : parseError(error)
  
  // Prepare context for logging
  const logContext = {
    type: parsedError.type,
    severity: parsedError.severity,
    statusCode: parsedError.statusCode,
    isOperational: parsedError.isOperational,
    ...parsedError.context,
    ...additionalContext,
  }

  // Add request context if available
  if (request) {
    (logContext as any).request = {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get("user-agent"),
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    }
  }

  // Console logging for development
  if (process.env.NODE_ENV === "development") {
    console.error("🚨 Application Error:", {
      message: parsedError.message,
      stack: parsedError.stack,
      context: logContext,
    })
  }

  // Sentry logging for production and critical errors
  if (process.env.NODE_ENV === "production" || parsedError.severity === ErrorSeverity.CRITICAL) {
    Sentry.withScope((scope) => {
      // Set error level based on severity
      const sentryLevel = {
        [ErrorSeverity.LOW]: "info" as Sentry.SeverityLevel,
        [ErrorSeverity.MEDIUM]: "warning" as Sentry.SeverityLevel, 
        [ErrorSeverity.HIGH]: "error" as Sentry.SeverityLevel,
        [ErrorSeverity.CRITICAL]: "fatal" as Sentry.SeverityLevel,
      }[parsedError.severity]

      scope.setLevel(sentryLevel)
      
      // Add error context
      scope.setTag("errorType", parsedError.type)
      scope.setTag("isOperational", parsedError.isOperational.toString())
      scope.setContext("errorDetails", logContext)

      // Add request fingerprinting for deduplication
      if (request) {
        scope.setFingerprint([
          parsedError.message,
          request.method,
          new URL(request.url).pathname,
        ])
      }

      // Capture the exception
      Sentry.captureException(parsedError)
    })
  }
}

// API error response handler
export async function handleApiError(
  error: unknown,
  request?: NextRequest,
  additionalContext?: Record<string, any>
): Promise<NextResponse> {
  const parsedError = parseError(error, additionalContext)
  
  // Log the error
  await logError(parsedError, request, additionalContext)
  
  // Prepare response
  const response = {
    success: false,
    error: {
      message: parsedError.message,
      type: parsedError.type,
      ...(process.env.NODE_ENV === "development" && {
        stack: parsedError.stack,
        context: parsedError.context,
      }),
    },
  }

  return NextResponse.json(response, { status: parsedError.statusCode })
}

// Async error handler wrapper for API routes
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      const request = args.find(arg => arg instanceof NextRequest) as NextRequest | undefined
      return handleApiError(error, request, {
        handler: handler.name,
      })
    }
  }
}

// Performance monitoring wrapper
export function withPerformanceMonitoring<T extends any[], R>(
  operation: string,
  handler: (...args: T) => Promise<R>
) {
  return Sentry.startSpan(
    {
      name: operation,
      op: "api.handler",
    },
    async (span) => {
      return await handler(...[] as any as T)
    }
  )
}

// Database operation monitoring
export function withDatabaseMonitoring<T extends any[], R>(
  operation: string,
  table: string,
  handler: (...args: T) => Promise<R>
) {
  return Sentry.startSpan(
    {
      name: `${operation}.${table}`,
      op: "db.query",
    },
    async (span) => {
      return await handler(...[] as any as T)
    }
  )
}

// Health check endpoint helper
export function createHealthCheck() {
  return async function healthCheck() {
    try {
      // Basic health checks
      const health = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: process.env.NEXT_PUBLIC_APP_VERSION,
      }

      return NextResponse.json(health)
    } catch (error) {
      const healthError = parseError(error)
      await logError(healthError)
      
      return NextResponse.json(
        {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          error: healthError.message,
        },
        { status: 503 }
      )
    }
  }
}

// Export utility functions
export {
  withErrorHandling as apiHandler,
  withPerformanceMonitoring as performanceMonitor,
  withDatabaseMonitoring as dbMonitor,
}