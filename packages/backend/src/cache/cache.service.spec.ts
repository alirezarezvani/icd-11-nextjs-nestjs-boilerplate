import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';

import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(async () => {
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
      wrap: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        if (key === 'cache.keyPrefix') return 'test:';
        if (key === 'cache.ttl') return 3600;
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should retrieve value from cache', async () => {
      const key = 'test-key';
      const expectedValue = { data: 'test-data' };
      
      cacheManager.get.mockResolvedValue(expectedValue);

      const result = await service.get(key);

      expect(result).toBe(expectedValue);
      expect(cacheManager.get).toHaveBeenCalledWith('test:' + key);
    });

    it('should return null for non-existent keys', async () => {
      const key = 'non-existent-key';
      
      cacheManager.get.mockResolvedValue(null);

      const result = await service.get(key);

      expect(result).toBeNull();
      expect(cacheManager.get).toHaveBeenCalledWith('test:' + key);
    });

    it('should handle cache manager errors gracefully', async () => {
      const key = 'error-key';
      const error = new Error('Cache connection failed');
      
      cacheManager.get.mockRejectedValue(error);

      await expect(service.get(key)).rejects.toThrow('Cache connection failed');
    });
  });

  describe('set', () => {
    it('should store value in cache with TTL', async () => {
      const key = 'test-key';
      const value = { data: 'test-data' };
      const ttl = 3600;
      
      cacheManager.set.mockResolvedValue(undefined);

      await service.set(key, value, { ttl });

      expect(cacheManager.set).toHaveBeenCalledWith('test:' + key, value, ttl);
    });

    it('should store value in cache without TTL', async () => {
      const key = 'test-key';
      const value = { data: 'test-data' };
      
      cacheManager.set.mockResolvedValue(undefined);

      await service.set(key, value);

      expect(cacheManager.set).toHaveBeenCalledWith('test:' + key, value, 3600);
    });

    it('should handle various data types', async () => {
      const testCases = [
        { key: 'string-key', value: 'string-value' },
        { key: 'number-key', value: 42 },
        { key: 'object-key', value: { nested: { data: 'test' } } },
        { key: 'array-key', value: [1, 2, 3, 'test'] },
        { key: 'boolean-key', value: true },
      ];

      cacheManager.set.mockResolvedValue(undefined);

      for (const testCase of testCases) {
        await service.set(testCase.key, testCase.value);
        expect(cacheManager.set).toHaveBeenCalledWith('test:' + testCase.key, testCase.value, 3600);
      }

      expect(cacheManager.set).toHaveBeenCalledTimes(testCases.length);
    });
  });

  describe('delete', () => {
    it('should delete value from cache', async () => {
      const key = 'test-key';
      
      cacheManager.del.mockResolvedValue(undefined);

      await service.del(key);

      expect(cacheManager.del).toHaveBeenCalledWith('test:' + key);
    });

    it('should handle deletion of non-existent keys', async () => {
      const key = 'non-existent-key';
      
      cacheManager.del.mockResolvedValue(undefined);

      await service.del(key);

      expect(cacheManager.del).toHaveBeenCalledWith('test:' + key);
    });
  });

  describe('reset', () => {
    it('should clear all cache entries', async () => {
      cacheManager.reset.mockResolvedValue(undefined);

      await service.reset();

      expect(cacheManager.reset).toHaveBeenCalledWith();
    });

    it('should handle reset errors', async () => {
      const error = new Error('Reset failed');
      
      cacheManager.reset.mockRejectedValue(error);

      await expect(service.reset()).rejects.toThrow('Reset failed');
    });
  });

  describe('wrap', () => {
    it('should wrap function with caching', async () => {
      const key = 'wrapped-key';
      const expectedValue = { computed: 'result' };
      const computeFunction = jest.fn().mockResolvedValue(expectedValue);
      const ttl = 1800;
      
      // Mock cache miss (not found)
      cacheManager.get.mockResolvedValue(undefined);
      cacheManager.set.mockResolvedValue(undefined);

      const result = await service.wrap(key, computeFunction, { ttl });

      expect(result).toBe(expectedValue);
      expect(cacheManager.get).toHaveBeenCalledWith('test:' + key);
      expect(cacheManager.set).toHaveBeenCalledWith('test:' + key, expectedValue, ttl);
      expect(computeFunction).toHaveBeenCalledTimes(1);
    });

    it('should return cached value without calling function', async () => {
      const key = 'cached-key';
      const cachedValue = { cached: 'data' };
      const computeFunction = jest.fn();
      
      // Mock cache hit (found)
      cacheManager.get.mockResolvedValue(cachedValue);

      const result = await service.wrap(key, computeFunction);

      expect(result).toBe(cachedValue);
      expect(cacheManager.get).toHaveBeenCalledWith('test:' + key);
      expect(computeFunction).not.toHaveBeenCalled();
    });

    it('should handle async compute functions', async () => {
      const key = 'async-key';
      const expectedValue = { async: 'result' };
      const asyncComputeFunction = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return expectedValue;
      });
      
      cacheManager.wrap.mockImplementation(async (key, fn) => {
        return await fn();
      });

      const result = await service.wrap(key, asyncComputeFunction);

      expect(result).toBe(expectedValue);
      expect(asyncComputeFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have access to cache manager', () => {
      expect(cacheManager).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should propagate cache manager errors', async () => {
      const error = new Error('Redis connection lost');
      
      cacheManager.get.mockRejectedValue(error);
      cacheManager.set.mockRejectedValue(error);
      cacheManager.del.mockRejectedValue(error);

      await expect(service.get('key')).rejects.toThrow('Redis connection lost');
      await expect(service.set('key', 'value')).rejects.toThrow('Redis connection lost');
      await expect(service.del('key')).rejects.toThrow('Redis connection lost');
    });
  });
});