import { registerAs } from '@nestjs/config';

export const securityConfig = registerAs('security', () => ({
  throttleTtlMs: parseInt(process.env.THROTTLE_TTL_MS!, 10) || 60000,
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT!, 10) || 10,
  corsOrigins: process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()) || [
    '*',
  ],
  maxBodySize: process.env.MAX_BODY_SIZE || '10mb',
  hmacEnabled: process.env.HMAC_ENABLED === 'true',
  hmacSecret: process.env.HMAC_SECRET || '',
  csrfEnabled: process.env.CSRF_ENABLED === 'true',
}));
