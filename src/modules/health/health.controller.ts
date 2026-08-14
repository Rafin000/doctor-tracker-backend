import { Controller, Get } from '@nestjs/common'
import { Public } from 'src/decorators'

@Controller()
export class HealthController {
  @Public()
  @Get()
  root() {
    return {
      name: 'Doctor Tracker API',
      status: 'running',
      docs: 'GET /api/docs (interactive Swagger UI)',
      endpoints: {
        health: 'GET /api/health',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        doctors: 'GET /api/doctors',
        patients: 'GET /api/patients',
        dashboard: 'GET /api/dashboard/overview',
      },
    }
  }

  @Public()
  @Get('health')
  check() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }
  }
}
