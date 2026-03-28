import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import type { ICacheManager } from '@shared/application/interfaces/cache-manager.interface';

/**
 * Redis-based cache manager implementing ICacheManager.
 *
 * If Redis is not available (null client), all operations are no-ops.
 * This allows the app to run without Redis in development.
 */
@Injectable()
export class RedisCacheService implements ICacheManager, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);

  constructor(private readonly redis: Redis | null) {}

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    const raw = await this.redis.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.redis) return;
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redis.set(key, serialized, 'EX', ttlSeconds);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redis) return;
    await this.redis.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    if (!this.redis) return;
    // Use SCAN instead of KEYS to avoid blocking Redis in production
    const stream = this.redis.scanStream({ match: pattern, count: 100 });
    const pipeline = this.redis.pipeline();
    let count = 0;

    await new Promise<void>((resolve, reject) => {
      stream.on('data', (keys: string[]) => {
        for (const key of keys) {
          pipeline.del(key);
          count++;
        }
      });
      stream.on('end', () => {
        if (count > 0) {
          pipeline
            .exec()
            .then(() => resolve())
            .catch(reject);
        } else {
          resolve();
        }
      });
      stream.on('error', reject);
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.logger.log('Redis connection closed');
    }
  }
}
