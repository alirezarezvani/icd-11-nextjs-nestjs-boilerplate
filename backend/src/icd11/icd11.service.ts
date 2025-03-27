import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CacheService } from '../cache/cache.service';
import { ICD11Config } from '../config';
import { ICD11SearchDto } from '../common/dto/icd11-search.dto';
import { 
  ICD11AuthResponse, 
  ICD11SearchResult, 
  ICD11Entity 
} from '../common/interfaces/icd11.interface';
import { PaginatedResponse } from '../common/interfaces/common.interface';
import { ErrorHandlerUtil } from '../common/utils';

// Define the WHO API response types
interface WHOEntityResponse {
  id: string;
  title?: { value: string };
  definition?: { value: string };
  longDefinition?: { value: string };
  code?: string;
  isLeaf?: boolean;
  parent?: {
    id: string;
    title?: { value: string };
    code?: string;
  };
  browserUrl?: string;
  includedTerms?: Array<{ value: string }>;
  excludedTerms?: Array<{ value: string }>;
  matchingPhrases?: string[];
  [key: string]: any;
}

interface WHOSearchResponse {
  destinationEntities?: Record<string, WHOEntityResponse>;
  total?: number;
  wordSuggestions?: string[];
  error?: string;
  [key: string]: any;
}

interface WHOChildrenResponse {
  children?: WHOEntityResponse[];
  total?: number;
  [key: string]: any;
}

