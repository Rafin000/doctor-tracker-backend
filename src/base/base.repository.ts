import {
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from 'mongoose'
import { PaginatedResult, PaginationMeta } from 'src/shared/types'

export interface PaginateParams<T> {
  filter?: FilterQuery<T>
  page?: number
  limit?: number
  sort?: Record<string, 1 | -1>
  projection?: ProjectionType<T>
}

/**
 * Generic Mongoose repository. Every feature repository extends this so the
 * CRUD + pagination logic lives in exactly one place (DRY, reusable).
 * Keeps Mongoose out of the service layer — services talk to repositories only.
 */
export abstract class BaseRepository<T> {
  protected constructor(protected readonly model: Model<T>) {}

  async create(payload: Partial<T>): Promise<T> {
    const created = await this.model.create(payload)
    return created.toObject() as T
  }

  async findById(
    id: string,
    projection?: ProjectionType<T>,
  ): Promise<T | null> {
    return this.model.findById(id, projection).lean<T>().exec()
  }

  async findOne(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions,
  ): Promise<T | null> {
    return this.model.findOne(filter, projection, options).lean<T>().exec()
  }

  async findAll(
    filter: FilterQuery<T> = {},
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<T[]> {
    return this.model.find(filter).sort(sort).lean<T[]>().exec()
  }

  async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .lean<T>()
      .exec()
  }

  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).lean<T>().exec()
  }

  async deleteMany(filter: FilterQuery<T>): Promise<number> {
    const result = await this.model.deleteMany(filter).exec()
    return result.deletedCount || 0
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec()
  }

  async aggregate<R = unknown>(pipeline: PipelineStage[]): Promise<R[]> {
    return this.model.aggregate<R>(pipeline).exec()
  }

  /**
   * Query-optimized pagination: runs the filtered find (with skip/limit/sort,
   * backed by indexes) and the count in parallel, then builds pagination meta.
   */
  async paginate(params: PaginateParams<T>): Promise<PaginatedResult<T>> {
    const page = Math.max(1, params.page || 1)
    const limit = Math.min(100, Math.max(1, params.limit || 10))
    const skip = (page - 1) * limit
    const filter = params.filter || {}
    const sort = params.sort || { createdAt: -1 }

    const [data, total] = await Promise.all([
      this.model
        .find(filter, params.projection)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean<T[]>()
        .exec(),
      this.model.countDocuments(filter).exec(),
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
