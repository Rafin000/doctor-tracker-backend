import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class LoginDTO {
  @IsNotEmpty()
  @IsEmail()
  readonly email!: string

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  readonly password!: string
}
