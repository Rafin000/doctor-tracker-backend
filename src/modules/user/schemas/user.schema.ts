import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

export enum UserRole {
  ADMIN = 'admin',
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true })
  name: string

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string

  // Never returned by default queries; must be explicitly selected for login.
  @Prop({ required: true, select: false })
  password: string

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.ADMIN,
  })
  role: UserRole
}

export const UserSchema = SchemaFactory.createForClass(User)

// Unique index on email backs fast login lookups and enforces uniqueness.
UserSchema.index({ email: 1 }, { unique: true })
