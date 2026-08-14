import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common'
import { Public, VerifiedUser } from 'src/decorators'
import { SuccessResponse } from 'src/shared/response'
import { AuthUser } from '../user/types'
import { AuthService } from './auth.service'
import { LoginDTO } from './request-dtos/login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginDTO): Promise<SuccessResponse> {
    const data = await this.service.login(body)
    return new SuccessResponse(
      { message: 'Logged in successfully', data },
      HttpStatus.OK,
    )
  }

  // Protected by the global AuthGuard; returns the current admin's profile.
  @Get('me')
  async me(@VerifiedUser() user: AuthUser): Promise<SuccessResponse> {
    return new SuccessResponse({
      message: 'Profile fetched successfully',
      data: user,
    })
  }
}
