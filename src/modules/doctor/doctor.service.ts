import { Injectable, NotFoundException } from '@nestjs/common'
import { FilterQuery } from 'mongoose'
import { PaginatedResult } from 'src/shared/types'
import {
  buildDateRangeFilter,
  buildSort,
  containsRegex,
} from 'src/shared/query.util'
import { PatientService } from '../patient/patient.service'
import { CreatePatientDTO } from '../patient/request-dtos/create-patient.dto'
import { QueryPatientDTO } from '../patient/request-dtos/query-patient.dto'
import { PatientResponse } from '../patient/types'
import { DoctorRepository } from './doctor.repository'
import { DoctorDocument } from './schemas/doctor.schema'
import { DoctorTransformer } from './transformers/doctor.transformer'
import { CreateDoctorDTO } from './request-dtos/create-doctor.dto'
import { UpdateDoctorDTO } from './request-dtos/update-doctor.dto'
import { QueryDoctorDTO } from './request-dtos/query-doctor.dto'
import { DoctorResponse } from './types'

@Injectable()
export class DoctorService {
  constructor(
    private readonly doctorRepo: DoctorRepository,
    private readonly transformer: DoctorTransformer,
    private readonly patientService: PatientService,
  ) {}

  async create(dto: CreateDoctorDTO): Promise<DoctorResponse> {
    const created = await this.doctorRepo.create(dto)
    return this.transformer.transform(created)
  }

  async findAll(
    query: QueryDoctorDTO,
  ): Promise<PaginatedResult<DoctorResponse>> {
    const filter = this.buildFilter(query)
    const { data, meta } = await this.doctorRepo.paginate({
      filter,
      page: query.page,
      limit: query.limit,
      sort: buildSort(query.sortBy, query.sortOrder),
    })
    return { data: this.transformer.transformCollection(data), meta }
  }

  async findOne(id: string): Promise<DoctorResponse> {
    const doctor = await this.ensureExists(id)
    return this.transformer.transform(doctor)
  }

  async update(id: string, dto: UpdateDoctorDTO): Promise<DoctorResponse> {
    const updated = await this.doctorRepo.updateById(id, dto)
    if (!updated) throw new NotFoundException('Doctor not found')
    return this.transformer.transform(updated)
  }

  /** Deletes a doctor and cascades to remove all of their patients. */
  async remove(id: string): Promise<{ id: string; removedPatients: number }> {
    await this.ensureExists(id)
    const removedPatients = await this.patientService.deleteByDoctor(id)
    await this.doctorRepo.deleteById(id)
    return { id, removedPatients }
  }

  // --- Patient sub-resource (scoped to a doctor) ---

  async getPatients(
    doctorId: string,
    query: QueryPatientDTO,
  ): Promise<PaginatedResult<PatientResponse>> {
    await this.ensureExists(doctorId)
    return this.patientService.findByDoctor(doctorId, query)
  }

  async addPatient(
    doctorId: string,
    dto: CreatePatientDTO,
  ): Promise<PatientResponse> {
    await this.ensureExists(doctorId)
    return this.patientService.create(doctorId, dto)
  }

  async removePatient(
    doctorId: string,
    patientId: string,
  ): Promise<{ id: string }> {
    await this.ensureExists(doctorId)
    return this.patientService.removeForDoctor(doctorId, patientId)
  }

  private async ensureExists(id: string): Promise<DoctorDocument> {
    const doctor = await this.doctorRepo.findById(id)
    if (!doctor) throw new NotFoundException('Doctor not found')
    return doctor as unknown as DoctorDocument
  }

  private buildFilter(query: QueryDoctorDTO): FilterQuery<DoctorDocument> {
    const filter: FilterQuery<DoctorDocument> = {}

    if (query.specialization) {
      filter.specialization = containsRegex(query.specialization)
    }
    if (query.hospital) {
      filter.hospital = containsRegex(query.hospital)
    }
    if (query.search) {
      const rx = containsRegex(query.search)
      filter.$or = [{ name: rx }, { specialization: rx }, { hospital: rx }]
    }
    const createdAt = buildDateRangeFilter(query.startDate, query.endDate)
    if (createdAt) {
      filter.createdAt = createdAt
    }

    return filter
  }
}
