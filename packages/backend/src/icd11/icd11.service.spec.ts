import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { HttpException, HttpStatus } from "@nestjs/common";
import { of, throwError } from "rxjs";
import { AxiosResponse, AxiosError } from "axios";
import { Cache } from "cache-manager";

import { ICD11Service } from "./icd11.service";
import {
  TokenResponse,
  WHOSearchResponse,
  WHOEntityResponse,
  WHOChildrenResponse,
  WHOEntity,
} from "./who.interfaces";
import { ICD11Entity } from "@shared/types/icd11";
import { PaginatedResponse } from "@shared/types/api";

describe("ICD11Service", () => {
  let service: ICD11Service;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;
  let cacheManager: jest.Mocked<Cache>;

  const mockConfig: Record<string, string> = {
    ICD11_CLIENT_ID: "test-client-id",
    ICD11_CLIENT_SECRET: "test-client-secret",
    ICD11_API_BASE_URL: "https://id.who.int/icd",
    ICD11_TOKEN_URL: "https://icdaccessmanagement.who.int/connect/token",
  };

  const mockTokenResponse: TokenResponse = {
    access_token: "test-access-token",
    expires_in: 3600,
    token_type: "Bearer",
    scope: "icdapi_access",
  };

  const mockSearchResponse: WHOSearchResponse = {
    destinationEntities: [
      {
        id: "http://id.who.int/icd/entity/1234567890",
        title: { en: "Test Disease" },
        definition: { en: "Test definition" },
      },
      {
        id: "http://id.who.int/icd/entity/0987654321",
        title: { en: "Another Disease" },
      },
    ],
  };

  const mockEntityResponse: WHOEntityResponse = {
    "@id": "http://id.who.int/icd/entity/1234567890",
    title: { en: "Test Disease" },
    definition: { en: "Detailed definition of test disease" },
    code: "AB01.0",
    classKind: "category",
  };

  const mockChildrenResponse: WHOChildrenResponse = {
    children: [
      {
        id: "http://id.who.int/icd/entity/child1",
        title: { en: "Child Disease 1" },
        definition: { en: "First child disease" },
      },
      {
        id: "http://id.who.int/icd/entity/child2",
        title: { en: "Child Disease 2" },
        definition: { en: "Second child disease" },
      },
    ],
    total: 2,
  };

  beforeEach(async () => {
    const mockHttpService = {
      post: jest.fn(),
      get: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => mockConfig[key]),
    };

    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ICD11Service,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ICD11Service>(ICD11Service);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with valid configuration", () => {
      expect(service).toBeDefined();
      expect(configService.get).toHaveBeenCalledWith("ICD11_CLIENT_ID");
      expect(configService.get).toHaveBeenCalledWith("ICD11_CLIENT_SECRET");
    });

    it("should throw error if client ID is missing", () => {
      const mockConfigServiceMissingId = {
        get: jest.fn((key: string) => {
          if (key === "ICD11_CLIENT_ID") return undefined;
          return (mockConfig as Record<string, string>)[key];
        }),
      };

      expect(() => {
        new ICD11Service(
          httpService,
          mockConfigServiceMissingId as any,
          cacheManager,
        );
      }).toThrow("Missing ICD11 OAuth2 configuration");
    });

    it("should throw error if client secret is missing", () => {
      const mockConfigServiceMissingSecret = {
        get: jest.fn((key: string) => {
          if (key === "ICD11_CLIENT_SECRET") return undefined;
          return (mockConfig as Record<string, string>)[key];
        }),
      };

      expect(() => {
        new ICD11Service(
          httpService,
          mockConfigServiceMissingSecret as any,
          cacheManager,
        );
      }).toThrow("Missing ICD11 OAuth2 configuration");
    });
  });

  describe("getAccessToken", () => {
    it("should return cached token if available", async () => {
      const cachedToken = "cached-token";
      cacheManager.get.mockResolvedValue(cachedToken);

      const token = await (service as any).getAccessToken();

      expect(token).toBe(cachedToken);
      expect(cacheManager.get).toHaveBeenCalledWith("icd11_access_token");
      expect(httpService.post).not.toHaveBeenCalled();
    });

    it("should fetch new token if not cached", async () => {
      cacheManager.get.mockResolvedValue(null);

      const mockResponse: AxiosResponse<TokenResponse> = {
        data: mockTokenResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      httpService.post.mockReturnValue(of(mockResponse));

      const token = await (service as any).getAccessToken();

      expect(token).toBe(mockTokenResponse.access_token);
      expect(httpService.post).toHaveBeenCalledWith(
        mockConfig.ICD11_TOKEN_URL,
        expect.any(URLSearchParams),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: expect.stringContaining("Basic "),
          }),
        }),
      );
      expect(cacheManager.set).toHaveBeenCalledWith(
        "icd11_access_token",
        mockTokenResponse.access_token,
        mockTokenResponse.expires_in - 60,
      );
    });

    it("should handle authentication failures", async () => {
      cacheManager.get.mockResolvedValue(null);

      const mockError = new AxiosError("Unauthorized", "401", {} as any, {}, {
        status: 401,
        data: { error: "invalid_client" },
      } as any);

      httpService.post.mockReturnValue(throwError(() => mockError));

      await expect((service as any).getAccessToken()).rejects.toThrow(
        new HttpException(
          "Failed to authenticate with WHO API",
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe("search", () => {
    it("should search for entities successfully", async () => {
      cacheManager.get.mockResolvedValue(null);

      const mockTokenHttpResponse: AxiosResponse<TokenResponse> = {
        data: mockTokenResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      const mockSearchHttpResponse: AxiosResponse<WHOSearchResponse> = {
        data: mockSearchResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      httpService.post.mockReturnValue(of(mockTokenHttpResponse));
      httpService.get.mockReturnValue(of(mockSearchHttpResponse));

      const result = await service.search("test disease", "en", 1, 20, true);

      expect(result).toEqual({
        data: [
          {
            id: "http://id.who.int/icd/entity/1234567890",
            title: "Test Disease",
            isLeaf: false,
          },
          {
            id: "http://id.who.int/icd/entity/0987654321",
            title: "Another Disease",
            isLeaf: false,
          },
        ],
        items: [
          {
            id: "http://id.who.int/icd/entity/1234567890",
            title: "Test Disease",
            isLeaf: false,
          },
          {
            id: "http://id.who.int/icd/entity/0987654321",
            title: "Another Disease",
            isLeaf: false,
          },
        ],
        meta: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });

      expect(httpService.get).toHaveBeenCalledWith(
        "https://id.who.int/icd/release/11/2024-01/mms/search",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-access-token",
            "API-Version": "v2",
            Accept: "application/json",
            "Accept-Language": "en",
          }),
          params: {
            q: "test disease",
            useFlexisearch: true,
            flatResults: true,
            page: 1,
            limit: 20,
          },
        }),
      );
    });

    it("should handle search failures", async () => {
      cacheManager.get.mockResolvedValue("test-token");

      const mockError = new AxiosError("Server Error", "500");
      httpService.get.mockReturnValue(throwError(() => mockError));

      await expect(service.search("test", "en", 1, 20, false)).rejects.toThrow(
        new HttpException("Search failed", HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe("getEntityById", () => {
    it("should return cached entity if available", async () => {
      const cachedEntity: ICD11Entity = {
        id: "test-id",
        title: "Cached Entity",
        definition: "Cached definition",
        code: "CACHED",
        isLeaf: false,
      };

      cacheManager.get.mockResolvedValue(cachedEntity);

      const result = await service.getEntityById("test-id", "en");

      expect(result).toBe(cachedEntity);
      expect(cacheManager.get).toHaveBeenCalledWith("entity:test-id:en");
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it("should fetch entity if not cached", async () => {
      cacheManager.get.mockResolvedValue(null);

      const mockResponse: AxiosResponse<WHOEntityResponse> = {
        data: mockEntityResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getEntityById(
        "http://id.who.int/icd/entity/1234567890",
        "en",
      );

      expect(result).toEqual({
        id: "http://id.who.int/icd/entity/1234567890",
        title: "Test Disease",
        definition: "Detailed definition of test disease",
        code: "AB01.0",
        isLeaf: false,
      });

      expect(httpService.get).toHaveBeenCalledWith(
        "http://id.who.int/icd/entity/1234567890",
        expect.objectContaining({
          headers: expect.objectContaining({
            "API-Version": "v2",
            Accept: "application/json",
            Authorization: "Bearer test-access-token",
            "Accept-Language": "en",
          }),
        }),
      );

      expect(cacheManager.set).toHaveBeenCalledWith(
        "entity:http://id.who.int/icd/entity/1234567890:en",
        expect.any(Object),
        3600,
      );
    });

    it("should handle entity not found", async () => {
      cacheManager.get.mockResolvedValue(null);

      const mockError = new AxiosError("Not Found", "404", {} as any, {}, {
        status: 404,
      } as any);

      httpService.get.mockReturnValue(throwError(() => mockError));

      await expect(service.getEntityById("invalid-id", "en")).rejects.toThrow(
        new HttpException("Entity not found", HttpStatus.NOT_FOUND),
      );
    });

    it("should detect leaf entities correctly", async () => {
      cacheManager.get.mockResolvedValue(null);

      const leafEntityResponse: WHOEntityResponse = {
        "@id": "http://id.who.int/icd/entity/leaf",
        title: { en: "Leaf Disease" },
        definition: { en: "This is a leaf entity" },
        code: "LEAF01",
        classKind: "class", // class = leaf, category = has children
      };

      const mockResponse: AxiosResponse<WHOEntityResponse> = {
        data: leafEntityResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getEntityById(
        "http://id.who.int/icd/entity/leaf",
        "en",
      );

      expect(result.isLeaf).toBe(true);
    });
  });

  describe("getChildren", () => {
    it("should return cached children if available", async () => {
      const cachedChildren: PaginatedResponse<ICD11Entity> = {
        data: [
          { id: "child1", title: "Child 1" },
          { id: "child2", title: "Child 2" },
        ],
        items: [
          { id: "child1", title: "Child 1" },
          { id: "child2", title: "Child 2" },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      };

      cacheManager.get.mockResolvedValue(cachedChildren);

      const result = await service.getChildren("parent-id", "en", 1, 10);

      expect(result).toBe(cachedChildren);
      expect(cacheManager.get).toHaveBeenCalledWith(
        "children:parent-id:en:1:10",
      );
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it("should fetch children if not cached", async () => {
      cacheManager.get.mockResolvedValue(null);

      const mockResponse: AxiosResponse<WHOChildrenResponse> = {
        data: mockChildrenResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getChildren(
        "http://id.who.int/icd/entity/parent",
        "en",
        1,
        10,
      );

      expect(result).toEqual({
        data: [
          {
            id: "http://id.who.int/icd/entity/child1",
            title: "Child Disease 1",
            definition: "First child disease",
          },
          {
            id: "http://id.who.int/icd/entity/child2",
            title: "Child Disease 2",
            definition: "Second child disease",
          },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      expect(httpService.get).toHaveBeenCalledWith(
        "http://id.who.int/icd/entity/parent/children",
        expect.objectContaining({
          params: { page: 1, limit: 10 },
          headers: expect.objectContaining({
            "API-Version": "v2",
            Accept: "application/json",
            Authorization: "Bearer test-access-token",
            "Accept-Language": "en",
          }),
        }),
      );
    });

    it("should handle entities with no children (404)", async () => {
      cacheManager.get.mockResolvedValue(null);

      const mockError = new AxiosError("Not Found", "404", {} as any, {}, {
        status: 404,
      } as any);

      httpService.get.mockReturnValue(throwError(() => mockError));

      const result = await service.getChildren("leaf-entity", "en", 1, 10);

      expect(result).toEqual({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });

      expect(cacheManager.set).toHaveBeenCalledWith(
        "children:leaf-entity:en:1:10",
        expect.objectContaining({
          data: [],
          meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
        }),
        3600,
      );
    });
  });

  describe("getParent", () => {
    it("should return cached parent if available", async () => {
      const cachedParent: ICD11Entity = {
        id: "parent-id",
        title: "Parent Entity",
        definition: "Parent definition",
      };

      cacheManager.get.mockResolvedValue(cachedParent);

      const result = await service.getParent("child-id", "en");

      expect(result).toBe(cachedParent);
      expect(cacheManager.get).toHaveBeenCalledWith("parent:child-id:en");
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it("should fetch parent if not cached", async () => {
      cacheManager.get.mockResolvedValue(null);

      const parentResponse: WHOEntity[] = [
        {
          id: "http://id.who.int/icd/entity/parent",
          title: { en: "Parent Disease" },
          definition: { en: "Parent definition" },
        },
      ];

      const mockResponse: AxiosResponse<WHOEntity[]> = {
        data: parentResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getParent(
        "http://id.who.int/icd/entity/child",
        "en",
      );

      expect(result).toEqual({
        id: "http://id.who.int/icd/entity/parent",
        title: "Parent Disease",
        definition: "Parent definition",
      });

      expect(httpService.get).toHaveBeenCalledWith(
        "http://id.who.int/icd/entity/child/parent",
        expect.objectContaining({
          headers: expect.objectContaining({
            "API-Version": "v2",
            Accept: "application/json",
            Authorization: "Bearer test-access-token",
            "Accept-Language": "en",
          }),
        }),
      );
    });

    it("should handle entities with no parent (404)", async () => {
      cacheManager.get.mockResolvedValue(null);

      const mockError = new AxiosError("Not Found", "404", {} as any, {}, {
        status: 404,
      } as any);

      httpService.get.mockReturnValue(throwError(() => mockError));

      await expect(service.getParent("root-entity", "en")).rejects.toThrow(
        new HttpException("Parent not found", HttpStatus.NOT_FOUND),
      );
    });

    it("should handle empty parent response", async () => {
      cacheManager.get.mockResolvedValue(null);

      const mockResponse: AxiosResponse<WHOEntity[]> = {
        data: [],
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      await expect(service.getParent("orphan-entity", "en")).rejects.toThrow(
        new HttpException("Parent not found", HttpStatus.NOT_FOUND),
      );
    });
  });

  describe("getMultilingualValue helper method", () => {
    it("should handle plain string values", () => {
      const result = (service as any).getMultilingualValue(
        "Plain string",
        "en",
        "fallback",
      );
      expect(result).toBe("Plain string");
    });

    it("should handle WHO v2 format with @value", () => {
      const field = { "@value": "V2 format value", "@language": "en" };
      const result = (service as any).getMultilingualValue(
        field,
        "en",
        "fallback",
      );
      expect(result).toBe("V2 format value");
    });

    it("should handle multilingual objects", () => {
      const field = { en: "English text", fr: "French text" };
      const result = (service as any).getMultilingualValue(
        field,
        "en",
        "fallback",
      );
      expect(result).toBe("English text");
    });

    it("should fall back to English when requested language not available", () => {
      const field = { en: "English text", fr: "French text" };
      const result = (service as any).getMultilingualValue(
        field,
        "es",
        "fallback",
      );
      expect(result).toBe("English text");
    });

    it("should return fallback when field is empty", () => {
      const result = (service as any).getMultilingualValue(
        null,
        "en",
        "fallback",
      );
      expect(result).toBe("fallback");
    });

    it("should clean HTML tags from content", () => {
      const result = (service as any).getMultilingualValue(
        '<em class="found">highlighted</em> text',
        "en",
        "fallback",
      );
      expect(result).toBe("highlighted text");
    });
  });
});
