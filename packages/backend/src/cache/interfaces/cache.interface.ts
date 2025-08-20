export interface CacheOptions {
  ttl?: number;
  key?: string;
  disableCache?: boolean;
}

export interface CacheStats {
  hits?: number;
  misses?: number;
  keys?: number;
  memory?: number;
}
