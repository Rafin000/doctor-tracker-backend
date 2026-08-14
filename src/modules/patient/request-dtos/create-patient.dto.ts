import { Type } from 'class-transformer'
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import { Gender } from '../schemas/patient.schema'

/**
 * Body for creating a patient. The owning doctor is taken from the route
 * (`POST /doctors/:doctorId/patients`), not the body.
 */
export class CreatePatientDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  readonly name!: string

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(130)
  readonly age!: number

  @IsEnum(Gender)
  readonly gender!: Gender

  @IsNotEmpty()
  @IsString()
  @MaxLength(160)
  readonly condition!: string

  @IsOptional()
  @IsString()
  @Matches(/^[+]?[\d\s-]{6,20}$/, { message: 'phone must be a valid number' })
  readonly phone?: string

  @IsOptional()
  @IsEmail()
  readonly email?: string
}
