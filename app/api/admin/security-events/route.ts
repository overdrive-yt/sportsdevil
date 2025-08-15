import { NextRequest } from 'next/server'
import { getSecurityEvents } from '../../lib/api/middleware'
import { requireSuperAdmin, checkRateLimit, getRateLimitIdentifier } from '../../lib/api/middleware'
import { createSuccessResponse } from '../../lib/api/responses'
import { handleApiError } from '../../lib/api/errors'

export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 50, 60000, request)) {
      return handleApiError(new Error('Rate limit exceeded'))
    }

    await requireSuperAdmin(request)
    
    const searchParams = new URL(request.url).searchParams
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const eventType = searchParams.get('eventType')
    
    let events = getSecurityEvents()
    
    // Filter by event type if specified
    if (eventType) {
      events = events.filter(event => event.event === eventType)
    }
    
    // Sort by timestamp (newest first) and limit results
    events = events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, Math.min(limit, 1000))
    
    const eventCounts = events.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return createSuccessResponse({
      events,
      summary: {
        total: events.length,
        eventCounts,
        lastEvent: events[0]?.timestamp,
      }
    }, 'Security events retrieved successfully')
    
  } catch (error) {
    return handleApiError(error)
  }
}