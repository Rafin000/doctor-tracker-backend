import { Module } from '@nestjs/common'
import { DoctorModule } from '../doctor/doctor.module'
import { PatientModule } from '../patient/patient.module'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'

@Module({
  imports: [DoctorModule, PatientModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
