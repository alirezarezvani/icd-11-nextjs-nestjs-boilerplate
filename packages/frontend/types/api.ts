/**
 * Standard API Success Response format
 */
export interface ApiSuccessResponse<T = any> {
  statusCode: number;
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * Standard API Error Response format  
 */
export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
}

/**
 * Paginated Response wrapper
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
 * Standard pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Search parameters with pagination
 */
export interface SearchParams extends PaginationParams {
  term?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}