import { Transform } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'

export class DashboardQueryDTO {
  // Window (in days) for the "patients over time" series.
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(7)
  @Max(365)
  readonly days: number = 30
}
