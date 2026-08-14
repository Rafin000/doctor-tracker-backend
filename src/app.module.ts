import { Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ExceptionFilter } from './filters'
import { AuthGuard } from './guards'
import { ResponseInterceptor } from './interceptors'
import { AuthModule } from './modules/auth/auth.module'
import { DashboardModule } from './modules/dashboard/dashboard.module'
import { DatabaseModule } from './modules/database/database.module'
import { DoctorModule } from './modules/doctor/doctor.module'
import { HealthController } from './modules/health/health.controller'
import { HelpersModule } from './modules/helpers/helpers.module'
import { PatientModule } from './modules/patient/patient.module'
import { SeedModule } from './modules/seed/seed.module'
import { UserModule } from './modules/user/user.module'

@Module({
  imports: [
    DatabaseModule,
    HelpersModule,
    UserModule,
    AuthModule,
    DoctorModule,
    PatientModule,
    DashboardModule,
    SeedModule,
  ],
  controllers: [HealthController],
  providers: [
    // Global auth: every route is protected unless marked @Public().
    { provide: APP_GUARD, useClass: AuthGuard },
    // Global success envelope.
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    // Global error envelope.
    { provide: APP_FILTER, useClass: ExceptionFilter },
  ],
})
export class AppModule {}
