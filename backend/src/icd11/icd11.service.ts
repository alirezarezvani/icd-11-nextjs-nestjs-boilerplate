import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ICD11SearchDto } from '../common/dto/icd11-search.dto';
import { 
  ICD11AuthResponse, 
  ICD11SearchResult, 
  ICD11Entity 
} from '../common/interfaces/icd11.interface';
import { PaginatedResponse } from '../common/interfaces/common.interface';
import { ErrorHandlerUtil } from '../common/utils';
import axios, { AxiosError } from 'axios';
import { SearchDto } from './dto/search.dto';
import { map } from 'rxjs/operators';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface WHOTitle {
  [key: string]: string;
  en: string;
}

interface WHODefinition {
  [key: string]: string;
  en: string;
}

interface WHOEntity {
  id: string;
  title: WHOTitle;
  definition?: WHODefinition;
}

interface WHOSearchResponse {
  destinationEntities: WHOEntity[];
}

interface WHOChildrenResponse {
  children?: WHOEntity[];
  total?: number;
}

interface WHOSearchRequest {
  q: string;
  useFlexisearch: boolean;
  flatResults: boolean;
  highlightingEnabled: boolean;
}

interface WHOEntityResponse {
  id: string;
  title: WHOTitle;
  definition?: WHODefinition;
}

interface ICD11Config {
  baseUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  defaultLanguage: string;
}

@Injectable()
export class ICD11Service {
  private readonly logger = new Logger(ICD11Service.name);
  private readonly icd11Config: ICD11Config;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    const clientId = this.configService.get<string>('ICD11_CLIENT_ID');
    const clientSecret = this.configService.get<string>('ICD11_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Missing ICD11 OAuth2 configuration');
    }

    this.icd11Config = {
      baseUrl: this.configService.get<string>('ICD11_API_URL') || 'https://icd.who.int/icdapi',
      tokenUrl: 'https://icdaccessmanagement.who.int/connect/token',
      clientId,
      clientSecret,
      scope: 'icdapi_access',
      defaultLanguage: 'en',
    };
  }

  /**
   * Get access token from WHO API
   */
  private async getAccessToken(): Promise<string> {
    const cacheKey = 'icd11_access_token';
    const cachedToken = await this.cacheManager.get<string>(cacheKey);

    if (cachedToken) {
      return cachedToken;
    }

    this.logger.log('Fetching new access token from WHO API');

    try {
      const auth = Buffer.from(
        `${this.icd11Config.clientId}:${this.icd11Config.clientSecret}`,
      ).toString('base64');

      this.logger.log(`Requesting token from: ${this.icd11Config.tokenUrl}`);
      this.logger.log(`Using client ID: ${this.icd11Config.clientId}`);

      const response = await firstValueFrom(
        this.httpService
          .post<TokenResponse>(
            this.icd11Config.tokenUrl,
            new URLSearchParams({
              grant_type: 'client_credentials',
              scope: 'icdapi_access',
            }),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${auth}`,
              },
            },
          )
          .pipe(map((res) => res.data)),
      );

      this.logger.log('Token response received:', response);

      await this.cacheManager.set(cacheKey, response.access_token, response.expires_in - 60);

      return response.access_token;
    } catch (error: unknown) {
      this.logger.error('Failed to get access token:', error);
      if (error instanceof AxiosError && error.response) {
        this.logger.error('Error response:', error.response.data);
      }
      throw new Error('Failed to get access token from WHO API');
    }
  }

  private ensureString(value: string | undefined): string {
    return value || '';
  }

  /**
   * Search for ICD-11 entities
   */
  async search(term: string, language: string): Promise<ICD11Entity[]> {
    try {
      const token = await this.getAccessToken();
      const response = await firstValueFrom(
        this.httpService.get<WHOSearchResponse>(
          `${this.icd11Config.baseUrl}/release/11/2024-01/mms/search`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'API-Version': 'v2',
              Accept: 'application/json',
              'Accept-Language': language || this.icd11Config.defaultLanguage,
            },
            params: {
              q: term,
              useFlexisearch: true,
              flatResults: true,
              includeDescendants: false,
              page: 1,
              limit: 20,
            },
          },
        ),
      );

      this.logger.log(`Search response received: ${JSON.stringify(response.data)}`);

      return response.data.destinationEntities.map((entity): ICD11Entity => {
        const titleValues = Object.values(entity.title).filter(Boolean) as string[];
        const definitionValues = entity.definition ? Object.values(entity.definition).filter(Boolean) as string[] : [];
        
        const title = entity.title[language] || 
                     entity.title.en || 
                     titleValues[0] || 
                     'Untitled';
                     
        const definition = entity.definition?.[language] || 
                          entity.definition?.en || 
                          definitionValues[0] || 
                          'No definition available';
        
        return {
          id: entity.id,
          title,
          definition,
        };
      });
    } catch (error: unknown) {
      this.logger.error('Search failed:');
      if (error instanceof AxiosError && error.response) {
        this.logger.error(error.response.data);
      } else {
        this.logger.error(error);
      }
      throw new Error('Failed to search ICD-11 entities');
    }
  }

  /**
   * Get entity by ID
   */
  async getEntityById(
    id: string,
    language = this.icd11Config.defaultLanguage,
  ): Promise<ICD11Entity> {
    const cacheKey = `entity:${id}:${language}`;
    const cachedResult = await this.cacheManager.get<ICD11Entity>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    try {
      const accessToken = await this.getAccessToken();

      const response = await firstValueFrom(
        this.httpService
          .get<WHOEntityResponse>(`${this.icd11Config.baseUrl}/entity/${id}`, {
            headers: {
              'API-Version': 'v2',
              Accept: 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          })
          .pipe(map((res) => res.data)),
      );

      const data: ICD11Entity = {
        id: response.id,
        title: response.title['@value'],
        definition: response.definition?.['@value'],
      };

      await this.cacheManager.set(cacheKey, data, 3600);
      return data;
    } catch (error) {
      this.logger.error('Failed to get entity:', error);
      throw new Error('Failed to get ICD-11 entity');
    }
  }

  /**
   * Get children of an entity
   */
  async getChildren(
    id: string,
    language = this.icd11Config.defaultLanguage,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<ICD11Entity>> {
    const cacheKey = `children:${id}:${language}:${page}:${limit}`;
    const cachedResult = await this.cacheManager.get<PaginatedResponse<ICD11Entity>>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    try {
      const accessToken = await this.getAccessToken();

      const response = await firstValueFrom(
        this.httpService
          .get<WHOChildrenResponse>(`${this.icd11Config.baseUrl}/entity/${id}/children`, {
            params: {
              page,
              limit,
            },
            headers: {
              'API-Version': 'v2',
              Accept: 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          })
          .pipe(map((res) => res.data)),
      );

      const results: PaginatedResponse<ICD11Entity> = {
        data: (response.children || []).map((child: WHOEntity) => ({
          id: child.id,
          title: child.title['@value'],
          definition: child.definition?.['@value'],
        })),
        meta: {
          total: response.total || 0,
          page,
          limit,
          pages: Math.ceil((response.total || 0) / limit),
        },
      };

      await this.cacheManager.set(cacheKey, results, 3600);
      return results;
    } catch (error) {
      this.logger.error('Failed to get children:', error);
      throw new Error('Failed to get ICD-11 entity children');
    }
  }
} 