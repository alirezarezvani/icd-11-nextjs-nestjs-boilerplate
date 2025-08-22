/**
 * Token Management Service for ICD-11 Healthcare Platform
 * Handles JWT token refresh, storage, and automatic refresh logic
 */

import { tokenStorage, isTokenExpired, willTokenExpireSoon } from '../../utils/storage';
import { AuthResponse, RefreshTokenDto } from './auth.types';

class TokenService {
  private refreshPromise: Promise<string> | null = null;
  private refreshTimeoutId: NodeJS.Timeout | null = null;

  /**
   * Set authentication tokens
   */
  setTokens(tokens: AuthResponse, rememberMe = false): void {
    tokenStorage.setAccessToken(tokens.accessToken);
    tokenStorage.setRefreshToken(tokens.refreshToken, rememberMe);
    
    // Schedule automatic refresh
    this.scheduleTokenRefresh(tokens.accessToken);
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return tokenStorage.getAccessToken();
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    return tokenStorage.getRefreshToken();
  }

  /**
   * Check if user is authenticated (has valid tokens)
   */
  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    // If no tokens, not authenticated
    if (!accessToken || !refreshToken) {
      return false;
    }

    // If access token is valid, authenticated
    if (!isTokenExpired(accessToken)) {
      return true;
    }

    // If refresh token is valid, we can potentially refresh
    return !isTokenExpired(refreshToken);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<string> {
    // If already refreshing, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken || isTokenExpired(refreshToken)) {
      this.clearTokens();
      throw new Error('No valid refresh token available');
    }

    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      const newAccessToken = await this.refreshPromise;
      return newAccessToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh API call
   */
  private async performTokenRefresh(refreshToken: string): Promise<string> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken } as RefreshTokenDto),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data: AuthResponse = await response.json();
      
      // Update stored tokens
      const rememberMe = tokenStorage.getRememberMe();
      this.setTokens(data, rememberMe);
      
      return data.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(accessToken: string): void {
    // Clear existing timeout
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
    }

    try {
      // Parse token to get expiry time
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      // Refresh 5 minutes before expiry (or halfway through token lifetime, whichever is sooner)
      const refreshBuffer = Math.min(5 * 60 * 1000, (expiryTime - currentTime) / 2);
      const refreshTime = expiryTime - refreshBuffer;
      const timeUntilRefresh = refreshTime - currentTime;

      // Only schedule if we have enough time
      if (timeUntilRefresh > 0) {
        this.refreshTimeoutId = setTimeout(() => {
          this.refreshToken().catch(error => {
            console.error('Automatic token refresh failed:', error);
          });
        }, timeUntilRefresh);
      }
    } catch (error) {
      console.error('Failed to schedule token refresh:', error);
    }
  }

  /**
   * Get access token, refreshing if necessary
   */
  async getValidAccessToken(): Promise<string | null> {
    const accessToken = this.getAccessToken();
    
    if (!accessToken) {
      return null;
    }

    // If token is still valid and not expiring soon, return it
    if (!isTokenExpired(accessToken) && !willTokenExpireSoon(accessToken)) {
      return accessToken;
    }

    // Try to refresh the token
    try {
      return await this.refreshToken();
    } catch (error) {
      console.error('Failed to get valid access token:', error);
      return null;
    }
  }

  /**
   * Clear all tokens and cancel refresh timer
   */
  clearTokens(): void {
    tokenStorage.clearTokens();
    
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

    if (this.refreshPromise) {
      this.refreshPromise = null;
    }
  }

  /**
   * Add auth header to request config
   */
  async addAuthHeader(config: RequestInit = {}): Promise<RequestInit> {
    const accessToken = await this.getValidAccessToken();
    
    if (accessToken) {
      return {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      };
    }

    return config;
  }

  /**
   * Create an authenticated fetch wrapper
   */
  async authFetch(url: string, config: RequestInit = {}): Promise<Response> {
    const authConfig = await this.addAuthHeader(config);
    const response = await fetch(url, authConfig);

    // If we get a 401, try to refresh token and retry once
    if (response.status === 401 && !(config.headers as any)?.['X-Retry-After-Refresh']) {
      try {
        await this.refreshToken();
        const retryConfig = await this.addAuthHeader({
          ...config,
          headers: {
            ...config.headers,
            'X-Retry-After-Refresh': 'true',
          },
        });
        return fetch(url, retryConfig);
      } catch (error) {
        // Refresh failed, return original response
        return response;
      }
    }

    return response;
  }

  /**
   * Logout and clear all tokens
   */
  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    
    // Clear tokens first to prevent further requests
    this.clearTokens();

    // Try to notify the server (best effort)
    if (refreshToken) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        // Ignore logout errors
        console.warn('Logout API call failed:', error);
      }
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<void> {
    const accessToken = this.getAccessToken();
    
    // Clear tokens first
    this.clearTokens();

    // Try to notify the server
    if (accessToken) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout-all`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (error) {
        // Ignore logout errors
        console.warn('Logout all API call failed:', error);
      }
    }
  }
}

// Export singleton instance
export const tokenService = new TokenService();
export default tokenService;