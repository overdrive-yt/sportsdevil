import { NextRequest } from 'next/server'
import { UserService } from '../../lib/services/user.service'
import { createSuccessResponse } from '../../lib/api/responses'
import { handleApiError } from '../../lib/api/errors'
import { requireAuth, validateRequestBody, checkRateLimit, getRateLimitIdentifier } from '../../lib/api/middleware'
import { userProfileSchema } from '../../lib/api/validation'

export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 100, 60000)) {
      return handleApiError(new Error('Too many requests'))
    }

    const user = await requireAuth(request)
    const profile = await UserService.getUserProfile(user.id)
    
    return createSuccessResponse(profile, 'User profile retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const data = await validateRequestBody(request, userProfileSchema)
    
    const updatedProfile = await UserService.updateUserProfile(user.id, data)
    
    return createSuccessResponse(updatedProfile, 'Profile updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}