import { Gender } from '../schemas/patient.schema'

export interface PatientDoctorSummary {
  id: string
  name: string
  specialization: string
}

export interface PatientResponse {
  id: string
  name: string
  age: number
  gender: Gender
  condition: string
  phone: string
  email: string
  doctor: PatientDoctorSummary | string | null
  createdAt: Date
  updatedAt: Date
}
