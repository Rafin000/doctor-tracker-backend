import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import env, { validateEnv } from './config'
import { AppModule } from './app.module'

async function bootstrap() {
  // Fail fast on missing/insecure config before touching the DB or opening a port.
  validateEnv()

  const app = await NestFactory.create(AppModule)

  // CSP is disabled because the app is served over plain HTTP (no TLS): the
  // default `upgrade-insecure-requests` directive would force asset loads to
  // HTTPS and break the Swagger UI page. Other helmet protections stay on.
  // Behind HTTPS, drop this option to re-enable the default CSP.
  app.use(helmet({ contentSecurityPolicy: false }))
  app.enableCors({
    origin: env.app.clientOrigin,
    credentials: true,
  })

  // All routes live under /api.
  app.setGlobalPrefix('api')

  // Interactive API docs (Swagger/OpenAPI) at /api/docs.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Doctor Tracker API')
    .setDescription(
      'REST API for the Doctor Tracker admin portal — auth, doctors, patients and dashboard analytics.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  })

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
