import * as dotenv from 'dotenv'

dotenv.config()

const isProd = (process.env.NODE_ENV || 'development') === 'production'

/**
 * Central, typed configuration object.
 * Mirrors the Forward Flow convention of `import env from 'src/config'`
 * so the rest of the app never touches `process.env` directly.
 */
const env = {
  app: {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    isProd,
    clientOrigin: (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
  db: {
    uri: process.env.MONGO_URI || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  seed: {
    adminName: process.env.ADMIN_NAME || 'Admin',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@doctortracker.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'Admin@1234',
  },
}

/**
 * Fail-fast environment validation. Called once at startup (main.ts / seed).
 * In production, missing or insecure secrets abort the boot; in development
 * we warn but allow a throwaway fallback so local setup stays frictionless.
 */
export function validateEnv(): void {
  const errors: string[] = []
  const warnings: string[] = []

  if (!env.db.uri) {
    errors.push('MONGO_URI is required')
  }

  if (!env.jwt.secret) {
    if (isProd) errors.push('JWT_SECRET is required in production')
    else warnings.push('JWT_SECRET is not set — using an insecure dev fallback')
  } else if (env.jwt.secret.length < 32 && isProd) {
    errors.push('JWT_SECRET must be at least 32 characters in production')
  }

  if (isProd && env.seed.adminPassword === 'Admin@1234') {
    warnings.push('ADMIN_PASSWORD is still the default — change it before seeding prod')
  }

  // In dev, backfill an ephemeral secret so the app can still boot.
  if (!env.jwt.secret) {
    env.jwt.secret = 'insecure_dev_secret_do_not_use_in_production'
  }

  for (const w of warnings) {
    // eslint-disable-next-line no-console
    console.warn(`[config] WARNING: ${w}`)
  }
  if (errors.length) {
    throw new Error(
      `Invalid environment configuration:\n  - ${errors.join('\n  - ')}\n` +
        'Copy .env.example to .env and fill in the required values.',
    )
  }
}

export default env
