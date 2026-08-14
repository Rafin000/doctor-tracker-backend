import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common'
import { ParseObjectIdPipe } from 'src/shared/pipes/parse-object-id.pipe'
import { SuccessResponse } from 'src/shared/response'
import { PatientService } from './patient.service'
import { QueryPatientDTO } from './request-dtos/query-patient.dto'
import { UpdatePatientDTO } from './request-dtos/update-patient.dto'

/**
 * Dedicated patient page endpoints. Protected globally by AuthGuard.
 * Patient creation lives under the doctor resource (POST /doctors/:id/patients).
 */
@Controller('patients')
export class PatientController {
  constructor(private readonly service: PatientService) {}

  @Get()
  async findAll(@Query() query: QueryPatientDTO) {
    return this.service.findAll(query)
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: UpdatePatientDTO,
  ): Promise<SuccessResponse> {
    const data = await this.service.update(id, body)
    return new SuccessResponse({ message: 'Patient updated successfully', data })
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<SuccessResponse> {
    const data = await this.service.remove(id)
    return new SuccessResponse({ message: 'Patient deleted successfully', data })
  }
}
