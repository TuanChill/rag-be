/**
 * Analysis Transform Interceptor
 * Phase 7: API Endpoints
 *
 * Transforms AnalysisResult entities to response DTOs
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnalysisResponseDto } from '../dto/analysis-response.dto';

@Injectable()
export class AnalysisTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Handle null/undefined
        if (!data) {
          return data;
        }

        // Handle arrays
        if (Array.isArray(data)) {
          return data.map((item) =>
            item?.uuid ? AnalysisResponseDto.fromEntity(item) : item,
          );
        }

        // Handle single entities with uuid property
        if (data.uuid) {
          return AnalysisResponseDto.fromEntity(data);
        }

        // Handle status responses (no uuid, but has other properties)
        if (data.status !== undefined) {
          return data;
        }

        return data;
      }),
    );
  }
}
