import { Injectable } from '@nestjs/common'
import { compare, hash } from 'bcryptjs'

/**
 * Password hashing helper. Keeps bcrypt in one place so the salt strategy
 * is consistent everywhere passwords are created or checked.
 */
@Injectable()
export class PasswordHelper {
  private readonly saltRounds = 10

  async hash(plain: string): Promise<string> {
    return hash(plain, this.saltRounds)
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return compare(plain, hashed)
  }
}
