import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { SuccessResponse } from 'src/shared/response'

/**
 * Wraps every successful controller return value in the SuccessResponse
 * envelope. Controllers can also return a SuccessResponse directly (to set a
 * custom message/status) or a { data, meta } object for paginated results.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((content: any) => {
        if (content instanceof SuccessResponse) {
          return content
        }

        if (
          content &&
          typeof content === 'object' &&
          'data' in content &&
          'meta' in content
        ) {
          return new SuccessResponse({
            message: 'Successful',
            data: content.data ?? null,
            meta: content.meta ?? null,
          })
        }

        return new SuccessResponse({
          message: 'Successful',
          data: content ?? null,
        })
      }),
    )
  }
}
