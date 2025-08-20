import {
  Injectable,
  Logger,
  Inject,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { ICD11Entity, ICD11SearchResult } from "@shared/types/icd11";
import { PaginatedResponse } from "@shared/types/api";
import { AxiosError } from "axios";
import { map } from "rxjs/operators";
import {
  TokenResponse,
  WHOChildrenResponse,
  WHODefinition,
  WHOEntity,
  WHOEntityResponse,
  WHOSearchResponse,
  WHOTitle,
  WHOV2Field,
} from "./who.interfaces";

interface ICD11Config {
  baseUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  defaultLanguage: string;
  releaseId: string;
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
    const clientId = this.configService.get<string>("ICD11_CLIENT_ID");
    const clientSecret = this.configService.get<string>("ICD11_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      throw new Error("Missing ICD11 OAuth2 configuration");
    }

    this.icd11Config = {
      baseUrl:
        this.configService.get<string>("ICD11_API_BASE_URL") ||
        "https://id.who.int/icd",
      tokenUrl:
        this.configService.get<string>("ICD11_TOKEN_URL") ||
        "https://icdaccessmanagement.who.int/connect/token",
      clientId,
      clientSecret,
      scope: "icdapi_access",
      defaultLanguage: "en",
      releaseId: "11/2024-01",
    };
  }

  private getApiUrl(path: string): string {
    return `${this.icd11Config.baseUrl}/release/${this.icd11Config.releaseId}${path}`;
  }

  private getMultilingualValue(
    field: WHOTitle | WHODefinition | string | { '@value': string; '@language': string } | undefined,
    language: string,
    fallback = "",
  ): string {
    if (!field) {
      return fallback;
    }
    
    // If field is already a string, clean HTML tags and return
    if (typeof field === 'string') {
      return this.cleanHtmlTags(field);
    }
    
    // Handle WHO API v2 format with @value property
    if (field && typeof field === 'object' && '@value' in field) {
      const v2Field = field as WHOV2Field;
      return this.cleanHtmlTags(v2Field['@value']);
    }
    
    // Handle multilingual object (fallback for search results)
    if (field && typeof field === 'object' && language in field) {
      const value = field[language];
      return value ? this.cleanHtmlTags(value) : fallback;
    }
    if (field && typeof field === 'object' && 'en' in field && field.en) {
      return this.cleanHtmlTags(field.en);
    }
    if (field && typeof field === 'object') {
      const values = Object.values(field).filter(Boolean);
      return values.length > 0 ? this.cleanHtmlTags(values[0] as string) : fallback;
    }
    
    return fallback;
  }

  private cleanHtmlTags(text: string): string {
    // Remove HTML tags like <em class='found'>...</em>
    return text.replace(/<[^>]*>/g, '');
  }

  private async getAccessToken(): Promise<string> {
    const cacheKey = "icd11_access_token";
    const cachedToken = await this.cacheManager.get<string>(cacheKey);

    if (cachedToken) {
      return cachedToken;
    }

    this.logger.log("Fetching new access token from WHO API");

    try {
      const auth = Buffer.from(
        `${this.icd11Config.clientId}:${this.icd11Config.clientSecret}`,
      ).toString("base64");

      const response = await firstValueFrom(
        this.httpService
          .post<TokenResponse>(
            this.icd11Config.tokenUrl,
            new URLSearchParams({
              grant_type: "client_credentials",
              scope: this.icd11Config.scope,
            }),
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${auth}`,
              },
            },
          )
          .pipe(map((res) => res.data)),
      );

      await this.cacheManager.set(
        cacheKey,
        response.access_token,
        response.expires_in - 60,
      );

      return response.access_token;
    } catch (error) {
      this.logger.error("Failed to get access token", error);
      if (error instanceof AxiosError && error.response) {
        this.logger.error("Error response:", error.response.data);
      }
      throw new HttpException(
        "Failed to authenticate with WHO API",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async search(
    term: string,
    language: string,
    page: number,
    limit: number,
    flexisearch: boolean,
  ): Promise<PaginatedResponse<ICD11SearchResult>> {
    try {
      const token = await this.getAccessToken();
      const response = await firstValueFrom(
        this.httpService.get<WHOSearchResponse>(
          this.getApiUrl("/mms/search"),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "API-Version": "v2",
              Accept: "application/json",
              "Accept-Language": language || this.icd11Config.defaultLanguage,
            },
            params: {
              q: term,
              useFlexisearch: flexisearch,
              flatResults: true,
              page,
              limit,
            },
          },
        ),
      );

      const data = response.data.destinationEntities.map(
        (entity): ICD11SearchResult => ({
          id: entity.id,
          title: this.getMultilingualValue(
            entity.title,
            language,
            "Untitled",
          ),
          isLeaf: false, // Cannot determine from search results, will be properly set when entity details are fetched
        }),
      );

      return {
        data,
        meta: {
          page,
          limit,
          total: data.length, // WHO search API does not provide total count
          totalPages: 1, // Assuming single page for now
        },
      };
    } catch (error) {
      this.logger.error("Search failed:", error);
      throw new HttpException("Search failed", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

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

      // The entity ID is already a full URL, use it directly
      const entityUrl = id.startsWith('http') ? id : `${this.icd11Config.baseUrl}/entity/${id}`;
      
      const response = await firstValueFrom(
        this.httpService
          .get<WHOEntityResponse>(entityUrl, {
            headers: {
              "API-Version": "v2",
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
              "Accept-Language": language,
            },
          })
          .pipe(map((res) => res.data)),
      );


      const data: ICD11Entity = {
        id: response['@id'] || response.id || id,
        title: this.getMultilingualValue(response.title, language),
        definition: this.getMultilingualValue(response.definition, language),
        code: response.code,
        // Proper leaf detection based on WHO API classKind
        // 'category' = can have children, 'class' = leaf node
        isLeaf: response.classKind !== 'category',
      };

      await this.cacheManager.set(cacheKey, data, 3600);
      return data;
    } catch (error) {
      this.logger.error(`Failed to get entity ${id}:`, error);
      if (error instanceof AxiosError && error.response?.status === 404) {
        throw new HttpException("Entity not found", HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        "Failed to retrieve entity",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getChildren(
    id: string,
    language = this.icd11Config.defaultLanguage,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<ICD11Entity>> {
    const cacheKey = `children:${id}:${language}:${page}:${limit}`;
    const cachedResult =
      await this.cacheManager.get<PaginatedResponse<ICD11Entity>>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    try {
      const accessToken = await this.getAccessToken();

      // Handle entity URL for children endpoint
      const baseEntityUrl = id.startsWith('http') ? id : `${this.icd11Config.baseUrl}/entity/${id}`;
      const childrenUrl = `${baseEntityUrl}/children`;
      
      const response = await firstValueFrom(
        this.httpService
          .get<WHOChildrenResponse>(childrenUrl,
            {
              params: { page, limit },
              headers: {
                "API-Version": "v2",
                Accept: "application/json",
                Authorization: `Bearer ${accessToken}`,
                "Accept-Language": language,
              },
            },
          )
          .pipe(map((res) => res.data)),
      );

      const data = (response.children || []).map((child: WHOEntity) => ({
        id: child.id,
        title: this.getMultilingualValue(child.title, language),
        definition: this.getMultilingualValue(child.definition, language),
      }));

      const total = response.total || 0;
      const totalPages = Math.ceil(total / limit);

      const results: PaginatedResponse<ICD11Entity> = {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      };

      await this.cacheManager.set(cacheKey, results, 3600);
      return results;
    } catch (error) {
      this.logger.error(`Failed to get children for ${id}:`, error);
      if (error instanceof AxiosError && error.response?.status === 404) {
        // 404 means no children exist for this entity, return empty results
        const emptyResults: PaginatedResponse<ICD11Entity> = {
          data: [],
          meta: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        };
        await this.cacheManager.set(cacheKey, emptyResults, 3600);
        return emptyResults;
      }
      throw new HttpException(
        "Failed to get entity children",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getParent(
    id: string,
    language = this.icd11Config.defaultLanguage,
  ): Promise<ICD11Entity> {
    const cacheKey = `parent:${id}:${language}`;
    const cachedResult = await this.cacheManager.get<ICD11Entity>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    try {
      const accessToken = await this.getAccessToken();

      // Handle entity URL for parent endpoint  
      const baseEntityUrl = id.startsWith('http') ? id : `${this.icd11Config.baseUrl}/entity/${id}`;
      const parentUrl = `${baseEntityUrl}/parent`;
      
      const response = await firstValueFrom(
        this.httpService
          .get<WHOEntity[]>(parentUrl, {
            headers: {
              "API-Version": "v2",
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
              "Accept-Language": language,
            },
          })
          .pipe(map((res) => res.data)),
      );

      if (response.length === 0) {
        throw new HttpException("Parent not found", HttpStatus.NOT_FOUND);
      }

      const parent = response[0];

      const data: ICD11Entity = {
        id: parent.id,
        title: this.getMultilingualValue(parent.title, language),
        definition: this.getMultilingualValue(parent.definition, language),
      };

      await this.cacheManager.set(cacheKey, data, 3600);
      return data;
    } catch (error) {
      this.logger.error(`Failed to get parent for ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof AxiosError && error.response?.status === 404) {
        throw new HttpException("Parent not found", HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        "Failed to get entity parent",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
