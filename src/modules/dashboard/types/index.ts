export interface DashboardTotals {
  doctors: number
  patients: number
  avgPatientsPerDoctor: number
}

export interface PatientsPerDoctor {
  doctorId: string
  doctor: string
  specialization: string
  count: number
}

export interface TimeSeriesPoint {
  date: string
  count: number
}

export interface ConditionCount {
  condition: string
  count: number
}

export interface GenderCount {
  gender: string
  count: number
}

export interface DashboardOverview {
  totals: DashboardTotals
  patientsPerDoctor: PatientsPerDoctor[]
  patientsOverTime: TimeSeriesPoint[]
  patientsByCondition: ConditionCount[]
  genderDistribution: GenderCount[]
}
