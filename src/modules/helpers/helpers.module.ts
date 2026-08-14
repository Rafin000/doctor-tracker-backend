import { Global, Module } from '@nestjs/common'
import { JWTHelper } from './jwt.helper'
import { PasswordHelper } from './password.helper'

/**
 * Global module so JWTHelper / PasswordHelper can be injected anywhere
 * without re-importing (they are stateless, cross-cutting utilities).
 */
@Global()
@Module({
  providers: [JWTHelper, PasswordHelper],
  exports: [JWTHelper, PasswordHelper],
})
export class HelpersModule {}
