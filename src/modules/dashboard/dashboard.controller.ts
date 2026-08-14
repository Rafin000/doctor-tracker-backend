import { Controller, Get, Query } from '@nestjs/common'
import { DashboardService } from './dashboard.service'
import { DashboardQueryDTO } from './request-dtos/dashboard-query.dto'

// Protected by the global AuthGuard.
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('overview')
  async overview(@Query() query: DashboardQueryDTO) {
    return this.service.getOverview(query.days)
  }
}
