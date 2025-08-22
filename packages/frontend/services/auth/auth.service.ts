/**
 * Authentication service for ICD-11 Healthcare Platform
 * Handles all authentication-related API calls
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { tokenService } from './tokenService';
import { userStorage } from '../../utils/storage';
import {
  User,
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  AuthResponse,
  ApiResponse,
  ApiError,
} from './auth.types';

class AuthService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';
    
    // Create axios instance
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Setup request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await tokenService.getValidAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Setup response interceptor for token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await tokenService.refreshToken();
            // Retry original request with new token
            const token = await tokenService.getValidAccessToken();
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect
            tokenService.clearTokens();
            userStorage.clearUser();
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Register a new user
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post(
        '/auth/register',
        data
      );
      
      const authData = response.data.data!;
      tokenService.setTokens(authData, false); // Default to not remember for registration
      userStorage.setUser(authData.user);
      
      return authData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post(
        '/auth/login',
        credentials
      );
      
      const authData = response.data.data!;
      tokenService.setTokens(authData, credentials.rememberMe || false);
      userStorage.setUser(authData.user);
      
      return authData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user (current session)
   */
  async logout(): Promise<void> {
    await tokenService.logout();
    userStorage.clearUser();
  }

  /**
   * Logout all sessions
   */
  async logoutAll(): Promise<void> {
    await tokenService.logoutAll();
    userStorage.clearUser();
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<void> {
    await tokenService.refreshToken();
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/profile');
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await this.api.put('/auth/profile', data);
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate current token
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.api.post('/auth/validate');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenService.isAuthenticated();
  }

  /**
   * Get access token from storage
   */
  getAccessToken(): string | null {
    return tokenService.getAccessToken();
  }

  /**
   * Get refresh token from storage
   */
  getRefreshToken(): string | null {
    return tokenService.getRefreshToken();
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      
      if (apiError) {
        const message = Array.isArray(apiError.message) 
          ? apiError.message.join(', ')
          : apiError.message || apiError.error;
        
        const customError = new Error(message);
        (customError as any).code = apiError.statusCode;
        (customError as any).field = apiError.error;
        
        return customError;
      }
    }

    return error instanceof Error ? error : new Error('An unexpected error occurred');
  }

  /**
   * Create a pre-configured axios instance for external use
   */
  getApiInstance(): AxiosInstance {
    return this.api;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;