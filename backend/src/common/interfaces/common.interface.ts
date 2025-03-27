// Common interfaces for backend application

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

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

export interface ApiSuccessResponse<T> {
  statusCode: number;
  data: T;
  message?: string;
}

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined; 