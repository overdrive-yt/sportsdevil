import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200,
  pagination?: PaginationInfo
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  }

  if (pagination) {
    const totalPages = Math.ceil(pagination.total / pagination.limit)
    response.pagination = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    }
  }

  return NextResponse.json(response, { status })
}

export function createCreatedResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message: message || 'Resource created successfully',
    },
    { status: 201 }
  )
}

export function createNoContentResponse(message?: string): NextResponse {
  return NextResponse.json(
    {
      success: true,
      message: message || 'Operation completed successfully',
    },
    { status: 200 }
  )
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationInfo,
  message?: string
): NextResponse<ApiResponse<T[]>> {
  return createSuccessResponse(data, message, 200, pagination)
}

export function createErrorResponse(
  message: string,
  status: number = 400,
  errors?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  )
}

