import { Injectable, NotFoundException } from '@nestjs/common'
import { FilterQuery, Types } from 'mongoose'
import { PaginatedResult } from 'src/shared/types'
import {
  buildDateRangeFilter,
  buildSort,
  containsRegex,
} from 'src/shared/query.util'
import { PatientRepository } from './patient.repository'
import { PatientDocument } from './schemas/patient.schema'
import { PatientTransformer } from './transformers/patient.transformer'
import { CreatePatientDTO } from './request-dtos/create-patient.dto'
import { UpdatePatientDTO } from './request-dtos/update-patient.dto'
import { QueryPatientDTO } from './request-dtos/query-patient.dto'
import { PatientResponse } from './types'

@Injectable()
export class PatientService {
  constructor(
    private readonly patientRepo: PatientRepository,
    private readonly transformer: PatientTransformer,
  ) {}

  /** Creates a patient under an already-validated doctor. */
  async create(
    doctorId: string,
    dto: CreatePatientDTO,
  ): Promise<PatientResponse> {
    const created = await this.patientRepo.create({
      ...dto,
      doctor: new Types.ObjectId(doctorId),
    })
    return this.transformer.transform(created)
  }

  /** Paginated, searchable, filterable patient list. */
  async findAll(
    query: QueryPatientDTO,
  ): Promise<PaginatedResult<PatientResponse>> {
    const filter = this.buildFilter(query)
    const { data, meta } = await this.patientRepo.paginateWithDoctor({
      filter,
      page: query.page,
      limit: query.limit,
      sort: buildSort(query.sortBy, query.sortOrder),
    })
    return { data: this.transformer.transformCollection(data), meta }
  }

  /** Same list, hard-scoped to one doctor (used by the doctor detail page). */
  async findByDoctor(
    doctorId: string,
    query: QueryPatientDTO,
  ): Promise<PaginatedResult<PatientResponse>> {
    return this.findAll({ ...query, doctorId } as QueryPatientDTO)
  }

  async findOne(id: string): Promise<PatientResponse> {
    const patient = await this.patientRepo.findByIdWithDoctor(id)
    if (!patient) throw new NotFoundException('Patient not found')
    return this.transformer.transform(patient)
  }

  async update(id: string, dto: UpdatePatientDTO): Promise<PatientResponse> {
    const updated = await this.patientRepo.updateById(id, dto)
    if (!updated) throw new NotFoundException('Patient not found')
    return this.transformer.transform(updated)
  }

  async remove(id: string): Promise<{ id: string }> {
    const deleted = await this.patientRepo.deleteById(id)
    if (!deleted) throw new NotFoundException('Patient not found')
    return { id }
  }

  /** Removes a patient but only if it belongs to the given doctor. */
  async removeForDoctor(
    doctorId: string,
    patientId: string,
  ): Promise<{ id: string }> {
    const patient = await this.patientRepo.findOne({
      _id: new Types.ObjectId(patientId),
      doctor: new Types.ObjectId(doctorId),
    })
    if (!patient) {
      throw new NotFoundException('Patient not found for this doctor')
    }
    await this.patientRepo.deleteById(patientId)
    return { id: patientId }
  }

  /** Cascade helper: removes every patient of a doctor being deleted. */
  async deleteByDoctor(doctorId: string): Promise<number> {
    return this.patientRepo.deleteMany({
      doctor: new Types.ObjectId(doctorId),
    })
  }

  private buildFilter(
    query: QueryPatientDTO,
  ): FilterQuery<PatientDocument> {
    const filter: FilterQuery<PatientDocument> = {}

    if (query.doctorId) {
      filter.doctor = new Types.ObjectId(query.doctorId)
    }
    if (query.condition) {
      filter.condition = containsRegex(query.condition)
    }
    if (query.gender) {
      filter.gender = query.gender
    }
    if (query.search) {
      const rx = containsRegex(query.search)
      filter.$or = [{ name: rx }, { condition: rx }]
    }
    const createdAt = buildDateRangeFilter(query.startDate, query.endDate)
    if (createdAt) {
      filter.createdAt = createdAt
    }

    return filter
  }
}
