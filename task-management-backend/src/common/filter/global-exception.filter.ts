import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Catches ALL exceptions (HTTP and unexpected) and formats them into the
 * standard { data, status, message, errorCode, errors?, meta } envelope.
 *
 * Registered as the sole global exception filter in main.ts so there is no
 * ambiguity about which filter handles a given exception.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      this.handleHttpException(exception, request, response);
    } else {
      this.handleUnknownException(exception, request, response);
    }
  }

  // ─── HTTP exceptions (4xx / 5xx thrown by NestJS or our code) ────────────

  private handleHttpException(
    exception: HttpException,
    request: Request,
    response: Response,
  ): void {
    const status = exception.getStatus();
    const raw = exception.getResponse();
    const { message, errors } = this.parseHttpResponse(raw);

    this.logHttpException(exception, request, status);

    response.status(status).json({
      data: null,
      status: 'error',
      message,
      errorCode: this.statusToErrorCode(status),
      ...(errors && { errors }),
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      },
    });
  }

  /**
   * Parses the raw exception response which NestJS can return as either a
   * plain string, or an object like `{ statusCode, message, error }`.
   * When the ValidationPipe fires it sends `message` as a string[].
   */
  private parseHttpResponse(raw: unknown): {
    message: string;
    errors?: Record<string, string[]>;
  } {
    if (typeof raw === 'string') {
      return { message: raw };
    }

    if (raw !== null && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      const msg = obj['message'];

      // ValidationPipe → message is string[]
      if (Array.isArray(msg)) {
        return {
          message: 'Validation failed',
          errors: this.groupValidationErrors(
            msg.filter((m): m is string => typeof m === 'string'),
          ),
        };
      }

      if (typeof msg === 'string') {
        return { message: msg };
      }
    }

    return { message: 'Request failed' };
  }

  /**
   * Groups flat validation error strings (e.g. "title must be a string")
   * into a { fieldName: [errorMsg, …] } map suitable for the frontend.
   */
  private groupValidationErrors(errors: string[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    for (const error of errors) {
      // class-validator format: "<field> <constraint message>"
      const match = /^(\w+(?:\.\w+)*)\s+(.+)$/.exec(error);
      const [field, message] = match ? [match[1], match[2]] : ['general', error];

      (result[field] ??= []).push(message);
    }

    return result;
  }

  // ─── Unhandled / unexpected exceptions ───────────────────────────────────

  private handleUnknownException(
    exception: unknown,
    request: Request,
    response: Response,
  ): void {
    this.logger.error(
      `Unhandled exception: ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      data: null,
      status: 'error',
      message: 'An unexpected error occurred',
      errorCode: 'INTERNAL_SERVER_ERROR',
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      },
    });
  }

  // ─── Logging ──────────────────────────────────────────────────────────────

  private logHttpException(
    exception: HttpException,
    request: Request,
    status: number,
  ): void {
    const msg = `${request.method} ${request.url} → ${status}`;
    if (status >= 500) {
      this.logger.error(msg, exception.stack);
    } else {
      this.logger.warn(msg);
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private statusToErrorCode(status: number): string {
    const map: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
      [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
    };
    return map[status] ?? 'INTERNAL_SERVER_ERROR';
  }
}