import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import config from '../../config';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Get access token from storage
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return Cookies.get('accessToken') || localStorage.getItem('accessToken');
};

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await axios.post(
          `${config.api.baseUrl}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;

        // Update stored token
        if (typeof window !== 'undefined') {
          Cookies.set('accessToken', accessToken, {
            expires: 7,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
          });
          localStorage.setItem('accessToken', accessToken);
        }

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          Cookies.remove('accessToken');
          localStorage.removeItem('accessToken');
          // Trigger logout in auth context
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors with enhanced categorization
    if (error.response) {
      const { status, data } = error.response;
      
      // Enhanced error logging with full request/response details for debugging
      console.log('API Error Details:', {
        status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method,
        requestData: error.config?.data,
        responseData: data,
        timestamp: new Date().toISOString()
      });
      
      // Enhanced error logging and handling for specific status codes
      if (status === 429) {
        console.warn('API Rate Limit Exceeded:', {
          message: data?.message || 'Too many requests',
          retryAfter: error.response.headers['retry-after'],
          endpoint: error.config?.url,
          timestamp: new Date().toISOString()
        });
        // TODO: Implement retry logic with exponential backoff
      } else if (status === 503) {
        console.error('API Service Unavailable:', {
          message: data?.message || 'Service temporarily unavailable',
          endpoint: error.config?.url,
          timestamp: new Date().toISOString(),
          isWhoApiError: error.config?.url?.includes('/icd11/')
        });
        
        // Special handling for WHO API credential issues
        if (data?.message?.includes('Invalid credentials') || data?.message?.includes('Invalid API credentials')) {
          console.error('WHO API Credentials Error - Administrator action required:', {
            issue: 'Invalid WHO API credentials configured',
            action: 'Contact system administrator to update ICD11_CLIENT_ID and ICD11_CLIENT_SECRET',
            helpUrl: 'https://icd.who.int/icdapi'
          });
        }
      } else if (status >= 500) {
        console.error('API Server Error:', {
          status,
          message: data?.message || 'Internal server error',
          endpoint: error.config?.url,
          timestamp: new Date().toISOString()
        });
      } else if (status === 400) {
        console.warn('API Bad Request:', {
          status,
          message: data?.message || 'Bad request',
          endpoint: error.config?.url,
          requestData: error.config?.data,
          timestamp: new Date().toISOString()
        });
      } else if (status === 403) {
        console.error('API Forbidden:', {
          status,
          message: data?.message || 'Access forbidden',
          endpoint: error.config?.url,
          timestamp: new Date().toISOString()
        });
      } else {
        console.error('API Error Response:', {
          status,
          message: data?.message || 'Unknown error',
          endpoint: error.config?.url,
          data,
          timestamp: new Date().toISOString()
        });
      }
    } else if (error.request) {
      console.error('API Network Error:', {
        message: 'No response received from server',
        url: error.config?.url,
        timeout: error.config?.timeout,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('API Request Setup Error:', {
        message: error.message,
        config: error.config,
        timestamp: new Date().toISOString()
      });
    }

    return Promise.reject(error);
  }
);

// Type for query parameters
export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

// Enhanced error types for better error handling
export interface ApiErrorDetails {
  status: number;
  message: string;
  endpoint?: string;
  timestamp: string;
  isRetryable?: boolean;
  isWhoApiError?: boolean;
  needsAdminAction?: boolean;
}

// Error categorization helper
export const categorizeApiError = (error: any): ApiErrorDetails => {
  const timestamp = new Date().toISOString();
  const endpoint = error.config?.url || 'unknown';
  const isWhoApiError = endpoint.includes('/icd11/');
  
  if (!error.response) {
    return {
      status: 0,
      message: 'Network error - unable to connect to server',
      endpoint,
      timestamp,
      isRetryable: true,
      isWhoApiError: false,
      needsAdminAction: false
    };
  }
  
  const { status, data } = error.response;
  const message = data?.message || getDefaultErrorMessage(status);
  
  return {
    status,
    message,
    endpoint,
    timestamp,
    isRetryable: isRetryableError(status),
    isWhoApiError,
    needsAdminAction: needsAdminAction(status, message, isWhoApiError)
  };
};

const getDefaultErrorMessage = (status: number): string => {
  switch (status) {
    case 400: return 'Bad request - invalid parameters';
    case 401: return 'Authentication required';
    case 403: return 'Access forbidden';
    case 404: return 'Resource not found';
    case 429: return 'Too many requests - rate limit exceeded';
    case 500: return 'Internal server error';
    case 502: return 'Bad gateway';
    case 503: return 'Service temporarily unavailable';
    case 504: return 'Gateway timeout';
    default: return `HTTP error ${status}`;
  }
};

const isRetryableError = (status: number): boolean => {
  // Retryable: 429, 500, 502, 503, 504, network errors (0)
  return status === 0 || status === 429 || status >= 500;
};

const needsAdminAction = (status: number, message: string, isWhoApiError: boolean): boolean => {
  // Admin action needed for credential/configuration issues
  if (status === 503 && isWhoApiError) {
    return message.includes('credentials') || message.includes('configuration');
  }
  return false;
};

// Generic wrapper for axios requests with enhanced error handling
export const apiRequest = {
  get: <T>(url: string, params?: QueryParams, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.get<T>(url, { params, ...config });
  },
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.post<T>(url, data, config);
  },
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.put<T>(url, data, config);
  },
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.delete<T>(url, config);
  },
};

// Utility function to create user-friendly error messages
export const getUserFriendlyErrorMessage = (error: any): string => {
  const errorDetails = categorizeApiError(error);
  
  if (errorDetails.needsAdminAction) {
    return 'The ICD-11 search service is currently unavailable due to a configuration issue. Please contact your system administrator.';
  }
  
  if (errorDetails.isWhoApiError) {
    switch (errorDetails.status) {
      case 429:
        return 'Search rate limit exceeded. Please wait a moment and try again.';
      case 503:
        return 'The ICD-11 search service is temporarily unavailable. Please try again later.';
      case 0:
        return 'Unable to connect to the search service. Please check your internet connection.';
      default:
        return 'Search service temporarily unavailable. Please try again later.';
    }
  }
  
  // For non-WHO API errors
  switch (errorDetails.status) {
    case 0:
      return 'Unable to connect to the server. Please check your internet connection.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to access this resource.';
    case 404:
      return 'The requested resource was not found.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'The service is temporarily unavailable. Please try again later.';
    default:
      return errorDetails.message || 'An unexpected error occurred. Please try again.';
  }
};

export default apiClient; 