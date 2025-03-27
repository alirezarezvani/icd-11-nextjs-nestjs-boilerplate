import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ICD11Service {
  private readonly logger = new Logger(ICD11Service.name);
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  private readonly baseUrl = 'https://id.who.int/icd/release/11';
  
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {}
  
  /**
   * Authenticate with the WHO API using client credentials
   */
  private async authenticate(): Promise<string> {
    try {
      // Check if we have a valid token
      if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
        return this.token;
      }
      
      const clientId = this.configService.get<string>('WHO_API_CLIENT_ID');
      const clientSecret = this.configService.get<string>('WHO_API_CLIENT_SECRET');
      
      if (!clientId || !clientSecret) {
        throw new Error('WHO API credentials not configured');
      }
      
      const tokenUrl = 'https://icdaccessmanagement.who.int/connect/token';
      const payload = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'icdapi_access',
      });
      
      const { data } = await firstValueFrom(
        this.httpService.post(tokenUrl, payload, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );
      
      this.token = data.access_token;
      this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);
      
      return this.token;
    } catch (error) {
      this.logger.error(`Authentication failed: ${error.message}`);
      throw new Error('Failed to authenticate with WHO API');
    }
  }
  
  /**
   * Search ICD-11 by term
   */
  async search(term: string, language = 'en'): Promise<any> {
    const cacheKey = `search:${language}:${term}`;
    
    // Try to get from cache first
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    try {
      const token = await this.authenticate();
      const url = `${this.baseUrl}/search?q=${encodeURIComponent(term)}&useFlexisearch=true&flatResults=true&language=${language}`;
      
      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }),
      );
      
      // Cache the result
      await this.cacheService.set(cacheKey, data);
      
      return data;
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`);
      throw new Error('Failed to search ICD-11');
    }
  }
  
  /**
   * Get ICD-11 entity by ID
   */
  async getEntity(id: string, language = 'en'): Promise<any> {
    const cacheKey = `entity:${language}:${id}`;
    
    // Try to get from cache first
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    try {
      const token = await this.authenticate();
      const url = `${this.baseUrl}/${id}?language=${language}`;
      
      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }),
      );
      
      // Cache the result
      await this.cacheService.set(cacheKey, data);
      
      return data;
    } catch (error) {
      this.logger.error(`Get entity failed: ${error.message}`);
      throw new Error(`Failed to get ICD-11 entity: ${id}`);
    }
  }
} 