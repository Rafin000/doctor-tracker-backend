import { IsOptional, IsString } from 'class-validator'
import { PaginationQueryDTO } from 'src/shared/pagination.dto'

export class QueryDoctorDTO extends PaginationQueryDTO {
  @IsOptional()
  @IsString()
  readonly specialization?: string

  @IsOptional()
  @IsString()
  readonly hospital?: string
}
