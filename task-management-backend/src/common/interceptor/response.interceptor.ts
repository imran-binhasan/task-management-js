import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import {
  ApiResponse,
  PaginatedServiceResponse,
} from '../interface/api-response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T | T[]>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T | T[]>> {
    const requestId = this.generateRequestId();

    return next.handle().pipe(
      map((data) => {
        if (this.isPaginatedResponse(data)) {
          return this.formatPaginated(data, requestId);
        }
        return this.formatRegular(data, requestId);
      }),
    );
  }

  private isPaginatedResponse(data: unknown): data is PaginatedServiceResponse<T> {
    return (
      data !== null &&
      typeof data === 'object' &&
      Array.isArray((data as any).items) &&
      typeof (data as any).pagination === 'object' &&
      (data as any).pagination !== null &&
      typeof (data as any).pagination.total === 'number'
    );
  }

  private formatPaginated(
    data: PaginatedServiceResponse<T>,
    requestId: string,
  ): ApiResponse<T[]> {
    return {
      data: data.items,
      status: 'success',
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        pagination: data.pagination,
      },
    };
  }

  private formatRegular(data: T, requestId: string): ApiResponse<T> {
    return {
      data,
      status: 'success',
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 10);
  }
}