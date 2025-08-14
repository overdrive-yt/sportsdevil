import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Enhanced health check with database connectivity
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Basic application health
    const appHealth = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION,
      uptime: process.uptime(),
      node_version: process.version,
    }

    // Database connectivity check
    let dbHealth = null
    try {
      await prisma.$queryRaw`SELECT 1`
      const productCount = await prisma.product.count()
      const userCount = await prisma.user.count()
      
      dbHealth = {
        status: "healthy",
        connection: "ok",
        products: productCount,
        users: userCount,
      }
    } catch (dbError) {
      dbHealth = {
        status: "unhealthy",
        connection: "failed",
        error: dbError instanceof Error ? dbError.message : "Unknown database error",
      }
    }

    // Memory usage
    const memoryUsage = process.memoryUsage()
    const memoryHealth = {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024), // MB
    }

    // Overall system health
    const responseTime = Date.now() - startTime
    const isHealthy = dbHealth?.status === "healthy"

    const response = {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      response_time_ms: responseTime,
      services: {
        application: appHealth,
        database: dbHealth,
        memory: memoryHealth,
      },
      checks: {
        database_connectivity: dbHealth?.status === "healthy",
        memory_usage: memoryHealth.heapUsed < 512, // Alert if > 512MB
        response_time: responseTime < 1000, // Alert if > 1s
      }
    }

    return NextResponse.json(response, { 
      status: isHealthy ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      response_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Health check failed",
    }, { 
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })
  }
}

// Simple liveness probe (for basic monitoring)
export async function HEAD() {
  try {
    return new Response(null, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })
  } catch {
    return new Response(null, { status: 503 })
  }
}