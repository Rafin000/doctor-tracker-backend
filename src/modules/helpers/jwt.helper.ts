import { Injectable, UnauthorizedException } from '@nestjs/common'
import { sign, SignOptions, verify } from 'jsonwebtoken'
import env from 'src/config'
import { GenericObject } from 'src/shared/types'

/**
 * Central JWT helper (mirrors the Forward Flow JWTHelper convention).
 * All token creation/verification goes through here — HS512, env-driven.
 */
@Injectable()
export class JWTHelper {
  public extractToken(headers: GenericObject): string {
    const raw: string = headers?.authorization || ''
    return raw.replace(/Bearer\s+/gm, '').trim()
  }

  private generateToken(data: GenericObject, expiresIn: string): string {
    const options: SignOptions = {
      algorithm: 'HS512',
      expiresIn: expiresIn as SignOptions['expiresIn'],
    }
    return sign({ ...data }, env.jwt.secret, options)
  }

  public makeAccessToken(data: GenericObject): string {
    return this.generateToken(data, env.jwt.expiresIn)
  }

  public makeRefreshToken(data: GenericObject): string {
    return this.generateToken(data, env.jwt.refreshTokenExpiresIn)
  }

  public verifyAccessToken(token: string) {
    try {
      return verify(token, env.jwt.secret)
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
