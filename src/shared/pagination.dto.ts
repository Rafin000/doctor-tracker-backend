import { Transform } from 'class-transformer'
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'

/**
 * Reusable query DTO shared by every paginated list endpoint.
 * Handles page/limit coercion, free-text search, date-range filtering and sort.
 */
export class PaginationQueryDTO {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  readonly page: number = 1

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit: number = 10

  @IsOptional()
  @IsString()
  readonly search?: string

  // ISO date strings; used for createdAt range filtering.
  @IsOptional()
  @IsString()
  readonly startDate?: string

  @IsOptional()
  @IsString()
  readonly endDate?: string

  @IsOptional()
  @IsString()
  readonly sortBy?: string = 'createdAt'

  @IsOptional()
  @IsIn(['asc', 'desc'])
  readonly sortOrder: 'asc' | 'desc' = 'desc'
}
