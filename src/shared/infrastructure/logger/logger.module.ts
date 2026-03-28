import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import type { IncomingMessage } from 'http';
import { CORRELATION_ID_HEADER } from '@shared/presentation/interceptors/correlation-id.interceptor';

/**
 * Structured logging module using Pino.
 *
 * - Production: JSON output for log aggregation (Datadog, CloudWatch, ELK).
 * - Development: Human-readable output via pino-pretty.
 * - Correlation ID automatically attached to every log line from the request header.
 */
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get<string>('app.nodeEnv') === 'development';

        return {
          pinoHttp: {
            customProps: (req: IncomingMessage) => ({
              correlationId: req.headers[CORRELATION_ID_HEADER],
            }),
            autoLogging: {
              ignore: (req: IncomingMessage) =>
                (req.url ?? '').includes('/health'),
            },
            level: isDev ? 'debug' : 'info',
            transport: isDev
              ? {
                  target: 'pino-pretty',
                  options: { colorize: true, singleLine: true },
                }
              : undefined,
          },
        };
      },
    }),
  ],
})
export class AppLoggerModule {}
