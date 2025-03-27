import { registerAs } from '@nestjs/config';

export interface AppConfig {
  port: number;
  env: string;
  nodeEnv: string;
  corsOrigins: string[];
}

export interface ICD11Config {
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  defaultLanguage: string;
  resultsPerPage: number;
}

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  ttl: number;
  keyPrefix: string;
}

export const appConfig = registerAs('app', (): AppConfig => ({
  port: parseInt(process.env.PORT || '3001', 10),
  env: process.env.APP_ENV || 'development',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
}));

export const icd11Config = registerAs('icd11', (): ICD11Config => ({
  apiBaseUrl: process.env.ICD11_API_BASE_URL || 'https://id.who.int/icd/release/11',
  clientId: process.env.ICD11_CLIENT_ID || '',
  clientSecret: process.env.ICD11_CLIENT_SECRET || '',
  tokenUrl: process.env.ICD11_TOKEN_URL || 'https://icdaccessmanagement.who.int/connect/token',
  defaultLanguage: process.env.ICD11_DEFAULT_LANGUAGE || 'en',
  resultsPerPage: parseInt(process.env.ICD11_RESULTS_PER_PAGE || '20', 10),
}));

export const cacheConfig = registerAs('cache', (): CacheConfig => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : undefined,
  ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hour in seconds
  keyPrefix: process.env.CACHE_KEY_PREFIX || 'icd11:',
}));

export default [appConfig, icd11Config, cacheConfig]; 