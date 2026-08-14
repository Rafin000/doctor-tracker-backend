import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model } from 'mongoose'
import { BaseRepository } from 'src/base/base.repository'
import { PaginatedResult, PaginationMeta } from 'src/shared/types'
import { Patient, PatientDocument } from './schemas/patient.schema'

@Injectable()
export class PatientRepository extends BaseRepository<PatientDocument> {
  constructor(
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
  ) {
    super(patientModel)
  }

  /**
   * Raw bulk insert (bypasses Mongoose timestamps) so seeders can set an
   * explicit createdAt and produce a realistic time-series for the dashboard.
   */
  async bulkInsertRaw(docs: Record<string, any>[]): Promise<number> {
    if (!docs.length) return 0
    const res = await this.patientModel.collection.insertMany(docs)
    return res.insertedCount
  }

  /** Single patient with the owning doctor populated. */
  async findByIdWithDoctor(id: string): Promise<any | null> {
    return this.patientModel
      .findById(id)
      .populate('doctor', 'name specialization')
      .lean()
      .exec()
  }

  /**
   * Paginated patient list with the owning doctor populated (name +
   * specialization only). Find + count run in parallel for efficiency.
   */
  async paginateWithDoctor(params: {
    filter: FilterQuery<PatientDocument>
    page: number
    limit: number
    sort: Record<string, 1 | -1>
  }): Promise<PaginatedResult<any>> {
    const { filter, page, limit, sort } = params
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.patientModel
        .find(filter)
        .populate('doctor', 'name specialization')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.patientModel.countDocuments(filter).exec(),
    ])

    const totalPages = Math.ceil(total / limit) || 1
    const meta: PaginationMeta = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }

    return { data, meta }
  }
}
