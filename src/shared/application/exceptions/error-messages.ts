/**
 * Internationalized error messages.
 *
 * Maps error codes to human-readable messages in each supported locale.
 * The GlobalExceptionFilter reads the `Accept-Language` header and uses
 * this map to resolve a localized message for the response.
 *
 * To add a new language:
 *   1. Add a new key here (e.g., 'zh' for Chinese).
 *   2. Copy the 'en' block and translate each message.
 *   3. That's it — the filter picks it up automatically.
 *
 * To add a new error code:
 *   1. Add the code in `error-codes.ts`.
 *   2. Add translations for ALL supported languages below.
 */
export const ERROR_MESSAGES: Record<string, Record<string, string>> = {
  en: {
    // System
    INTERNAL_ERROR: 'An unexpected error occurred. Please try again later.',
    REQUEST_TIMEOUT: 'The request timed out. Please try again.',
    SERVICE_UNAVAILABLE:
      'The service is temporarily unavailable. Please try again later.',
    // Authentication & authorization
    UNAUTHENTICATED: 'Authentication is required to access this resource.',
    PERMISSION_DENIED: 'You do not have permission to perform this action.',
    // Rate limiting
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait before trying again.',
    // Validation
    VALIDATION_FAILED: 'Validation failed. Please check your input.',
    INVALID_FORMAT: 'The provided value has an invalid format.',
    REQUIRED_FIELD_MISSING: 'A required field is missing.',
    VALUE_TOO_SHORT: 'The provided value is too short.',
    VALUE_TOO_LONG: 'The provided value is too long.',
    VALUE_OUT_OF_RANGE: 'The provided value is out of the allowed range.',
    // Resource
    RESOURCE_NOT_FOUND: 'The requested resource was not found.',
    DUPLICATE_ENTRY: 'A record with the same value already exists.',
    RESOURCE_ALREADY_EXISTS: 'The resource already exists.',
    STATE_CONFLICT: 'This operation conflicts with the current state.',
    // Business logic
    OPERATION_NOT_ALLOWED: 'This operation is not allowed.',
    PRECONDITION_FAILED: 'A required condition was not met.',
    DELIVERY_FAILED: 'Failed to deliver. Please try again later.',
  },
  id: {
    // System
    INTERNAL_ERROR:
      'Terjadi kesalahan yang tidak terduga. Silakan coba lagi nanti.',
    REQUEST_TIMEOUT: 'Permintaan kedaluwarsa. Silakan coba lagi.',
    SERVICE_UNAVAILABLE:
      'Layanan sedang tidak tersedia. Silakan coba lagi nanti.',
    // Authentication & authorization
    UNAUTHENTICATED: 'Autentikasi diperlukan untuk mengakses sumber daya ini.',
    PERMISSION_DENIED: 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
    // Rate limiting
    RATE_LIMIT_EXCEEDED:
      'Terlalu banyak permintaan. Silakan tunggu sebelum mencoba lagi.',
    // Validation
    VALIDATION_FAILED: 'Validasi gagal. Silakan periksa input Anda.',
    INVALID_FORMAT: 'Nilai yang diberikan memiliki format yang tidak valid.',
    REQUIRED_FIELD_MISSING: 'Kolom wajib belum diisi.',
    VALUE_TOO_SHORT: 'Nilai yang diberikan terlalu pendek.',
    VALUE_TOO_LONG: 'Nilai yang diberikan terlalu panjang.',
    VALUE_OUT_OF_RANGE: 'Nilai yang diberikan di luar rentang yang diizinkan.',
    // Resource
    RESOURCE_NOT_FOUND: 'Sumber daya yang diminta tidak ditemukan.',
    DUPLICATE_ENTRY: 'Data dengan nilai yang sama sudah ada.',
    RESOURCE_ALREADY_EXISTS: 'Sumber daya sudah ada.',
    STATE_CONFLICT: 'Operasi ini bertentangan dengan kondisi saat ini.',
    // Business logic
    OPERATION_NOT_ALLOWED: 'Operasi ini tidak diizinkan.',
    PRECONDITION_FAILED: 'Kondisi yang diperlukan belum terpenuhi.',
    DELIVERY_FAILED: 'Gagal mengirim. Silakan coba lagi nanti.',
  },

  // Add more languages:
  // zh: { INTERNAL_ERROR: '发生了意外错误，请稍后重试。', ... },
};

/** Default locale when Accept-Language is not provided or not supported. */
export const DEFAULT_LOCALE = 'en';

/** All supported locales. */
export const SUPPORTED_LOCALES = Object.keys(ERROR_MESSAGES);

/**
 * Resolves an error code to a localized message.
 *
 * @param code - The error code (e.g., 'INTERNAL_ERROR').
 * @param locale - The desired locale (e.g., 'en', 'id').
 * @returns The localized message, or a fallback if not found.
 */
export function resolveErrorMessage(code: string, locale: string): string {
  const effectiveLocale = SUPPORTED_LOCALES.includes(locale)
    ? locale
    : DEFAULT_LOCALE;

  return (
    ERROR_MESSAGES[effectiveLocale]?.[code] ??
    ERROR_MESSAGES[DEFAULT_LOCALE]?.[code] ??
    `Error: ${code}`
  );
}