@Injectable()
export class ICD11Service {
  private readonly logger = new Logger(ICD11Service.name);
  private readonly config: ICD11Config;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly cacheService: CacheService,
  ) {
    const config = this.configService.get<ICD11Config>('icd11');
    if (!config) {
      throw new Error('ICD11 configuration is missing');
    }
    this.config = config;
  }

  /**
   * Get an access token for WHO API
   */
  private async getAccessToken(): Promise<string> {
    // Check if we already have a valid token
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    // Try to get token from cache first
    const cachedToken = await this.cacheService.get<string>('auth:token');
    if (cachedToken) {
      this.accessToken = cachedToken;
      // Set expiry 5 minutes before actual expiry to account for processing time
      this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000); // 55 minutes
      return cachedToken;
    }

    this.logger.log('Fetching new access token from WHO API');

    try {
      const tokenResponse = await firstValueFrom(
        this.httpService.post<ICD11AuthResponse>(
          this.config.tokenUrl,
          new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            scope: 'icdapi_access',
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      this.accessToken = tokenResponse.data.access_token;
      
      // Set expiry based on the expires_in value from the response, minus 5 minutes for safety
      const expiresInMs = (tokenResponse.data.expires_in - 300) * 1000;
      this.tokenExpiry = new Date(Date.now() + expiresInMs);
      
      // Cache the token for future use
      await this.cacheService.set('auth:token', this.accessToken, { 
        ttl: tokenResponse.data.expires_in - 300 // 5 minutes less than the actual expiry
      });

      return this.accessToken;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get access token: ${errorMessage}`);
      throw new HttpException(
        'Failed to authenticate with ICD-11 API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Search for ICD-11 entities
   */
  async search(searchDto: ICD11SearchDto, page = 1, limit = 20): Promise<PaginatedResponse<ICD11SearchResult>> {
    const { term, language, flexisearch, flatResults, includeDescendants } = searchDto;
    
    if (!term || term.trim() === '') {
      throw new HttpException('Search term is required', HttpStatus.BAD_REQUEST);
    }

    const cacheKey = `search:${term}:${language}:${flexisearch}:${flatResults}:${includeDescendants}:${page}:${limit}`;
    
    try {
      // Use cache wrapper to get data
      return await this.cacheService.wrap<PaginatedResponse<ICD11SearchResult>>(
        cacheKey,
        async () => {
          const token = await this.getAccessToken();
          
          const searchUrl = new URL(`${this.config.apiBaseUrl}/search`);
          searchUrl.searchParams.append('q', term);
          
          if (language) {
            searchUrl.searchParams.append('language', language);
          }
          
          if (flexisearch !== undefined) {
            searchUrl.searchParams.append('flexisearch', String(flexisearch));
          }
          
          if (flatResults !== undefined) {
            searchUrl.searchParams.append('flatResults', String(flatResults));
          }
          
          if (includeDescendants !== undefined) {
            searchUrl.searchParams.append('includeDescendants', String(includeDescendants));
          }
          
          searchUrl.searchParams.append('page', String(page));
          searchUrl.searchParams.append('limit', String(limit));

          const response = await firstValueFrom(
            this.httpService.get<WHOSearchResponse>(searchUrl.toString(), {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
            }),
          );

          const { data } = response;
          const destinationEntities = data.destinationEntities || {};
          
          // Transform response to standardized format
          const results: ICD11SearchResult[] = Object.keys(destinationEntities).map(key => {
            const entity = destinationEntities[key];
            return {
              id: entity.id || key,
              title: entity.title?.value || '',
              code: entity.code,
              isLeaf: !!entity.isLeaf,
              matchingPhrases: entity.matchingPhrases || [],
            };
          });
          
          // Get total from response or use results length as fallback
          const total = data.total || results.length;

          return {
            data: results,
            meta: {
              page,
              limit,
              total,
              pages: Math.ceil(total / limit),
            },
          };
        },
        { ttl: 3600 }, // Cache for 1 hour
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Search failed: ${errorMessage}`);
      throw ErrorHandlerUtil.handleUnknownError(error, 'Search failed');
    }
  }

  /**
   * Get entity by ID
   */
  async getEntityById(id: string, language?: string): Promise<ICD11Entity> {
    const cacheKey = `entity:${id}:${language || 'en'}`;

    try {
      return await this.cacheService.wrap<ICD11Entity>(
        cacheKey,
        async () => {
          const token = await this.getAccessToken();
          
          const url = `${this.config.apiBaseUrl}/entity/${id}`;
          const response = await firstValueFrom(
            this.httpService.get<WHOEntityResponse>(url, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
              params: language ? { language } : {},
            }),
          );

          const entity = response.data;
          
          // Transform response to standardized entity format
          return {
            id: entity.id || id,
            title: entity.title?.value || '',
            code: entity.code,
            definition: entity.definition?.value,
            longDefinition: entity.longDefinition?.value,
            isLeaf: !!entity.isLeaf,
            parent: entity.parent ? { 
              id: entity.parent.id, 
              title: entity.parent.title?.value || '',
              code: entity.parent.code,
            } : undefined,
            browserUrl: entity.browserUrl,
            includedTerms: entity.includedTerms?.map(term => term.value) || [],
            excludedTerms: entity.excludedTerms?.map(term => term.value) || [],
          };
        },
        { ttl: 86400 }, // Cache for 24 hours
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get entity ${id}: ${errorMessage}`);
      throw ErrorHandlerUtil.handleUnknownError(error, `Failed to get entity ${id}`);
    }
  }

  /**
   * Get children of an entity
   */
  async getChildren(id: string, language?: string, page = 1, limit = 20): Promise<PaginatedResponse<ICD11Entity>> {
    const cacheKey = `children:${id}:${language || 'en'}:${page}:${limit}`;

    try {
      return await this.cacheService.wrap<PaginatedResponse<ICD11Entity>>(
        cacheKey,
        async () => {
          const token = await this.getAccessToken();
          
          const url = `${this.config.apiBaseUrl}/entity/${id}/children`;
          const response = await firstValueFrom(
            this.httpService.get<WHOChildrenResponse>(url, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
              params: {
                page,
                limit,
                ...(language ? { language } : {}),
              },
            }),
          );

          const { data } = response;
          const children = data.children || [];
          
          // Transform response to standardized format
          const results: ICD11Entity[] = children.map((child: WHOEntityResponse) => ({
            id: child.id,
            title: child.title?.value || '',
            code: child.code,
            isLeaf: !!child.isLeaf,
          }));

          return {
            data: results,
            meta: {
              page,
              limit,
              total: data.total || results.length,
              pages: Math.ceil((data.total || results.length) / limit),
            },
          };
        },
        { ttl: 3600 }, // Cache for 1 hour
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get children for entity ${id}: ${errorMessage}`);
      throw ErrorHandlerUtil.handleUnknownError(error, `Failed to get children for entity ${id}`);
    }
  }

  /**
   * Get parent entity
   */
  async getParent(id: string, language?: string): Promise<ICD11Entity> {
    try {
      // First, get the entity to find its parent reference
      const entity = await this.getEntityById(id, language);
      
      if (!entity.parent?.id) {
        throw new HttpException('Entity has no parent', HttpStatus.NOT_FOUND);
      }
      
      // Then get the parent entity
      return this.getEntityById(entity.parent.id, language);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get parent for entity ${id}: ${errorMessage}`);
      throw ErrorHandlerUtil.handleUnknownError(error, `Failed to get parent for entity ${id}`);
    }
  }
} 