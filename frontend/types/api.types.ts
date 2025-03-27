// API Response types
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

// ICD-11 specific types
/**
 * Interface representing an ICD-11 entity
 */
export interface ICD11Entity {
  id: string;
  title: string;
  code?: string;
  definition?: string;
  longDefinition?: string;
  parent?: {
    id: string;
    title: string;
    code?: string;
  };
  children?: ICD11Entity[];
  isLeaf?: boolean;
  codeRange?: string;
  browserUrl?: string;
  includedTerms?: string[];
  excludedTerms?: string[];
}

export interface ICD11SearchResult {
  id: string;
  title: string;
  code?: string;
  isLeaf: boolean;
  matchingPhrases?: string[];
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
} 