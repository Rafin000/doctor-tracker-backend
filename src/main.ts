import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import env, { validateEnv } from './config'
import { AppModule } from './app.module'

async function bootstrap() {
  // Fail fast on missing/insecure config before touching the DB or opening a port.
  validateEnv()

  const app = await NestFactory.create(AppModule)

  app.use(helmet())
  app.enableCors({
    origin: env.app.clientOrigin,
    credentials: true,
  })

  // All routes live under /api.
  app.setGlobalPrefix('api')

  // Global validation: strips unknown props, coerces types, rejects extras.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  await app.listen(env.app.port, '0.0.0.0')
  // eslint-disable-next-line no-console
  console.log(`Doctor Tracker API running on port ${env.app.port}`)
}

bootstrap()
