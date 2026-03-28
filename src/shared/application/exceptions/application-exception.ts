import { HttpStatus } from '@nestjs/common';

/**
 * Base exception for application layer errors.
 *
 * Thrown for application-level failures such as "resource not found",
 * "conflict", "unauthorized", etc. Carries an error code and HTTP status
 * that the GlobalExceptionFilter uses for i18n resolution and HTTP response.
 *
 * Unlike DomainException (which is always 422), ApplicationException lets
 * you specify the HTTP status code per error type.
 *
 * @example
 * ```typescript
 * import { ERROR_CODES } from './error-codes';
 *
 * // 404 Not Found
 * throw new ApplicationException(ERROR_CODES.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND);
 *
 * // 409 Conflict
 * throw new ApplicationException(ERROR_CODES.DUPLICATE_ENTRY, HttpStatus.CONFLICT, {
 *   field: 'email',
 * });
 *
 * // With metadata for precise field-level reporting
 * throw new ApplicationException(
 *   ERROR_CODES.VALIDATION_FAILED,
 *   HttpStatus.BAD_REQUEST,
 *   { errors: [{ field: 'email', reason: 'already taken' }] },
 * );
 * ```
 */
export class ApplicationException extends Error {
  /**
   * Error code used for i18n message resolution.
   * Defined in `error-codes.ts`, resolved in `GlobalExceptionFilter`.
   */
  public readonly code: string;

  /** HTTP status code for the response. */
  public readonly httpStatus: number;

  /** Optional metadata for precise error reporting. */
  public readonly metadata?: Record<string, unknown>;

  constructor(
    code: string,
    httpStatus: number = HttpStatus.BAD_REQUEST,
    metadata?: Record<string, unknown>,
  ) {
    super(code);
    this.name = 'ApplicationException';
    this.code = code;
    this.httpStatus = httpStatus;
    this.metadata = metadata;
  }
}
