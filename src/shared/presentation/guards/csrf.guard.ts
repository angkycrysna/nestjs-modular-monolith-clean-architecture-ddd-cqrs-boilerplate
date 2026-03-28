import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';
import { SKIP_CSRF_KEY } from '../decorators/skip-csrf.decorator';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Global CSRF guard using the double submit cookie pattern.
 *
 * When CSRF_ENABLED=true:
 *   - All requests must include an x-csrf-token header whose value
 *     matches the csrf-token cookie.
 *   - Use @SkipCsrf() to bypass on specific endpoints (health, public blog, etc.).
 *
 * When CSRF_ENABLED=false:
 *   - All requests pass through (guard is a no-op).
 *
 * Endpoints decorated with @SkipCsrf() always bypass validation.
 *
 * Frontend usage:
 *   1. On first request, backend sets a csrf-token cookie (non-httpOnly).
 *   2. Frontend reads the cookie: document.cookie or a cookie utility.
 *   3. Frontend sends it as a header on POST/PUT/PATCH/DELETE:
 *
 *      fetch('/api/v1/orders', {
 *        method: 'POST',
 *        headers: { 'x-csrf-token': getCookie('csrf-token') },
 *        credentials: 'include',
 *      });
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if CSRF is globally disabled
    const csrfEnabled = this.configService.get<boolean>('security.csrfEnabled');
    if (!csrfEnabled) return true;

    // Check if endpoint is decorated with @SkipCsrf()
    const skipCsrf = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipCsrf) return true;

    const request = context.switchToHttp().getRequest<Request>();

    const cookieToken = request.cookies?.[CSRF_COOKIE_NAME] as
      | string
      | undefined;
    const headerToken = request.headers[CSRF_HEADER_NAME] as string | undefined;

    if (!cookieToken || !headerToken) {
      throw new ForbiddenException('Missing CSRF token');
    }

    // Constant-time comparison to prevent timing attacks
    const cookieBuffer = Buffer.from(cookieToken, 'utf-8');
    const headerBuffer = Buffer.from(headerToken, 'utf-8');

    if (
      cookieBuffer.length !== headerBuffer.length ||
      !timingSafeEqual(cookieBuffer, headerBuffer)
    ) {
      this.logger.warn(
        `CSRF validation failed for ${request.method} ${request.path}`,
      );
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}
