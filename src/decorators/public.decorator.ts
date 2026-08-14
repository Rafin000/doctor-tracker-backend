import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic'

/**
 * Marks a route as public so the globally-registered AuthGuard skips it.
 * Usage: `@Public()` on login / health endpoints.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
