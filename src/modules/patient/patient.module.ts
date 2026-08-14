import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Patient, PatientSchema } from './schemas/patient.schema'
import { PatientController } from './patient.controller'
import { PatientRepository } from './patient.repository'
import { PatientService } from './patient.service'
import { PatientTransformer } from './transformers/patient.transformer'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }]),
  ],
  controllers: [PatientController],
  providers: [PatientService, PatientRepository, PatientTransformer],
  exports: [PatientService, PatientRepository],
})
export class PatientModule {}
