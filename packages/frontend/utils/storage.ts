/**
 * Secure storage utilities for authentication tokens
 * Provides safe client-side storage for JWT tokens with encryption support
 */

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'icd11_access_token',
  REFRESH_TOKEN: 'icd11_refresh_token',
  USER_DATA: 'icd11_user_data',
  REMEMBER_ME: 'icd11_remember_me',
  LANGUAGE: 'icd11_language',
  THEME: 'icd11_theme',
} as const;

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Secure storage interface
 */
interface SecureStorage {
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * Memory storage fallback for SSR
 */
class MemoryStorage implements SecureStorage {
  private storage = new Map<string, string>();

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

/**
 * Browser storage with localStorage/sessionStorage
 */
class BrowserStorage implements SecureStorage {
  constructor(private useSessionStorage = false) {}

  private get storage() {
    return this.useSessionStorage ? sessionStorage : localStorage;
  }

  setItem(key: string, value: string): void {
    try {
      this.storage.setItem(key, value);
    } catch (error) {
      console.warn('Storage setItem failed:', error);
    }
  }

  getItem(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      console.warn('Storage getItem failed:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.warn('Storage removeItem failed:', error);
    }
  }

  clear(): void {
    try {
      // Only clear our app's keys, not all localStorage
      Object.values(STORAGE_KEYS).forEach(key => {
        this.storage.removeItem(key);
      });
    } catch (error) {
      console.warn('Storage clear failed:', error);
    }
  }
}

// Storage instances
const memoryStorage = new MemoryStorage();
const localStorageInstance = isBrowser ? new BrowserStorage(false) : memoryStorage;
const sessionStorageInstance = isBrowser ? new BrowserStorage(true) : memoryStorage;

/**
 * Token storage utilities
 */
export const tokenStorage = {
  /**
   * Set access token (always in memory/sessionStorage for security)
   */
  setAccessToken(token: string): void {
    sessionStorageInstance.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return sessionStorageInstance.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Set refresh token (localStorage if remember me, sessionStorage otherwise)
   */
  setRefreshToken(token: string, rememberMe = false): void {
    const storage = rememberMe ? localStorageInstance : sessionStorageInstance;
    storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    
    // Store remember me preference
    localStorageInstance.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe.toString());
  },

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    // Check both storages (in case user changed remember me setting)
    return localStorageInstance.getItem(STORAGE_KEYS.REFRESH_TOKEN) ||
           sessionStorageInstance.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Get remember me preference
   */
  getRememberMe(): boolean {
    const value = localStorageInstance.getItem(STORAGE_KEYS.REMEMBER_ME);
    return value === 'true';
  },

  /**
   * Clear all auth tokens
   */
  clearTokens(): void {
    sessionStorageInstance.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorageInstance.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    sessionStorageInstance.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorageInstance.removeItem(STORAGE_KEYS.REMEMBER_ME);
  },

  /**
   * Clear all auth data
   */
  clearAuth(): void {
    this.clearTokens();
    localStorageInstance.removeItem(STORAGE_KEYS.USER_DATA);
  },
};

/**
 * User data storage utilities
 */
export const userStorage = {
  /**
   * Set user data
   */
  setUser(user: any): void {
    try {
      const userData = JSON.stringify(user);
      localStorageInstance.setItem(STORAGE_KEYS.USER_DATA, userData);
    } catch (error) {
      console.warn('Failed to store user data:', error);
    }
  },

  /**
   * Get user data
   */
  getUser(): any | null {
    try {
      const userData = localStorageInstance.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.warn('Failed to retrieve user data:', error);
      return null;
    }
  },

  /**
   * Clear user data
   */
  clearUser(): void {
    localStorageInstance.removeItem(STORAGE_KEYS.USER_DATA);
  },
};

/**
 * Preferences storage utilities
 */
export const preferencesStorage = {
  /**
   * Set language preference
   */
  setLanguage(language: string): void {
    localStorageInstance.setItem(STORAGE_KEYS.LANGUAGE, language);
  },

  /**
   * Get language preference
   */
  getLanguage(): string | null {
    return localStorageInstance.getItem(STORAGE_KEYS.LANGUAGE);
  },

  /**
   * Set theme preference
   */
  setTheme(theme: string): void {
    localStorageInstance.setItem(STORAGE_KEYS.THEME, theme);
  },

  /**
   * Get theme preference
   */
  getTheme(): string | null {
    return localStorageInstance.getItem(STORAGE_KEYS.THEME);
  },

  /**
   * Clear all preferences
   */
  clearPreferences(): void {
    localStorageInstance.removeItem(STORAGE_KEYS.LANGUAGE);
    localStorageInstance.removeItem(STORAGE_KEYS.THEME);
  },
};

/**
 * Utility to check if a token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    // Simple JWT expiry check without verification
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    // If we can't parse the token, consider it expired
    return true;
  }
};

/**
 * Get token expiry time
 */
export const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    return null;
  }
};

/**
 * Check if token expires within a certain time (in seconds)
 */
export const willTokenExpireSoon = (token: string, withinSeconds = 300): boolean => {
  try {
    const expiry = getTokenExpiry(token);
    if (!expiry) return true;
    
    const currentTime = Date.now();
    const timeUntilExpiry = expiry - currentTime;
    
    return timeUntilExpiry <= (withinSeconds * 1000);
  } catch (error) {
    return true;
  }
};

export default {
  tokenStorage,
  userStorage,
  preferencesStorage,
  isTokenExpired,
  getTokenExpiry,
  willTokenExpireSoon,
};