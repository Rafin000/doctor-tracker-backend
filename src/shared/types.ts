export type GenericObject = Record<string, any>

export interface JwtPayload {
  id: string
  email: string
  iat?: number
  exp?: number
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}
