import { NestFactory } from '@nestjs/core';
import { VersioningType, ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger as PinoLogger } from 'nestjs-pino';
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SecretManagerAdapter } from './shared/infrastructure/secrets/secret-manager.adapter';
import { GlobalExceptionFilter } from './shared/presentation/filters/global-exception.filter';
import { CorrelationIdInterceptor } from './shared/presentation/interceptors/correlation-id.interceptor';
import { LoggingInterceptor } from './shared/presentation/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './shared/presentation/interceptors/timeout.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // ── Step 1: Load secrets before app starts ──
  // Currently: Render env vars (no-op).
  // Future:    Update SecretManagerAdapter internals for AWS Secrets Manager.
  const secretManager = new SecretManagerAdapter();
  const secrets = await secretManager.load();
  Object.entries(secrets).forEach(([key, value]) => {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });

  // ── Step 2: Create NestJS app with Pino logger ──
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));
  const configService = app.get(ConfigService);

  // ── Step 3: Security middleware ──
  // Cookie parser — needed for CSRF double submit cookie pattern
  app.use(cookieParser());
  // Request body size limit — prevents large payload attacks
  const maxBodySize = configService.get<string>('security.maxBodySize')!;
  app.use(json({ limit: maxBodySize }));
  app.use(urlencoded({ extended: true, limit: maxBodySize }));
  // Helmet — tuned for a REST API (no browser pages)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          scriptSrc: ["'none'"],
          styleSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );

  const allowedOrigins = configService.get<string[]>('security.corsOrigins')!;
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (server-to-server, curl, health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // ── Step 4: API prefix & versioning ──
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ── Step 5: Global pipes ──
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Step 6: Global filters ──
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ── Step 7: Global interceptors ──
  const requestTimeout = configService.get<number>('app.requestTimeoutMs')!;
  app.useGlobalInterceptors(
    new CorrelationIdInterceptor(),
    new LoggingInterceptor(),
    new TimeoutInterceptor(requestTimeout),
  );

  // ── Step 8: Graceful shutdown ──
  app.enableShutdownHooks();

  // ── Step 9: Start ──
  const port = configService.get<number>('app.port')!;
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
}
void bootstrap();
