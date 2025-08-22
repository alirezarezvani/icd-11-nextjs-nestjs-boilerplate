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

    // Handle other errors
    if (error.response) {
      console.error('API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('API No Response Error:', error.request);
    } else {
      console.error('API Request Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Type for query parameters
export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

// Generic wrapper for axios requests
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

export default apiClient; 