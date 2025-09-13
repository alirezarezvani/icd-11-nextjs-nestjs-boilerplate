// Common interfaces for the API

export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response interface
 * Note: Backend actually returns items directly for backwards compatibility
 */
export interface PaginatedResponse<T> {
  data: T[];
  items: T[];  // For backwards compatibility with existing hooks
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Direct properties for backwards compatibility
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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
