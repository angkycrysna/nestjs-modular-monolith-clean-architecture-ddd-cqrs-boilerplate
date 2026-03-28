import { Controller, Get } from '@nestjs/common';
import { SkipHmac } from '../decorators/skip-hmac.decorator';
import { SkipCsrf } from '../decorators/skip-csrf.decorator';

@SkipHmac()
@SkipCsrf()
@Controller({ path: 'health', version: '1' })
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}
