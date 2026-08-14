import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PatientModule } from '../patient/patient.module'
import { Doctor, DoctorSchema } from './schemas/doctor.schema'
import { DoctorController } from './doctor.controller'
import { DoctorRepository } from './doctor.repository'
import { DoctorService } from './doctor.service'
import { DoctorTransformer } from './transformers/doctor.transformer'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Doctor.name, schema: DoctorSchema }]),
    PatientModule,
  ],
  controllers: [DoctorController],
  providers: [DoctorService, DoctorRepository, DoctorTransformer],
  exports: [DoctorService, DoctorRepository],
})
export class DoctorModule {}
