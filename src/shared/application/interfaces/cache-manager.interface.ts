/** Injection token for the cache manager. */
export const CACHE_MANAGER = Symbol('CACHE_MANAGER');

/**
 * Cache manager port — abstracts the caching layer.
 *
 * Modules opt-in to caching by injecting this interface.
 * The implementation uses Redis (ioredis) but can be swapped
 * to Memcached, in-memory, or any other cache backend.
 *
 * @example
 * ```typescript
 * @Inject(CACHE_MANAGER) private readonly cache: ICacheManager
 *
 * const cached = await this.cache.get<UserDto>('user:123');
 * if (!cached) {
 *   const user = await this.userRepo.findById('123');
 *   await this.cache.set('user:123', user, 3600); // TTL: 1 hour
 * }
 * ```
 */
export interface ICacheManager {
  /**
   * Retrieve a cached value by key.
   * Returns null if the key does not exist or has expired.
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Store a value in the cache.
   *
   * @param key - Cache key.
   * @param value - Value to cache (will be JSON-serialized).
   * @param ttlSeconds - Time-to-live in seconds. Omit for no expiration.
   */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /**
   * Remove a cached value by key.
   */
  del(key: string): Promise<void>;

  /**
   * Remove all cached values matching a key pattern.
   * Useful for cache invalidation (e.g., `del('user:*')` clears all user caches).
   *
   * @param pattern - Glob-style pattern (e.g., 'user:*').
   */
  delByPattern(pattern: string): Promise<void>;
}
