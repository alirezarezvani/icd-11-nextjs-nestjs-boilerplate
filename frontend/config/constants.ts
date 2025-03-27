/**
 * Application constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  TIMEOUT: 10000, // 10 seconds
};

// ICD-11 Configuration
export const ICD11_CONFIG = {
  DEFAULT_LANGUAGE: 'en',
  AVAILABLE_LANGUAGES: ['en', 'es', 'fr', 'ar', 'zh', 'ru'],
  RESULTS_PER_PAGE: 20,
};

// UI Configuration
export const UI_CONFIG = {
  THEME: {
    PRIMARY_COLOR: '#3B82F6', // Blue-500
    SECONDARY_COLOR: '#10B981', // Emerald-500
    ACCENT_COLOR: '#8B5CF6', // Violet-500
    DANGER_COLOR: '#EF4444', // Red-500
    WARNING_COLOR: '#F59E0B', // Amber-500
    SUCCESS_COLOR: '#10B981', // Emerald-500
    INFO_COLOR: '#3B82F6', // Blue-500
  },
  ANIMATION: {
    DEFAULT_DURATION: 300, // ms
    TRANSITION_EASE: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536,
  },
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ADVANCED_SEARCH: true,
  ENABLE_HISTORY: true,
  ENABLE_FAVORITES: true,
  ENABLE_DARK_MODE: true,
};

// Cache Configuration
export const CACHE_CONFIG = {
  TTL: 3600, // 1 hour in seconds
  MAX_ITEMS: 100,
};

// App Routes
export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  ENTITY: '/entity',
  FAVORITES: '/favorites',
  HISTORY: '/history',
  ABOUT: '/about',
};

// Error Messages
export const ERROR_MESSAGES = {
  GENERAL: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your internet connection.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  SEARCH_FAILED: 'Search failed. Please try again with different terms.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ADDED_TO_FAVORITES: 'Added to favorites.',
  REMOVED_FROM_FAVORITES: 'Removed from favorites.',
  SEARCH_COMPLETE: 'Search completed successfully.',
}; 