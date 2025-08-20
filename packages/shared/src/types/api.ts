// Common interfaces for the API

export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API success response interface
 */
export interface ApiSuccessResponse<T> {
  statusCode: number;
  data: T;
  message?: string;
}

/**
 * API error response interface
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
