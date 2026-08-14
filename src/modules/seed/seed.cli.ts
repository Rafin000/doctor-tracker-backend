import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { validateEnv } from 'src/config'
import { AppModule } from 'src/app.module'
import { SeedService } from './seed.service'

/**
 * Standalone seeder: `npm run seed`.
 * Boots a Nest application context (no HTTP server), runs the seeder, exits.
 */
async function bootstrap() {
  const logger = new Logger('Seed')
  validateEnv()
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  })
  try {
    await app.get(SeedService).run()
    logger.log('Seeding complete')
    await app.close()
    process.exit(0)
  } catch (error) {
    logger.error('Seeding failed', error as any)
    await app.close()
    process.exit(1)
  }
}

bootstrap()
