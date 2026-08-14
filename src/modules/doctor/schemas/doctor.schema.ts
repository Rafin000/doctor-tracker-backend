import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type DoctorDocument = HydratedDocument<Doctor>

@Schema({ timestamps: true, collection: 'doctors' })
export class Doctor {
  @Prop({ required: true, trim: true })
  name: string

  @Prop({ required: true, trim: true })
  specialization: string

  @Prop({ required: true, trim: true })
  hospital: string

  @Prop({ required: true, trim: true })
  phone: string

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor)

// --- Indexes tuned for the list screen (filter + sort) ---
// Equality-filter indexes (used by the specialization / hospital filters).
DoctorSchema.index({ specialization: 1 })
DoctorSchema.index({ hospital: 1 })
// Default sort and date-range (createdAt) filter.
DoctorSchema.index({ createdAt: -1 })
