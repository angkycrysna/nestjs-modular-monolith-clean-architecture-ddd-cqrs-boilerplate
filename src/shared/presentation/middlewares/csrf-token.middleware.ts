import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { Request, Response, NextFunction } from 'express';

const CSRF_COOKIE_NAME = 'csrf-token';

/**
 * Sets a CSRF token cookie on every response if not already present.
 *
 * The cookie is:
 *   - NOT httpOnly → frontend JavaScript can read it
 *   - secure       → only sent over HTTPS in production
 *   - sameSite     → strict, prevents cross-site sending
 *
 * The frontend reads this cookie and sends it back as the
 * x-csrf-token header on state-changing requests (POST/PUT/PATCH/DELETE).
 *
 * Only active when CSRF_ENABLED=true.
 */
@Injectable()
export class CsrfTokenMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const csrfEnabled = this.configService.get<boolean>('security.csrfEnabled');
    if (!csrfEnabled) return next();

    const existingToken = (req.cookies as Record<string, string>)?.[
      CSRF_COOKIE_NAME
    ];

    if (!existingToken) {
      const token = randomBytes(32).toString('hex');
      const isProduction =
        this.configService.get<string>('app.nodeEnv') === 'production';

      res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
      });
    }

    next();
  }
}
