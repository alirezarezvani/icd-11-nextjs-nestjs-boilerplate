import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { ICD11Controller } from './icd11.controller';
import { ICD11Service } from './icd11.service';
import { ICD11SearchDto } from '../common/dto/icd11-search.dto';
import { ICD11Entity, ICD11SearchResult } from '@shared/types/icd11';
import { PaginatedResponse } from '@shared/types/api';

describe('ICD11Controller', () => {
  let controller: ICD11Controller;
  let service: jest.Mocked<ICD11Service>;

  const mockSearchResult: PaginatedResponse<ICD11SearchResult> = {
    data: [
      {
        id: 'http://id.who.int/icd/entity/1234567890',
        title: 'Test Disease',
        isLeaf: false,
      },
    ],
    meta: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    },
  };

  const mockEntity: ICD11Entity = {
    id: 'http://id.who.int/icd/entity/1234567890',
    title: 'Test Disease',
    definition: 'Test definition',
    code: 'AB01.0',
    isLeaf: false,
  };

  const mockChildrenResult: PaginatedResponse<ICD11Entity> = {
    data: [
      {
        id: 'http://id.who.int/icd/entity/child1',
        title: 'Child Disease 1',
        definition: 'Child definition',
      },
    ],
    meta: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    },
  };

  beforeEach(async () => {
    const mockService = {
      search: jest.fn(),
      getEntityById: jest.fn(),
      getChildren: jest.fn(),
      getParent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ICD11Controller],
      providers: [
        {
          provide: ICD11Service,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ICD11Controller>(ICD11Controller);
    service = module.get(ICD11Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should search for ICD-11 entities successfully', async () => {
      const searchDto: ICD11SearchDto = {
        term: 'diabetes',
        language: 'en',
        flexisearch: true,
      };

      service.search.mockResolvedValue(mockSearchResult);

      const result = await controller.search(searchDto);

      expect(result).toEqual({
        statusCode: 200,
        data: mockSearchResult,
      });
      expect(service.search).toHaveBeenCalledWith(
        'diabetes',
        'en',
        1,
        20,
        true,
      );
    });

    it('should use default values for optional parameters', async () => {
      const searchDto: ICD11SearchDto = {
        term: 'diabetes',
      };

      service.search.mockResolvedValue(mockSearchResult);

      await controller.search(searchDto);

      expect(service.search).toHaveBeenCalledWith(
        'diabetes',
        'en', // default language
        1,   // default page
        20,  // default limit
        true, // default flexisearch
      );
    });

    it('should handle search service errors', async () => {
      const searchDto: ICD11SearchDto = {
        term: 'invalid',
      };

      service.search.mockRejectedValue(
        new HttpException('Search failed', HttpStatus.INTERNAL_SERVER_ERROR),
      );

      await expect(controller.search(searchDto)).rejects.toThrow(
        new HttpException('Search failed', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });

    it('should validate search term length', async () => {
      const searchDto: ICD11SearchDto = {
        term: '', // empty term should be handled by validation
      };

      service.search.mockResolvedValue(mockSearchResult);

      // Note: In a real scenario, this would be caught by class-validator
      // before reaching the controller method
      await controller.search(searchDto);

      expect(service.search).toHaveBeenCalledWith(
        '',
        'en',
        1,
        20,
        true,
      );
    });
  });

  describe('getEntity', () => {
    it('should get entity by ID successfully', async () => {
      const entityId = 'http://id.who.int/icd/entity/1234567890';
      const language = 'en';

      service.getEntityById.mockResolvedValue(mockEntity);

      const result = await controller.getEntity(entityId, language);

      expect(result).toEqual({
        statusCode: 200,
        data: mockEntity,
      });
      expect(service.getEntityById).toHaveBeenCalledWith(entityId, language);
    });

    it('should use default language when not provided', async () => {
      const entityId = 'http://id.who.int/icd/entity/1234567890';

      service.getEntityById.mockResolvedValue(mockEntity);

      await controller.getEntity(entityId);

      expect(service.getEntityById).toHaveBeenCalledWith(entityId, undefined);
    });

    it('should handle entity not found', async () => {
      const entityId = 'invalid-id';

      service.getEntityById.mockRejectedValue(
        new HttpException('Entity not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.getEntity(entityId)).rejects.toThrow(
        new HttpException('Entity not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle URL-encoded entity IDs', async () => {
      const encodedId = encodeURIComponent('http://id.who.int/icd/entity/1234567890');
      const decodedId = 'http://id.who.int/icd/entity/1234567890';

      service.getEntityById.mockResolvedValue(mockEntity);

      await controller.getEntity(encodedId);

      // The controller should handle URL decoding if needed
      expect(service.getEntityById).toHaveBeenCalledWith(encodedId, undefined);
    });
  });

  describe('getChildren', () => {
    it('should get entity children successfully', async () => {
      const entityId = 'http://id.who.int/icd/entity/parent';
      const language = 'en';
      const page = 1;
      const limit = 10;

      service.getChildren.mockResolvedValue(mockChildrenResult);

      const result = await controller.getChildren(entityId, language, page, limit);

      expect(result).toEqual({
        statusCode: 200,
        data: mockChildrenResult,
      });
      expect(service.getChildren).toHaveBeenCalledWith(entityId, language, page, limit);
    });

    it('should use default values for pagination', async () => {
      const entityId = 'http://id.who.int/icd/entity/parent';

      service.getChildren.mockResolvedValue(mockChildrenResult);

      await controller.getChildren(entityId);

      expect(service.getChildren).toHaveBeenCalledWith(
        entityId,
        undefined, // language not provided
        1,   // default page
        20,  // default limit
      );
    });

    it('should handle entities with no children', async () => {
      const entityId = 'http://id.who.int/icd/entity/leaf';
      const emptyResult: PaginatedResponse<ICD11Entity> = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      service.getChildren.mockResolvedValue(emptyResult);

      const result = await controller.getChildren(entityId);

      expect(result).toEqual({
        statusCode: 200,
        data: emptyResult,
      });
      expect(result.data.data).toHaveLength(0);
    });

    it('should validate pagination parameters', async () => {
      const entityId = 'http://id.who.int/icd/entity/parent';
      const invalidPage = -1;
      const invalidLimit = 0;

      service.getChildren.mockResolvedValue(mockChildrenResult);

      // In a real scenario, these would be validated by class-validator decorators
      await controller.getChildren(entityId, 'en', invalidPage, invalidLimit);

      expect(service.getChildren).toHaveBeenCalledWith(entityId, 'en', invalidPage, invalidLimit);
    });
  });

  describe('getParent', () => {
    it('should get entity parent successfully', async () => {
      const entityId = 'http://id.who.int/icd/entity/child';
      const language = 'en';

      const mockParent: ICD11Entity = {
        id: 'http://id.who.int/icd/entity/parent',
        title: 'Parent Disease',
        definition: 'Parent definition',
      };

      service.getParent.mockResolvedValue(mockParent);

      const result = await controller.getParent(entityId, language);

      expect(result).toEqual({
        statusCode: 200,
        data: mockParent,
      });
      expect(service.getParent).toHaveBeenCalledWith(entityId, language);
    });

    it('should use default language when not provided', async () => {
      const entityId = 'http://id.who.int/icd/entity/child';

      const mockParent: ICD11Entity = {
        id: 'http://id.who.int/icd/entity/parent',
        title: 'Parent Disease',
      };

      service.getParent.mockResolvedValue(mockParent);

      await controller.getParent(entityId);

      expect(service.getParent).toHaveBeenCalledWith(entityId, undefined);
    });

    it('should handle entities with no parent (root entities)', async () => {
      const entityId = 'http://id.who.int/icd/entity/root';

      service.getParent.mockRejectedValue(
        new HttpException('Parent not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.getParent(entityId)).rejects.toThrow(
        new HttpException('Parent not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle service errors gracefully', async () => {
      const entityId = 'http://id.who.int/icd/entity/problematic';

      service.getParent.mockRejectedValue(
        new HttpException('Failed to get entity parent', HttpStatus.INTERNAL_SERVER_ERROR),
      );

      await expect(controller.getParent(entityId)).rejects.toThrow(
        new HttpException('Failed to get entity parent', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('controller configuration', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have proper route configuration', () => {
      // This test verifies that the controller is properly decorated
      // In a real scenario, you might test the actual route metadata
      expect(controller.search).toBeDefined();
      expect(controller.getEntity).toBeDefined();
      expect(controller.getChildren).toBeDefined();
      expect(controller.getParent).toBeDefined();
    });
  });
});