import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '@shared/domain/exceptions/domain-exception';
import { ApplicationException } from '@shared/application/exceptions/application-exception';
import { resolveErrorMessage } from '@shared/application/exceptions/error-messages';
import { ERROR_CODES } from '@shared/application/exceptions/error-codes';
import { CORRELATION_ID_HEADER } from '../interceptors/correlation-id.interceptor';

/**
 * Parses the Accept-Language header to extract the preferred locale.
 * Returns the first supported locale, or 'en' as fallback.
 */
function parseLocale(acceptLanguage: string | undefined): string {
  if (!acceptLanguage) return 'en';
  const preferred = acceptLanguage
    .split(',')[0]
    ?.split('-')[0]
    ?.trim()
    .toLowerCase();
  return preferred || 'en';
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = request.headers[CORRELATION_ID_HEADER] as string;
    const locale = parseLocale(request.headers['accept-language']);

    const result = this.buildErrorResponse(exception, locale);

    // Log full error internally — never expose stack to client
    this.logger.error(
      `[${correlationId}] ${request.method} ${request.url} ${result.statusCode}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(result.statusCode).json({
      statusCode: result.statusCode,
      code: result.code,
      message: result.message,
      metadata: result.metadata,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId,
    });
  }

  private buildErrorResponse(
    exception: unknown,
    locale: string,
  ): {
    statusCode: number;
    code: string;
    message: string;
    metadata?: Record<string, unknown>;
  } {
    // DomainException → 422 with i18n message
    if (exception instanceof DomainException) {
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        code: exception.code,
        message: resolveErrorMessage(exception.code, locale),
        metadata: exception.metadata,
      };
    }

    // ApplicationException → custom status with i18n message
    if (exception instanceof ApplicationException) {
      return {
        statusCode: exception.httpStatus,
        code: exception.code,
        message: resolveErrorMessage(exception.code, locale),
        metadata: exception.metadata,
      };
    }

    // NestJS ValidationPipe errors → precise field-level messages
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        return {
          statusCode: status,
          code: ERROR_CODES.VALIDATION_FAILED,
          message: resolveErrorMessage(ERROR_CODES.VALIDATION_FAILED, locale),
          metadata: { errors: resp.message }, // field-level errors from ValidationPipe
        };
      }

      return {
        statusCode: status,
        code: ERROR_CODES.VALIDATION_FAILED,
        message:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : resolveErrorMessage(ERROR_CODES.VALIDATION_FAILED, locale),
      };
    }

    // Unknown errors → 500 with generic message
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: resolveErrorMessage(ERROR_CODES.INTERNAL_ERROR, locale),
    };
  }
}
