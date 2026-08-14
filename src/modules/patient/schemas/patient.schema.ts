import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type PatientDocument = HydratedDocument<Patient>

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Schema({ timestamps: true, collection: 'patients' })
export class Patient {
  @Prop({ required: true, trim: true })
  name: string

  @Prop({ required: true, min: 0, max: 130 })
  age: number

  @Prop({ type: String, enum: Gender, required: true })
  gender: Gender

  @Prop({ required: true, trim: true })
  condition: string

  @Prop({ trim: true, default: '' })
  phone: string

  @Prop({ lowercase: true, trim: true, default: '' })
  email: string

  // Owning doctor. Every patient belongs to exactly one doctor.
  @Prop({
    type: Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true,
  })
  doctor: Types.ObjectId
}

export const PatientSchema = SchemaFactory.createForClass(Patient)

// --- Indexes tuned for the patient list + "patients per doctor" queries ---
// Fast lookup of a doctor's patients, already sorted newest-first.
PatientSchema.index({ doctor: 1, createdAt: -1 })
// Condition filter on the dedicated patient page.
PatientSchema.index({ condition: 1 })
// Global default sort / date-range filter.
PatientSchema.index({ createdAt: -1 })
