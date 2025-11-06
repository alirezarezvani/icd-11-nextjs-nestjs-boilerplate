import { apiRequest, QueryParams } from './client';
import { ApiSuccessResponse } from '@shared/types/api';

export interface SearchSuggestion {
  text: string;
  type: 'history' | 'popular' | 'medical';
  count?: number;
  category?: string;
}

export const searchSuggestionsService = {
  async getSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    const params: QueryParams = { q: query, limit };
    
    const response = await apiRequest.get<ApiSuccessResponse<SearchSuggestion[]>>(
      '/search-suggestions',
      params
    );
    return response.data.data;
  },

  async getUserSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    const params: QueryParams = { q: query, limit };
    
    const response = await apiRequest.get<ApiSuccessResponse<SearchSuggestion[]>>(
      '/search-suggestions/user',
      params
    );
    return response.data.data;
  },

  async getPublicSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    const params: QueryParams = { q: query, limit };
    
    const response = await apiRequest.get<ApiSuccessResponse<SearchSuggestion[]>>(
      '/search-suggestions/public',
      params
    );
    return response.data.data;
  },
};