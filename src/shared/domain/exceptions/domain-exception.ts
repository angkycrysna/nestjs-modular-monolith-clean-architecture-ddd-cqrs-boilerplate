/**
 * Base exception for domain layer violations.
 *
 * Thrown when a domain invariant is violated (e.g., invalid email format,
 * business rule violation). Carries an error code that the GlobalExceptionFilter
 * resolves to a localized message based on the Accept-Language header.
 *
 * Maps to HTTP 422 Unprocessable Entity by default.
 *
 * @example
 * ```typescript
 * import { ERROR_CODES } from '@shared/application/exceptions/error-codes';
 *
 * // Simple — just an error code
 * throw new DomainException(ERROR_CODES.INVALID_FORMAT);
 *
 * // With metadata — for precise field-level error reporting
 * throw new DomainException(ERROR_CODES.INVALID_FORMAT, {
 *   field: 'email',
 * });
 * ```
 */
export class DomainException extends Error {
  /**
   * Error code used for i18n message resolution.
   * Defined in `error-codes.ts`, resolved in `GlobalExceptionFilter`.
   */
  public readonly code: string;

  /**
   * Optional metadata for precise error reporting.
   * Can include field names, additional details, or any context the
   * presentation layer needs to build a helpful error response.
   */
  public readonly metadata?: Record<string, unknown>;

  constructor(code: string, metadata?: Record<string, unknown>) {
    super(code);
    this.name = 'DomainException';
    this.code = code;
    this.metadata = metadata;
  }
}
