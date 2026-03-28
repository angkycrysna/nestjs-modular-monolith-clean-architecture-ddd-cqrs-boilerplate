/**
 * Centralized error code registry.
 *
 * All error codes live here — one place to manage, one place to change.
 * The GlobalExceptionFilter maps these codes to localized messages
 * using `error-messages.ts`.
 *
 * Convention (follows Google AIP-193 style):
 *   - UPPER_SNAKE_CASE descriptive codes
 *   - Codes describe the ERROR, not the resource — never expose module/table names
 *   - Use metadata for context (field name, resource type) when needed
 *   - When adding a new code, also add its translations in `error-messages.ts`
 *
 * @example
 * ```typescript
 * throw new DomainException(ERROR_CODES.INVALID_FORMAT, { field: 'email' });
 * throw new ApplicationException(ERROR_CODES.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND);
 * ```
 */
export const ERROR_CODES = {
  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  // Authentication & authorization
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_FORMAT: 'INVALID_FORMAT',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  VALUE_TOO_SHORT: 'VALUE_TOO_SHORT',
  VALUE_TOO_LONG: 'VALUE_TOO_LONG',
  VALUE_OUT_OF_RANGE: 'VALUE_OUT_OF_RANGE',
  // Resource
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  STATE_CONFLICT: 'STATE_CONFLICT',
  // Business logic
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  PRECONDITION_FAILED: 'PRECONDITION_FAILED',
  DELIVERY_FAILED: 'DELIVERY_FAILED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
