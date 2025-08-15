import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { z } from 'zod'

// Validation schema for performance metrics
const metricSchema = z.object({
  name: z.string(),
  value: z.number(),
  unit: z.enum(['ms', 'bytes', 'count', 'percent']),
  category: z.enum(['page-load', 'api-call', 'user-interaction', 'core-web-vital']),
  timestamp: z.string().transform(str => new Date(str)),
  metadata: z.record(z.any()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metric = metricSchema.parse(body)

    // Get session information
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Enhanced metric data with server-side information
    const enhancedMetric = {
      ...metric,
      userId,
      serverTimestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[METRIC] ${metric.name}: ${metric.value}${metric.unit}`, {
        category: metric.category,
        metadata: metric.metadata,
        timestamp: metric.timestamp,
      })
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      await sendToMonitoringService(enhancedMetric)
    }

    // Alert on performance issues
    await checkPerformanceThresholds(metric)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to process metric:', error)
    return NextResponse.json(
      { error: 'Failed to process metric' },
      { status: 400 }
    )
  }
}

async function sendToMonitoringService(metric: any) {
  // Example: Send to DataDog StatsD
  // const StatsD = require('node-statsd')
  // const statsd = new StatsD()
  // statsd.histogram(metric.name, metric.value, [`category:${metric.category}`])

  // Example: Send to New Relic
  // await fetch('https://metric-api.newrelic.com/metric/v1', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Api-Key': process.env.NEW_RELIC_API_KEY
  //   },
  //   body: JSON.stringify([{
  //     metrics: [{
  //       name: metric.name,
  //       type: 'gauge',
  //       value: metric.value,
  //       timestamp: Date.now(),
  //       attributes: {
  //         category: metric.category,
  //         unit: metric.unit,
  //         service: 'sports-devil-cricket',
  //         ...metric.metadata
  //       }
  //     }]
  //   }])
  // })

  // For now, just log to console
  console.log('Sending metric to monitoring service:', metric)
}

async function checkPerformanceThresholds(metric: any) {
  const thresholds = {
    'LCP': 2500, // Largest Contentful Paint - 2.5s
    'FID': 100,  // First Input Delay - 100ms
    'CLS': 0.1,  // Cumulative Layout Shift - 0.1
    'page-load-total': 3000, // Total page load - 3s
    'api-call-success': 1000, // API calls - 1s
    'ttfb': 800, // Time to First Byte - 800ms
  }

  const threshold = thresholds[metric.name as keyof typeof thresholds]
  
  if (threshold && metric.value > threshold) {
    // Send alert
    await sendPerformanceAlert(metric, threshold)
  }
}

async function sendPerformanceAlert(metric: any, threshold: number) {
  const alertData = {
    type: 'performance_threshold_exceeded',
    metric: metric.name,
    value: metric.value,
    threshold,
    url: metric.metadata?.url,
    timestamp: metric.timestamp,
    severity: metric.value > threshold * 2 ? 'high' : 'medium'
  }

  console.warn('Performance threshold exceeded:', alertData)

  // In production, send to alerting system
  // await fetch('/api/alerts', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(alertData)
  // })
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow admin users to view metrics
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const name = searchParams.get('name')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const limit = parseInt(searchParams.get('limit') || '100')

    // In a real implementation, fetch from your monitoring service or database
    const mockMetrics = [
      {
        id: '1',
        name: 'LCP',
        value: 1800,
        unit: 'ms',
        category: 'core-web-vital',
        timestamp: new Date().toISOString(),
        metadata: { url: '/products/cricket-bat-professional' }
      },
      {
        id: '2',
        name: 'api-call-success',
        value: 450,
        unit: 'ms',
        category: 'api-call',
        timestamp: new Date().toISOString(),
        metadata: { endpoint: '/api/products', status: 'success' }
      },
      {
        id: '3',
        name: 'page-load-total',
        value: 2100,
        unit: 'ms',
        category: 'page-load',
        timestamp: new Date().toISOString(),
        metadata: { page: 'homepage' }
      }
    ]

    // Filter metrics based on query parameters
    let filteredMetrics = mockMetrics
    if (category) {
      filteredMetrics = filteredMetrics.filter(metric => metric.category === category)
    }
    if (name) {
      filteredMetrics = filteredMetrics.filter(metric => metric.name === name)
    }

    // Calculate aggregated statistics
    const stats = calculateMetricStats(filteredMetrics)

    return NextResponse.json({
      metrics: filteredMetrics.slice(0, limit),
      total: filteredMetrics.length,
      stats,
    })
  } catch (error) {
    console.error('Failed to fetch metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

function calculateMetricStats(metrics: any[]) {
  if (metrics.length === 0) return {}

  const groupedByName = metrics.reduce((acc, metric) => {
    if (!acc[metric.name]) {
      acc[metric.name] = []
    }
    acc[metric.name].push(metric.value)
    return acc
  }, {} as Record<string, number[]>)

  const stats: Record<string, any> = {}

  Object.entries(groupedByName).forEach(([name, values]) => {
    const numericValues = values as number[]
    const sortedValues = numericValues.sort((a, b) => a - b)
    const sum = numericValues.reduce((a, b) => a + b, 0)
    
    stats[name] = {
      count: numericValues.length,
      min: Math.min(...numericValues),
      max: Math.max(...numericValues),
      avg: sum / numericValues.length,
      median: sortedValues[Math.floor(sortedValues.length / 2)],
      p95: sortedValues[Math.floor(sortedValues.length * 0.95)],
      p99: sortedValues[Math.floor(sortedValues.length * 0.99)],
    }
  })

  return stats
}