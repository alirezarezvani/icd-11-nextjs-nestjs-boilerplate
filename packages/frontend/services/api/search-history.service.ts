import { apiRequest, QueryParams } from './client';
import { ApiSuccessResponse, PaginatedResponse } from '@shared/types/api';

export interface SearchHistoryItem {
  id: string;
  searchTerm: string;
  language: string;
  resultsCount: number;
  filters: any;
  isBookmarked: boolean;
  createdAt: string;
}

export interface CreateSearchHistoryDto {
  searchTerm: string;
  language: string;
  resultsCount: number;
  filters?: any;
}

export const searchHistoryService = {
  async getUserHistory(
    page: number = 1,
    limit: number = 20,
    searchTerm?: string,
  ): Promise<PaginatedResponse<SearchHistoryItem>> {
    const params: QueryParams = { page, limit };
    if (searchTerm) {
      params.search = searchTerm;
    }

    const response = await apiRequest.get<ApiSuccessResponse<PaginatedResponse<SearchHistoryItem>>>(
      '/search-history',
      params
    );
    return response.data.data;
  },

  async getTopTerms(limit: number = 10): Promise<{ term: string; count: number }[]> {
    const params: QueryParams = { limit };
    const response = await apiRequest.get<ApiSuccessResponse<{ term: string; count: number }[]>>(
      '/search-history/top-terms',
      params
    );
    return response.data.data;
  },

  async deleteHistoryItem(historyId: string): Promise<void> {
    await apiRequest.delete(`/search-history/${historyId}`);
  },

  async clearHistory(): Promise<void> {
    await apiRequest.delete('/search-history');
  },
};