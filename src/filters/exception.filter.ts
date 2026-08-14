import {
  ArgumentsHost,
  Catch,
  ExceptionFilter as NestExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Response } from 'express'

/**
 * Global exception filter — turns every thrown error into the standard
 * failure envelope: { success: false, statusCode, message, errorMessages }.
 * Translates Mongoose-specific errors (duplicate key, validation, bad id)
 * into meaningful HTTP responses.
 */
@Catch()
export class ExceptionFilter implements NestExceptionFilter {
  private readonly logger = new Logger(ExceptionFilter.name)

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Internal Server Error'
    let errorMessages: string[] = []

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus()
      const res = exception.getResponse()
      if (typeof res === 'string') {
        message = res
        errorMessages = [res]
      } else if (typeof res === 'object' && res !== null) {
        const payload = res as { message?: string | string[]; error?: string }
        if (Array.isArray(payload.message)) {
          // class-validator returns an array of constraint messages
          message = payload.error || 'Validation failed'
          errorMessages = payload.message
        } else {
          message = payload.message || exception.message
          errorMessages = [message]
        }
      }
    } else if (exception?.code === 11000) {
      // Mongo duplicate key
      statusCode = HttpStatus.CONFLICT
      const field = Object.keys(exception.keyValue || {})[0] || 'field'
      message = `A record with this ${field} already exists`
      errorMessages = [message]
    } else if (exception?.name === 'ValidationError') {
      statusCode = HttpStatus.BAD_REQUEST
      message = 'Validation failed'
      errorMessages = Object.values(exception.errors || {}).map(
        (e: any) => e.message,
      )
    } else if (exception?.name === 'CastError') {
      statusCode = HttpStatus.BAD_REQUEST
      message = `Invalid value for '${exception.path}'`
      errorMessages = [message]
    } else if (exception instanceof Error) {
      message = exception.message
      errorMessages = [message]
    }

    if (statusCode >= 500) {
      this.logger.error(
        message,
        exception instanceof Error ? exception.stack : undefined,
      )
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errorMessages,
    })
  }
}
