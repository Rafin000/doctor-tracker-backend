import { Injectable } from '@nestjs/common'
import { JWTHelper } from '../helpers/jwt.helper'
import { UserService } from '../user/user.service'
import { AuthUser } from '../user/types'
import { LoginDTO } from './request-dtos/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtHelper: JWTHelper,
  ) {}

  async login(
    payload: LoginDTO,
  ): Promise<{ accessToken: string; user: AuthUser }> {
    const user = await this.userService.validateCredentials(
      payload.email,
      payload.password,
    )

    const accessToken = this.jwtHelper.makeAccessToken({
      id: user.id,
      email: user.email,
    })

    return { accessToken, user }
  }

  async getProfile(userId: string): Promise<AuthUser> {
    return this.userService.getProfile(userId)
  }
}
