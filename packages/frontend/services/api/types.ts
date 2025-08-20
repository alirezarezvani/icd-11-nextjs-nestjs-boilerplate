export interface ICD11SearchParams {
  term: string;
  language?: string;
  page?: number;
  limit?: number;
  flexisearch?: boolean;
  flatResults?: boolean;
  includeDescendants?: boolean;
}

export interface ICD11SearchResult {
  id: string;
  title: string;
  code?: string;
  isLeaf: boolean;
  matchingPhrases?: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
} 