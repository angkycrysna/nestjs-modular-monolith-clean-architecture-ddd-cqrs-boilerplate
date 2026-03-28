import { Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CACHE_MANAGER } from '@shared/application/interfaces/cache-manager.interface';
import { RedisCacheService } from './redis-cache.service';

const REDIS_CLIENT = Symbol('REDIS_CLIENT');

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (config: ConfigService): Redis | null => {
        const logger = new Logger('CacheModule');
        const redisUrl = config.get<string>('REDIS_URL');

        if (!redisUrl) {
          logger.warn(
            'REDIS_URL not configured — cache operations will be no-ops',
          );
          return null;
        }

        const redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => Math.min(times * 200, 5000),
          lazyConnect: true,
        });

        redis.on('connect', () => logger.log('Redis connected'));
        redis.on('error', (err: Error) =>
          logger.error('Redis error', err.message),
        );

        void redis.connect();
        return redis;
      },
      inject: [ConfigService],
    },
    {
      provide: CACHE_MANAGER,
      useFactory: (redis: Redis | null) => new RedisCacheService(redis),
      inject: [REDIS_CLIENT],
    },
  ],
  exports: [CACHE_MANAGER],
})
export class CacheModule {}
