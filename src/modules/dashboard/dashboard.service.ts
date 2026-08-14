import { Injectable } from '@nestjs/common'
import { PipelineStage } from 'mongoose'
import { DoctorRepository } from '../doctor/doctor.repository'
import { PatientRepository } from '../patient/patient.repository'
import {
  ConditionCount,
  DashboardOverview,
  GenderCount,
  PatientsPerDoctor,
  TimeSeriesPoint,
} from './types'

/**
 * Read-only analytics for the admin dashboard. Every metric is computed with
 * a MongoDB aggregation pipeline (server-side), and all pipelines run in
 * parallel so the endpoint stays fast regardless of dataset size.
 */
@Injectable()
export class DashboardService {
  constructor(
    private readonly doctorRepo: DoctorRepository,
    private readonly patientRepo: PatientRepository,
  ) {}

  async getOverview(days = 30): Promise<DashboardOverview> {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const [
      doctors,
      patients,
      patientsPerDoctor,
      patientsOverTime,
      patientsByCondition,
      genderDistribution,
    ] = await Promise.all([
      this.doctorRepo.count(),
      this.patientRepo.count(),
      this.patientRepo.aggregate<PatientsPerDoctor>(
        this.patientsPerDoctorPipeline(),
      ),
      this.patientRepo.aggregate<TimeSeriesPoint>(
        this.patientsOverTimePipeline(since),
      ),
      this.patientRepo.aggregate<ConditionCount>(
        this.patientsByConditionPipeline(),
      ),
      this.patientRepo.aggregate<GenderCount>(this.genderPipeline()),
    ])

    return {
      totals: {
        doctors,
        patients,
        avgPatientsPerDoctor: doctors
          ? Math.round((patients / doctors) * 10) / 10
          : 0,
      },
      patientsPerDoctor,
      patientsOverTime,
      patientsByCondition,
      genderDistribution,
    }
  }

  private patientsPerDoctorPipeline(): PipelineStage[] {
    return [
      { $group: { _id: '$doctor', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          doctorId: '$_id',
          doctor: { $ifNull: ['$doctor.name', 'Unknown'] },
          specialization: { $ifNull: ['$doctor.specialization', 'N/A'] },
          count: 1,
        },
      },
    ]
  }

  private patientsOverTimePipeline(since: Date): PipelineStage[] {
    return [
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', count: 1 } },
    ]
  }

  private patientsByConditionPipeline(): PipelineStage[] {
    return [
      { $group: { _id: '$condition', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $project: { _id: 0, condition: '$_id', count: 1 } },
    ]
  }

  private genderPipeline(): PipelineStage[] {
    return [
      { $group: { _id: '$gender', count: { $sum: 1 } } },
      { $project: { _id: 0, gender: '$_id', count: 1 } },
    ]
  }
}
