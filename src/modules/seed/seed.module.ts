import { Module } from '@nestjs/common'
import { DoctorModule } from '../doctor/doctor.module'
import { PatientModule } from '../patient/patient.module'
import { UserModule } from '../user/user.module'
import { SeedService } from './seed.service'

@Module({
  imports: [UserModule, DoctorModule, PatientModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
