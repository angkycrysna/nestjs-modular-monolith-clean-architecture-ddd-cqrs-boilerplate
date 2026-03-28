import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { Request } from 'express';
import { SKIP_HMAC_KEY } from '../decorators/skip-hmac.decorator';

const HMAC_SIGNATURE_HEADER = 'x-hmac-signature';
const HMAC_TIMESTAMP_HEADER = 'x-hmac-timestamp';
const MAX_TIMESTAMP_DIFF_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Global HMAC guard.
 *
 * When HMAC_ENABLED=true:
 *   - Every request must include x-hmac-signature and x-hmac-timestamp headers.
 *   - The signature is computed as: HMAC-SHA256(secret, timestamp.method.path.body)
 *   - Requests older than 5 minutes are rejected (replay attack protection).
 *
 * When HMAC_ENABLED=false:
 *   - All requests pass through (guard is a no-op).
 *
 * Endpoints decorated with @SkipHmac() always bypass validation.
 *
 * Frontend signing example (TypeScript):
 *
 *   import { createHmac } from 'crypto'; // or use Web Crypto API in browser
 *
 *   const timestamp = Date.now().toString();
 *   const body = JSON.stringify(payload) || '';
 *   const message = `${timestamp}.${method}.${path}.${body}`;
 *   const signature = createHmac('sha256', HMAC_SECRET).update(message).digest('hex');
 *
 *   fetch(url, {
 *     method,
 *     headers: {
 *       'x-hmac-signature': signature,
 *       'x-hmac-timestamp': timestamp,
 *     },
 *     body: JSON.stringify(payload),
 *   });
 */
@Injectable()
export class HmacGuard implements CanActivate {
  private readonly logger = new Logger(HmacGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if HMAC is globally disabled
    const hmacEnabled = this.configService.get<boolean>('security.hmacEnabled');
    if (!hmacEnabled) return true;

    // Check if endpoint is decorated with @SkipHmac()
    const skipHmac = this.reflector.getAllAndOverride<boolean>(SKIP_HMAC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipHmac) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const signature = request.headers[HMAC_SIGNATURE_HEADER] as string;
    const timestamp = request.headers[HMAC_TIMESTAMP_HEADER] as string;

    if (!signature || !timestamp) {
      throw new UnauthorizedException('Missing HMAC signature or timestamp');
    }

    // Reject stale requests (replay attack protection)
    const timestampMs = parseInt(timestamp, 10);
    const now = Date.now();
    if (
      isNaN(timestampMs) ||
      Math.abs(now - timestampMs) > MAX_TIMESTAMP_DIFF_MS
    ) {
      throw new UnauthorizedException('HMAC timestamp expired or invalid');
    }

    // Rebuild the signature
    const secret = this.configService.get<string>('security.hmacSecret')!;
    const body = request.body ? JSON.stringify(request.body) : '';
    const message = `${timestamp}.${request.method}.${request.path}.${body}`;

    const expectedSignature = createHmac('sha256', secret)
      .update(message)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, 'utf-8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      this.logger.warn(
        `HMAC validation failed for ${request.method} ${request.path}`,
      );
      throw new UnauthorizedException('Invalid HMAC signature');
    }

    return true;
  }
}
