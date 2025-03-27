import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { CacheOptions, CacheStats } from '../common/interfaces/cache.interface';

@Injectable()
export class CacheService {
  private readonly keyPrefix: string;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.keyPrefix = this.configService.get('cache.keyPrefix', 'icd11:');
  }

  /**
   * Generate a cache key with prefix
   */
  generateKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    const prefixedKey = this.generateKey(key);
    return this.cacheManager.get<T>(prefixedKey);
  }

  /**
   * Set a value in cache
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const prefixedKey = this.generateKey(key);
    const ttl = options?.ttl || this.configService.get('cache.ttl', 3600) * 1000;
    
    await this.cacheManager.set(prefixedKey, value, ttl);
  }

  /**
   * Remove a value from cache
   */
  async del(key: string): Promise<void> {
    const prefixedKey = this.generateKey(key);
    await this.cacheManager.del(prefixedKey);
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const prefixedKey = this.generateKey(key);
    const value = await this.cacheManager.get(prefixedKey);
    return value !== undefined;
  }

  /**
   * Get cache stats (if supported by store)
   */
  async getStats(): Promise<CacheStats | null> {
    // If the cache store has a getStats method, call it
    if (typeof (this.cacheManager as any).store?.getStats === 'function') {
      return (this.cacheManager as any).store.getStats();
    }
    return null;
  }

  /**
   * Reset cache
   */
  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  /**
   * Wrap a function with cache
   * If the value is in cache, return it
   * Otherwise, call the function and cache the result
   */
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    // If cache is disabled for this operation, just execute the function
    if (options?.disableCache) {
      return fn();
    }

    const prefixedKey = this.generateKey(options?.key || key);
    const ttl = options?.ttl || this.configService.get('cache.ttl', 3600) * 1000;
    
    return this.cacheManager.wrap<T>(prefixedKey, fn, ttl);
  }
} 