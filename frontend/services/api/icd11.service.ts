import { apiRequest, QueryParams } from './client';
import { ApiResponse, ICD11Entity, ICD11SearchResult, PaginatedResponse } from '../../types';
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
    term: string,
    language: string = config.app.defaultLanguage,
    page: number = 1,
    limit: number = config.pagination.defaultLimit,
    flexisearch: boolean = true,
    flatResults: boolean = false,
    includeDescendants: boolean = false
  ): Promise<PaginatedResponse<ICD11SearchResult>> {
    const params: QueryParams = {
      term,
      language,
      page,
      limit,
      flexisearch,
      flatResults,
      includeDescendants
    };

    const response = await apiRequest.get<ApiResponse<PaginatedResponse<ICD11SearchResult>>>(
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
    const response = await apiRequest.get<ApiResponse<ICD11Entity>>(
      `${ICD11_BASE_PATH}/entity/${id}`,
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

    const response = await apiRequest.get<ApiResponse<PaginatedResponse<ICD11Entity>>>(
      `${ICD11_BASE_PATH}/entity/${parentId}/children`,
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
    const response = await apiRequest.get<ApiResponse<ICD11Entity[]>>(
      `${ICD11_BASE_PATH}/entity/${id}/ancestors`,
      params
    );
    return response.data.data;
  }
}; 