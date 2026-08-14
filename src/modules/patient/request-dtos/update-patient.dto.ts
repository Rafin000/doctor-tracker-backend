import { PartialType } from '@nestjs/mapped-types'
import { CreatePatientDTO } from './create-patient.dto'

// Editable patient fields (doctor reassignment is handled from the doctor page).
export class UpdatePatientDTO extends PartialType(CreatePatientDTO) {}
