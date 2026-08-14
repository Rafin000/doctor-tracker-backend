import { Injectable, Logger } from '@nestjs/common'
import { Types } from 'mongoose'
import env from 'src/config'
import { DoctorRepository } from '../doctor/doctor.repository'
import { PatientRepository } from '../patient/patient.repository'
import { Gender } from '../patient/schemas/patient.schema'
import { UserService } from '../user/user.service'

const SPECIALIZATIONS = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'Oncology',
  'General Medicine',
  'Psychiatry',
]
const HOSPITALS = [
  'Square Hospital',
  'United Hospital',
  'Evercare Hospital',
  'Labaid Specialized',
  'Ibn Sina',
]
const CONDITIONS = [
  'Hypertension',
  'Diabetes',
  'Asthma',
  'Migraine',
  'Arthritis',
  'Fracture',
  'Anxiety',
  'Skin Allergy',
]
const FIRST = ['Arif', 'Nadia', 'Rahim', 'Sadia', 'Kamal', 'Farah', 'Imran', 'Tania', 'Sabbir', 'Mitu']
const LAST = ['Ahmed', 'Khan', 'Islam', 'Chowdhury', 'Hasan', 'Akter', 'Rahman']
const GENDERS = [Gender.MALE, Gender.FEMALE, Gender.OTHER]

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const slug = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '')

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name)

  constructor(
    private readonly userService: UserService,
    private readonly doctorRepo: DoctorRepository,
    private readonly patientRepo: PatientRepository,
  ) {}

  async run(): Promise<void> {
    await this.seedAdmin()
    await this.seedSampleData()
  }

  private async seedAdmin(): Promise<void> {
    const result = await this.userService.ensureAdmin({
      name: env.seed.adminName,
      email: env.seed.adminEmail,
      password: env.seed.adminPassword,
    })
    this.logger.log(
      result.created
        ? `Admin created: ${result.email}`
        : `Admin already exists: ${result.email}`,
    )
  }

  private async seedSampleData(): Promise<void> {
    const existing = await this.doctorRepo.count()
    if (existing > 0) {
      this.logger.log(`Sample data skipped (${existing} doctors present)`)
      return
    }

    const doctorIds: Types.ObjectId[] = []
    for (let i = 0; i < 8; i++) {
      const name = `Dr. ${pick(FIRST)} ${pick(LAST)}`
      const doctor = await this.doctorRepo.create({
        name,
        specialization: SPECIALIZATIONS[i % SPECIALIZATIONS.length],
        hospital: pick(HOSPITALS),
        phone: `018${Math.floor(10000000 + Math.random() * 89999999)}`,
        email: `${slug(name)}${i}@clinic.test`,
      })
      doctorIds.push(new Types.ObjectId(String((doctor as any)._id)))
    }

    const patientDocs = Array.from({ length: 45 }, (_, i) => {
      const name = `${pick(FIRST)} ${pick(LAST)}`
      const daysAgo = Math.floor(Math.random() * 30)
      const createdAt = new Date()
      createdAt.setDate(createdAt.getDate() - daysAgo)
      return {
        name,
        age: 5 + Math.floor(Math.random() * 75),
        gender: pick(GENDERS),
        condition: pick(CONDITIONS),
        phone: `017${Math.floor(10000000 + Math.random() * 89999999)}`,
        email: `${slug(name)}${i}@mail.test`,
        doctor: pick(doctorIds),
        createdAt,
        updatedAt: createdAt,
      }
    })
    const created = await this.patientRepo.bulkInsertRaw(patientDocs)

    this.logger.log(
      `Seeded ${doctorIds.length} doctors and ${created} patients`,
    )
  }
}
