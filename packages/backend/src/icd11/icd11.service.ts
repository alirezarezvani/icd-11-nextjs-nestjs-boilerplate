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
import {
  ICD11Entity,
  ICD11SearchResult,
  ICD11EntityDetails,
  ICD11NavigationContext,
  ICD11BreadcrumbItem,
} from "@shared/types/icd11";
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
    field:
      | WHOTitle
      | WHODefinition
      | string
      | { "@value": string; "@language": string }
      | undefined,
    language: string,
    fallback = "",
  ): string {
    if (!field) {
      return fallback;
    }

    // If field is already a string, clean HTML tags and return
    if (typeof field === "string") {
      return this.cleanHtmlTags(field);
    }

    // Handle WHO API v2 format with @value property
    if (field && typeof field === "object" && "@value" in field) {
      const v2Field = field as WHOV2Field;
      return this.cleanHtmlTags(v2Field["@value"]);
    }

    // Handle multilingual object (fallback for search results)
    if (field && typeof field === "object" && language in field) {
      const value = field[language];
      return value ? this.cleanHtmlTags(value) : fallback;
    }
    if (field && typeof field === "object" && "en" in field && field.en) {
      return this.cleanHtmlTags(field.en);
    }
    if (field && typeof field === "object") {
      const values = Object.values(field).filter(Boolean);
      return values.length > 0
        ? this.cleanHtmlTags(values[0] as string)
        : fallback;
    }

    return fallback;
  }

  private cleanHtmlTags(text: string): string {
    // Remove HTML tags like <em class='found'>...</em>
    return text.replace(/<[^>]*>/g, "");
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
        this.httpService.get<WHOSearchResponse>(this.getApiUrl("/mms/search"), {
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
        }),
      );

      const data = response.data.destinationEntities.map(
        (entity): ICD11SearchResult => ({
          id: entity.id,
          title: this.getMultilingualValue(entity.title, language, "Untitled"),
          isLeaf: false, // Cannot determine from search results, will be properly set when entity details are fetched
        }),
      );

      return {
        data,
        items: data, // For backwards compatibility
        meta: {
          page,
          limit,
          total: data.length, // WHO search API does not provide total count
          totalPages: 1, // Assuming single page for now
        },
        // Direct properties for backwards compatibility
        page,
        limit,
        total: data.length,
        totalPages: 1,
      };
    } catch (error) {
      this.logger.error("Search failed:", error);
      throw new HttpException(
        "Search failed",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      const entityUrl = id.startsWith("http")
        ? id
        : `${this.icd11Config.baseUrl}/entity/${id}`;

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
        id: response["@id"] || response.id || id,
        title: this.getMultilingualValue(response.title, language),
        definition: this.getMultilingualValue(response.definition, language),
        code: response.code,
        // Proper leaf detection based on WHO API classKind
        // 'category' = can have children, 'class' = leaf node
        isLeaf: response.classKind !== "category",
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
      const baseEntityUrl = id.startsWith("http")
        ? id
        : `${this.icd11Config.baseUrl}/entity/${id}`;
      const childrenUrl = `${baseEntityUrl}/children`;

      const response = await firstValueFrom(
        this.httpService
          .get<WHOChildrenResponse>(childrenUrl, {
            params: { page, limit },
            headers: {
              "API-Version": "v2",
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
              "Accept-Language": language,
            },
          })
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
        items: data, // For backwards compatibility
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
        // Direct properties for backwards compatibility
        page,
        limit,
        total,
        totalPages,
      };

      await this.cacheManager.set(cacheKey, results, 3600);
      return results;
    } catch (error) {
      this.logger.error(`Failed to get children for ${id}:`, error);
      if (error instanceof AxiosError && error.response?.status === 404) {
        // 404 means no children exist for this entity, return empty results
        const emptyResults: PaginatedResponse<ICD11Entity> = {
          data: [],
          items: [], // For backwards compatibility
          meta: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
          // Direct properties for backwards compatibility
          page,
          limit,
          total: 0,
          totalPages: 0,
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
      const baseEntityUrl = id.startsWith("http")
        ? id
        : `${this.icd11Config.baseUrl}/entity/${id}`;
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

  async getAncestors(
    id: string,
    language = this.icd11Config.defaultLanguage,
  ): Promise<ICD11Entity[]> {
    const cacheKey = `ancestors:${id}:${language}`;
    const cachedResult = await this.cacheManager.get<ICD11Entity[]>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    try {
      const accessToken = await this.getAccessToken();
      const baseEntityUrl = id.startsWith("http")
        ? id
        : `${this.icd11Config.baseUrl}/entity/${id}`;
      const ancestorsUrl = `${baseEntityUrl}/ancestors`;

      const response = await firstValueFrom(
        this.httpService
          .get<WHOEntity[]>(ancestorsUrl, {
            headers: {
              "API-Version": "v2",
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
              "Accept-Language": language,
            },
          })
          .pipe(map((res) => res.data)),
      );

      const ancestors = response.map((ancestor: WHOEntity) => ({
        id: ancestor.id,
        title: this.getMultilingualValue(ancestor.title, language),
        definition: this.getMultilingualValue(ancestor.definition, language),
        code: ancestor.code,
        isLeaf: ancestor.classKind !== "category",
        classKind: ancestor.classKind as "category" | "class" | "block",
      }));

      await this.cacheManager.set(cacheKey, ancestors, 3600);
      return ancestors;
    } catch (error) {
      this.logger.error(`Failed to get ancestors for ${id}:`, error);
      if (error instanceof AxiosError && error.response?.status === 404) {
        // 404 means no ancestors exist for this entity, return empty array
        const emptyResults: ICD11Entity[] = [];
        await this.cacheManager.set(cacheKey, emptyResults, 3600);
        return emptyResults;
      }
      throw new HttpException(
        "Failed to get entity ancestors",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getBreadcrumbs(
    id: string,
    language = this.icd11Config.defaultLanguage,
  ): Promise<ICD11BreadcrumbItem[]> {
    try {
      const ancestors = await this.getAncestors(id, language);
      const currentEntity = await this.getEntityById(id, language);

      const breadcrumbs: ICD11BreadcrumbItem[] = [];

      // Add ancestors in reverse order (root to parent)
      ancestors.reverse().forEach((ancestor, index) => {
        breadcrumbs.push({
          id: ancestor.id,
          title: ancestor.title,
          level: index,
        });
      });

      // Add current entity
      breadcrumbs.push({
        id: currentEntity.id,
        title: currentEntity.title,
        level: breadcrumbs.length,
      });

      return breadcrumbs;
    } catch (error) {
      this.logger.error(`Failed to get breadcrumbs for ${id}:`, error);
      throw new HttpException(
        "Failed to get breadcrumbs",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getNavigationContext(
    id: string,
    language = this.icd11Config.defaultLanguage,
  ): Promise<ICD11NavigationContext> {
    try {
      const [currentEntity, ancestors, childrenResponse] =
        await Promise.allSettled([
          this.getEntityById(id, language),
          this.getAncestors(id, language),
          this.getChildren(id, language, 1, 50), // Get first 50 children
        ]);

      const entity =
        currentEntity.status === "fulfilled" ? currentEntity.value : null;
      const ancestorsList =
        ancestors.status === "fulfilled" ? ancestors.value : [];
      const children =
        childrenResponse.status === "fulfilled"
          ? childrenResponse.value.data
          : [];

      if (!entity) {
        throw new HttpException("Entity not found", HttpStatus.NOT_FOUND);
      }

      // Get parent (last ancestor)
      const parent =
        ancestorsList.length > 0
          ? ancestorsList[ancestorsList.length - 1]
          : undefined;

      // Build breadcrumbs
      const breadcrumbs: ICD11BreadcrumbItem[] = [];
      ancestorsList.reverse().forEach((ancestor, index) => {
        breadcrumbs.push({
          id: ancestor.id,
          title: ancestor.title,
          level: index,
        });
      });

      breadcrumbs.push({
        id: entity.id,
        title: entity.title,
        level: breadcrumbs.length,
      });

      return {
        currentEntity: entity,
        ancestors: ancestorsList.reverse(), // Restore original order
        children,
        parent,
        breadcrumbs,
      };
    } catch (error) {
      this.logger.error(`Failed to get navigation context for ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to get navigation context",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEntityDetails(
    id: string,
    language = this.icd11Config.defaultLanguage,
  ): Promise<ICD11EntityDetails> {
    try {
      const [entity, childrenResponse, ancestors] = await Promise.allSettled([
        this.getEntityById(id, language),
        this.getChildren(id, language, 1, 10), // Get first 10 children for preview
        this.getAncestors(id, language),
      ]);

      const baseEntity = entity.status === "fulfilled" ? entity.value : null;
      if (!baseEntity) {
        throw new HttpException("Entity not found", HttpStatus.NOT_FOUND);
      }

      const children =
        childrenResponse.status === "fulfilled"
          ? childrenResponse.value.data
          : [];
      const ancestorsList =
        ancestors.status === "fulfilled" ? ancestors.value : [];
      const childrenCount =
        childrenResponse.status === "fulfilled"
          ? childrenResponse.value.meta.total
          : 0;

      // Build breadcrumbs
      const breadcrumbs = await this.getBreadcrumbs(id, language);

      const details: ICD11EntityDetails = {
        ...baseEntity,
        children,
        ancestors: ancestorsList,
        breadcrumbs,
        childrenCount,
        siblingCount: 0, // Would need parent's children count for this
      };

      return details;
    } catch (error) {
      this.logger.error(`Failed to get entity details for ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to get entity details",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
