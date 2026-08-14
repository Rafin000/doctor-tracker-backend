import { UserRole } from '../schemas/user.schema'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}
