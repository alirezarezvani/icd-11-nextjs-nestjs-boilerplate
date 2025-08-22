import { apiRequest, QueryParams } from './client';
import { ApiSuccessResponse, PaginatedResponse } from '@shared/types/api';

export enum BookmarkType {
  ENTITY = 'entity',
  SEARCH = 'search',
}

export interface BookmarkItem {
  id: string;
  type: BookmarkType;
  entityId?: string;
  entityTitle?: string;
  entityCode?: string;
  entityCategory?: string;
  searchTerm?: string;
  searchLanguage?: string;
  searchResultsCount?: number;
  searchFilters?: any;
  tags: string[];
  notes?: string;
  createdAt: string;
}

export interface CreateEntityBookmarkDto {
  entityId: string;
  entityTitle: string;
  entityCode?: string;
  entityCategory?: string;
  tags?: string[];
  notes?: string;
}

export interface CreateSearchBookmarkDto {
  searchTerm: string;
  searchLanguage: string;
  searchResultsCount: number;
  searchFilters?: any;
  tags?: string[];
  notes?: string;
}

export const bookmarkService = {
  async getUserBookmarks(
    page: number = 1,
    limit: number = 20,
    type?: BookmarkType,
    searchQuery?: string,
  ): Promise<PaginatedResponse<BookmarkItem>> {
    const params: QueryParams = { page, limit };
    if (type) {
      params.type = type;
    }
    if (searchQuery) {
      params.search = searchQuery;
    }

    const response = await apiRequest.get<ApiSuccessResponse<PaginatedResponse<BookmarkItem>>>(
      '/bookmarks',
      params
    );
    return response.data.data;
  },

  async createEntityBookmark(data: CreateEntityBookmarkDto): Promise<BookmarkItem> {
    const response = await apiRequest.post<ApiSuccessResponse<BookmarkItem>>(
      '/bookmarks/entity',
      data
    );
    return response.data.data;
  },

  async createSearchBookmark(data: CreateSearchBookmarkDto): Promise<BookmarkItem> {
    const response = await apiRequest.post<ApiSuccessResponse<BookmarkItem>>(
      '/bookmarks/search',
      data
    );
    return response.data.data;
  },

  async isEntityBookmarked(entityId: string): Promise<boolean> {
    const response = await apiRequest.get<ApiSuccessResponse<{ isBookmarked: boolean }>>(
      `/bookmarks/entity/${encodeURIComponent(entityId)}/status`
    );
    return response.data.data.isBookmarked;
  },

  async isSearchBookmarked(searchTerm: string): Promise<boolean> {
    const response = await apiRequest.get<ApiSuccessResponse<{ isBookmarked: boolean }>>(
      `/bookmarks/search/${encodeURIComponent(searchTerm)}/status`
    );
    return response.data.data.isBookmarked;
  },

  async updateBookmark(
    bookmarkId: string,
    updates: { tags?: string[]; notes?: string },
  ): Promise<BookmarkItem> {
    const response = await apiRequest.put<ApiSuccessResponse<BookmarkItem>>(
      `/bookmarks/${bookmarkId}`,
      updates
    );
    return response.data.data;
  },

  async deleteBookmark(bookmarkId: string): Promise<void> {
    await apiRequest.delete(`/bookmarks/${bookmarkId}`);
  },
};