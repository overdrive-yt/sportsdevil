import { NextRequest } from 'next/server'
import { UserService } from '../../lib/services/user.service'
import { createSuccessResponse } from '../../lib/api/responses'
import { handleApiError } from '../../lib/api/errors'
import { requireAuth, validateRequestBody } from '../../lib/api/middleware'
import { changePasswordSchema } from '../../lib/api/validation'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const data = await validateRequestBody(request, changePasswordSchema)
    
    const result = await UserService.changePassword(user.id, {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
    
    return createSuccessResponse(result, 'Password changed successfully')
  } catch (error) {
    return handleApiError(error)
  }
}