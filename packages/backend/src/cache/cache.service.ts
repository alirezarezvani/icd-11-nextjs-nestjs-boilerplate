import { Injectable, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { ConfigService } from "@nestjs/config";
import { CacheOptions, CacheStats } from "./interfaces/cache.interface";

@Injectable()
export class CacheService {
  private readonly keyPrefix: string;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.keyPrefix = this.configService.get("cache.keyPrefix", "icd11:");
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
    const ttl = options?.ttl || this.configService.get("cache.ttl", 3600);

    // Use ttl as number for compatibility
    await this.cacheManager.set(prefixedKey, value, ttl as number);
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
    try {
      // If the cache store has a getStats method, call it
      if (typeof (this.cacheManager as any).store?.getStats === "function") {
        return (this.cacheManager as any).store.getStats();
      }
      return null;
    } catch (error) {
      console.error("Error getting cache stats:", error);
      return null;
    }
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
    const ttl = options?.ttl || this.configService.get("cache.ttl", 3600);

    // Try to get from cache first
    const cachedValue = await this.cacheManager.get<T>(prefixedKey);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    // Not in cache, execute function
    const result = await fn();

    // Cache the result
    await this.cacheManager.set(prefixedKey, result, ttl as number);

    return result;
  }
}
