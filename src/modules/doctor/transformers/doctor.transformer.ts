import { Injectable } from '@nestjs/common'
import {
  CollectionTransformer,
  Transformer,
} from 'src/base/base.transformer'
import { DoctorResponse } from '../types'

/**
 * Shapes raw Doctor documents into the public API response, stripping
 * Mongo internals (_id -> id, no __v). Single source of response truth.
 */
@Injectable()
export class DoctorTransformer
  implements
    Transformer<any, DoctorResponse>,
    CollectionTransformer<any, DoctorResponse>
{
  transform(doc: any): DoctorResponse {
    return {
      id: String(doc._id),
      name: doc.name,
      specialization: doc.specialization,
      hospital: doc.hospital,
      phone: doc.phone,
      email: doc.email,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }
  }

  transformCollection(docs: any[]): DoctorResponse[] {
    return docs.map((doc) => this.transform(doc))
  }
}
