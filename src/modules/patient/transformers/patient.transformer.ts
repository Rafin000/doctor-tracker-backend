import { Injectable } from '@nestjs/common'
import {
  CollectionTransformer,
  Transformer,
} from 'src/base/base.transformer'
import { PatientResponse } from '../types'

/**
 * Shapes Patient documents for the API. Handles both populated doctor
 * (returns a small summary) and unpopulated doctor (returns the id string).
 */
@Injectable()
export class PatientTransformer
  implements
    Transformer<any, PatientResponse>,
    CollectionTransformer<any, PatientResponse>
{
  transform(doc: any): PatientResponse {
    return {
      id: String(doc._id),
      name: doc.name,
      age: doc.age,
      gender: doc.gender,
      condition: doc.condition,
      phone: doc.phone || '',
      email: doc.email || '',
      doctor: this.mapDoctor(doc.doctor),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }
  }

  transformCollection(docs: any[]): PatientResponse[] {
    return docs.map((doc) => this.transform(doc))
  }

  private mapDoctor(doctor: any): PatientResponse['doctor'] {
    if (!doctor) return null
    // Populated document.
    if (typeof doctor === 'object' && doctor.name) {
      return {
        id: String(doctor._id),
        name: doctor.name,
        specialization: doctor.specialization,
      }
    }
    // Raw ObjectId reference.
    return String(doctor)
  }
}
