import { apiRequest, QueryParams } from './client';
import {
  ApiSuccessResponse,
  PaginatedResponse,
} from "@shared/types/api";
import {
  ICD11Entity,
  ICD11SearchResult,
  ICD11SearchParams,
} from "@shared/types/icd11";
import config from '../../config';

// Define the base path for ICD11 endpoints
const ICD11_BASE_PATH = '/icd11';

/**
 * Service for interacting with ICD-11 API endpoints
 */
export const icd11Service = {
  /**
   * Search ICD-11 entities
   */
  async search(
    params: ICD11SearchParams,
  ): Promise<PaginatedResponse<ICD11SearchResult>> {
    const response = await apiRequest.post<ApiSuccessResponse<PaginatedResponse<ICD11SearchResult>>>(
      `${ICD11_BASE_PATH}/search`,
      params
    );
    return response.data.data;
  },

  /**
   * Get entity details by ID
   */
  async getEntity(
    id: string, 
    language: string = config.app.defaultLanguage
  ): Promise<ICD11Entity> {
    const params: QueryParams = { language };
    const encodedId = encodeURIComponent(id);
    const response = await apiRequest.get<ApiSuccessResponse<ICD11Entity>>(
      `${ICD11_BASE_PATH}/entity/${encodedId}`,
      params
    );
    return response.data.data;
  },

  /**
   * Get entity children by parent ID
   */
  async getEntityChildren(
    parentId: string,
    language: string = config.app.defaultLanguage,
    page: number = 1,
    limit: number = config.pagination.defaultLimit
  ): Promise<PaginatedResponse<ICD11Entity>> {
    const params: QueryParams = {
      language,
      page,
      limit
    };

    const encodedParentId = encodeURIComponent(parentId);
    const response = await apiRequest.get<ApiSuccessResponse<PaginatedResponse<ICD11Entity>>>(
      `${ICD11_BASE_PATH}/entity/${encodedParentId}/children`,
      params
    );
    return response.data.data;
  },

  /**
   * Get entity parent by ID
   */
  async getEntityParent(
    id: string,
    language: string = config.app.defaultLanguage
  ): Promise<ICD11Entity> {
    const params: QueryParams = { language };
    const encodedId = encodeURIComponent(id);
    const response = await apiRequest.get<ApiSuccessResponse<ICD11Entity>>(
      `${ICD11_BASE_PATH}/entity/${encodedId}/parent`,
      params
    );
    return response.data.data;
  },

  /**
   * Get entity ancestors by ID
   */
  async getEntityAncestors(
    id: string,
    language: string = config.app.defaultLanguage
  ): Promise<ICD11Entity[]> {
    const params: QueryParams = { language };
    const encodedId = encodeURIComponent(id);
    const response = await apiRequest.get<ApiSuccessResponse<ICD11Entity[]>>(
      `${ICD11_BASE_PATH}/entity/${encodedId}/ancestors`,
      params
    );
    return response.data.data;
  }
}; 