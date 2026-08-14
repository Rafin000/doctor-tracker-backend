import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ParseObjectIdPipe } from 'src/shared/pipes/parse-object-id.pipe'
import { SuccessResponse } from 'src/shared/response'
import { CreatePatientDTO } from '../patient/request-dtos/create-patient.dto'
import { QueryPatientDTO } from '../patient/request-dtos/query-patient.dto'
import { DoctorService } from './doctor.service'
import { CreateDoctorDTO } from './request-dtos/create-doctor.dto'
import { QueryDoctorDTO } from './request-dtos/query-doctor.dto'
import { UpdateDoctorDTO } from './request-dtos/update-doctor.dto'

// All routes protected by the global AuthGuard.
@Controller('doctors')
export class DoctorController {
  constructor(private readonly service: DoctorService) {}

  @Post()
  async create(@Body() body: CreateDoctorDTO): Promise<SuccessResponse> {
    const data = await this.service.create(body)
    return new SuccessResponse(
      { message: 'Doctor created successfully', data },
      HttpStatus.CREATED,
    )
  }

  @Get()
  async findAll(@Query() query: QueryDoctorDTO) {
    return this.service.findAll(query)
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: UpdateDoctorDTO,
  ): Promise<SuccessResponse> {
    const data = await this.service.update(id, body)
    return new SuccessResponse({ message: 'Doctor updated successfully', data })
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<SuccessResponse> {
    const data = await this.service.remove(id)
    return new SuccessResponse({ message: 'Doctor deleted successfully', data })
  }

  // --- Patients under a specific doctor ---

  @Get(':id/patients')
  async getPatients(
    @Param('id', ParseObjectIdPipe) id: string,
    @Query() query: QueryPatientDTO,
  ) {
    return this.service.getPatients(id, query)
  }

  @Post(':id/patients')
  async addPatient(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: CreatePatientDTO,
  ): Promise<SuccessResponse> {
    const data = await this.service.addPatient(id, body)
    return new SuccessResponse(
      { message: 'Patient added successfully', data },
      HttpStatus.CREATED,
    )
  }

  @Delete(':id/patients/:patientId')
  async removePatient(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('patientId', ParseObjectIdPipe) patientId: string,
  ): Promise<SuccessResponse> {
    const data = await this.service.removePatient(id, patientId)
    return new SuccessResponse({
      message: 'Patient removed from doctor successfully',
      data,
    })
  }
}
