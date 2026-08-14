import { PaginationMeta } from './types'

interface SuccessResponsePayload {
  message?: string
  data?: unknown
  meta?: PaginationMeta | null
}

/**
 * Standard success envelope used across the API.
 * The ResponseInterceptor wraps every controller return value in this shape,
 * so responses are always: { success, statusCode, message, data, meta }.
 */
export class SuccessResponse {
  public readonly success = true
  public readonly statusCode: number
  public readonly message: string
  public readonly data: unknown
  public readonly meta?: PaginationMeta | null

  constructor(payload: SuccessResponsePayload, statusCode = 200) {
    this.statusCode = statusCode
    this.message = payload.message || 'Successful'
    this.data = payload.data ?? null
    if (payload.meta !== undefined) {
      this.meta = payload.meta
    }
  }
}
