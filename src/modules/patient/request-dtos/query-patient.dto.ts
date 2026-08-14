import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator'
import { PaginationQueryDTO } from 'src/shared/pagination.dto'
import { Gender } from '../schemas/patient.schema'

export class QueryPatientDTO extends PaginationQueryDTO {
  @IsOptional()
  @IsString()
  readonly condition?: string

  @IsOptional()
  @IsEnum(Gender)
  readonly gender?: Gender

  // Optional scope to a single doctor's patients.
  @IsOptional()
  @IsMongoId()
  readonly doctorId?: string
}
