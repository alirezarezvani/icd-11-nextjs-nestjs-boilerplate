import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private readonly redis: Redis;
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTtl = 3600; // 1 hour in seconds

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    
    this.redis = new Redis({
      host,
      port,
      retryStrategy: (times) => {
        if (times > 3) {
          this.logger.error(`Could not connect to Redis at ${host}:${port} after ${times} attempts`);
          return null; // stop retrying
        }
        return Math.min(times * 100, 3000); // wait between 100ms and 3s
      },
    });
    
    this.redis.on('connect', () => {
      this.logger.log(`Connected to Redis at ${host}:${port}`);
    });
    
    this.redis.on('error', (error) => {
      this.logger.error(`Redis connection error: ${error.message}`);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error retrieving key ${key} from cache: ${error.message}`);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = this.defaultTtl): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      this.logger.error(`Error setting key ${key} in cache: ${error.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Error deleting key ${key} from cache: ${error.message}`);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      this.logger.error(`Error retrieving keys with pattern ${pattern}: ${error.message}`);
      return [];
    }
  }

  async flushAll(): Promise<void> {
    try {
      await this.redis.flushall();
    } catch (error) {
      this.logger.error(`Error flushing cache: ${error.message}`);
    }
  }
} 