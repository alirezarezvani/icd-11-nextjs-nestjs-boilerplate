import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import config from '../../config';
import { ApiSuccessResponse, ApiErrorResponse } from '@shared/types/api';

/**
 * API Service for handling HTTP requests to the backend
 */
class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor to format responses
    this.client.interceptors.response.use(
      this.handleSuccess,
      this.handleError
    );
  }

  /**
   * Handle successful responses
   */
  private handleSuccess(response: AxiosResponse): AxiosResponse {
    return response;
  }

  /**
   * Handle error responses
   */
  private handleError(error: any): Promise<never> {
    let errorResponse: ApiErrorResponse;

    if (error.response) {
      // Server responded with a status code outside the 2xx range
      errorResponse = {
        statusCode: error.response.status,
        message: error.response.data.message || 'An error occurred',
        error: error.response.data.error || 'Unknown error',
      };
    } else if (error.request) {
      // Request was made but no response was received
      errorResponse = {
        statusCode: 0,
        message: 'No response from server',
        error: 'Network Error',
      };
    } else {
      // Error setting up the request
      errorResponse = {
        statusCode: 0,
        message: error.message || 'Unknown error',
        error: 'Request Error',
      };
    }

    // Log for debugging purposes
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', errorResponse);
    }

    return Promise.reject(errorResponse);
  }

  /**
   * Make a GET request
   */
  public async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccessResponse<T>> {
    const response = await this.client.get<ApiSuccessResponse<T>>(endpoint, {
      params,
      ...config,
    });
    return response.data;
  }

  /**
   * Make a POST request
   */
  public async post<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccessResponse<T>> {
    const response = await this.client.post<ApiSuccessResponse<T>>(endpoint, data, config);
    return response.data;
  }

  /**
   * Make a PUT request
   */
  public async put<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccessResponse<T>> {
    const response = await this.client.put<ApiSuccessResponse<T>>(endpoint, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request
   */
  public async delete<T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccessResponse<T>> {
    const response = await this.client.delete<ApiSuccessResponse<T>>(endpoint, config);
    return response.data;
  }
}

// Create a singleton instance
const apiService = new ApiService();

export default apiService;