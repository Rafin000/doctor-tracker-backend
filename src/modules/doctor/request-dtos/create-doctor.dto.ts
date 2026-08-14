import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator'

export class CreateDoctorDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  readonly name!: string

  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  readonly specialization!: string

  @IsNotEmpty()
  @IsString()
  @MaxLength(160)
  readonly hospital!: string

  @IsNotEmpty()
  @IsString()
  @Matches(/^[+]?[\d\s-]{6,20}$/, { message: 'phone must be a valid number' })
  readonly phone!: string

  @IsNotEmpty()
  @IsEmail()
  readonly email!: string
}
