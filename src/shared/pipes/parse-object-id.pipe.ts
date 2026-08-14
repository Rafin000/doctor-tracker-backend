import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import { isValidObjectId } from 'mongoose'

/**
 * Validates that a route param is a well-formed Mongo ObjectId before it ever
 * reaches the service/DB layer. Reusable across all `:id` params.
 */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!isValidObjectId(value)) {
      throw new BadRequestException(
        `Invalid ${metadata.data || 'id'}: ${value}`,
      )
    }
    return value
  }
}
