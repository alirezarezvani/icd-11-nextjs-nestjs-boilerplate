// Cache related interfaces

// Cache configuration
export interface CacheConfig {
  host: string;
  port: number;
  db?: number;
  password?: string;
  keyPrefix?: string;
  ttl: number; // Default TTL in seconds
}

// Cache options for individual operations
export interface CacheOptions {
  ttl?: number; // Override default TTL for specific items
  key?: string; // Custom key
  disableCache?: boolean; // Skip caching for this operation
}

// Cache statistics
export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  size: number; // Approximate memory usage
  uptime: number; // Redis uptime in seconds
} 