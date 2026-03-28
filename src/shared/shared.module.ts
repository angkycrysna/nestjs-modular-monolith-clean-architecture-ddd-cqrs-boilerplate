import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import {
  appConfig,
  securityConfig,
  databaseConfig,
  validateEnv,
} from './infrastructure/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { MessagingModule } from './infrastructure/messaging/messaging.module';
import { ActivityLogModule } from './infrastructure/activity-log/activity-log.module';
import { CacheModule } from './infrastructure/cache/cache.module';
import { AppLoggerModule } from './infrastructure/logger/logger.module';
import { UNIT_OF_WORK } from './application/interfaces/unit-of-work.interface';
import { TypeOrmUnitOfWork } from './infrastructure/persistence/typeorm/unit-of-work';
import { HealthController } from './presentation/controllers/health.controller';
import { HmacGuard } from './presentation/guards/hmac.guard';
import { CsrfGuard } from './presentation/guards/csrf.guard';
import { CsrfTokenMiddleware } from './presentation/middlewares/csrf-token.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, securityConfig, databaseConfig],
      validate: validateEnv,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('security.throttleTtlMs')!,
          limit: config.get<number>('security.throttleLimit')!,
        },
      ],
    }),
    DatabaseModule,
    MessagingModule,
    ActivityLogModule,
    CacheModule,
    AppLoggerModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: HmacGuard },
    { provide: APP_GUARD, useClass: CsrfGuard },
    { provide: UNIT_OF_WORK, useClass: TypeOrmUnitOfWork },
  ],
  exports: [MessagingModule, ActivityLogModule, CacheModule, UNIT_OF_WORK],
})
export class SharedModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CsrfTokenMiddleware).forRoutes('*path');
  }
}
