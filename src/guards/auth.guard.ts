import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator'
import { JWTHelper } from 'src/modules/helpers/jwt.helper'
import { UserService } from 'src/modules/user/user.service'
import { JwtPayload } from 'src/shared/types'

/**
 * Protects every route by default. Extracts the Bearer token, verifies it,
 * loads the user, and attaches it to the request as `verifiedUser`.
 * Routes annotated with @Public() are allowed through untouched.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtHelper: JWTHelper,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const token = this.jwtHelper.extractToken(request.headers)

    if (!token) {
      throw new UnauthorizedException('Authentication token is missing')
    }

    const payload = this.jwtHelper.verifyAccessToken(token) as JwtPayload
    if (!payload?.id) {
      throw new UnauthorizedException('Invalid authentication token')
    }

    const user = await this.userService.getAuthUser(payload.id)
    if (!user) {
      throw new UnauthorizedException('User no longer exists')
    }

    request.verifiedUser = user
    return true
  }
}
