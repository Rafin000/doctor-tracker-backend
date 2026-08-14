import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { BaseRepository } from 'src/base/base.repository'
import { Doctor, DoctorDocument } from './schemas/doctor.schema'

@Injectable()
export class DoctorRepository extends BaseRepository<DoctorDocument> {
  constructor(
    @InjectModel(Doctor.name)
    private readonly doctorModel: Model<DoctorDocument>,
  ) {
    super(doctorModel)
  }
}
