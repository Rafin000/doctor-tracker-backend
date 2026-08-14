import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { PasswordHelper } from '../helpers/password.helper'
import { UserRole } from './schemas/user.schema'
import { UserRepository } from './user.repository'
import { AuthUser } from './types'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly passwordHelper: PasswordHelper,
  ) {}

  /** Loads the sanitized user (no password) for the auth guard. */
  async getAuthUser(id: string): Promise<AuthUser | null> {
    const user = await this.userRepo.findById(id)
    if (!user) return null
    return this.toAuthUser(user)
  }

  /** Verifies email + password for login; throws on any mismatch. */
  async validateCredentials(
    email: string,
    password: string,
  ): Promise<AuthUser> {
    const user = await this.userRepo.findByEmailWithPassword(email)
    if (!user) {
      throw new UnauthorizedException('Invalid email or password')
    }
    const isMatch = await this.passwordHelper.compare(password, user.password)
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password')
    }
    return this.toAuthUser(user)
  }

  async getProfile(id: string): Promise<AuthUser> {
    const user = await this.getAuthUser(id)
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return user
  }

  /** Idempotent admin creation used by the seeder. */
  async ensureAdmin(payload: {
    name: string
    email: string
    password: string
  }): Promise<{ created: boolean; email: string }> {
    const existing = await this.userRepo.findByEmail(payload.email)
    if (existing) {
      return { created: false, email: existing.email }
    }
    const password = await this.passwordHelper.hash(payload.password)
    const admin = await this.userRepo.create({
      name: payload.name,
      email: payload.email.toLowerCase(),
      password,
      role: UserRole.ADMIN,
    })
    return { created: true, email: admin.email }
  }

  private toAuthUser(user: any): AuthUser {
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    }
  }
}
