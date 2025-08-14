export interface PaginationOptions {
  page: number
  limit: number
}

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export function calculatePagination(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit)
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

export function getPaginationSkip(page: number, limit: number): number {
  return (page - 1) * limit
}

export function validatePagination(page?: number, limit?: number) {
  const validatedPage = Math.max(1, page || 1)
  const validatedLimit = Math.min(100, Math.max(1, limit || 10))
  
  return {
    page: validatedPage,
    limit: validatedLimit,
    skip: getPaginationSkip(validatedPage, validatedLimit),
  }
}