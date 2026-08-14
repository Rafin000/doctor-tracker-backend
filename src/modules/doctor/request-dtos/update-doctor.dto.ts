import { PartialType } from '@nestjs/mapped-types'
import { CreateDoctorDTO } from './create-doctor.dto'

// All create fields become optional for PATCH updates.
export class UpdateDoctorDTO extends PartialType(CreateDoctorDTO) {}
