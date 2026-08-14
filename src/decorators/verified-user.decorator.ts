import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { AuthUser } from 'src/modules/user/types'

/**
 * Injects the authenticated user that AuthGuard attached to the request.
 * Usage: `@VerifiedUser() user: AuthUser`
 */
export const VerifiedUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest()
    return request.verifiedUser
  },
)
