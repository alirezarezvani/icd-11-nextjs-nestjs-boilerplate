/**
 * Application configuration 
 */
const config = {
  // API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api',
    timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT || 10000),
  },
  
  // Pagination defaults
  pagination: {
    defaultLimit: Number(process.env.NEXT_PUBLIC_RESULTS_PER_PAGE || 20),
  },
  
  // App details
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'ICD-11 Search',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
  },
  features: {
    enableBrowserMode: process.env.NEXT_PUBLIC_ENABLE_BROWSER_MODE === 'true',
  },
  icd11: {
    defaultLanguages: ['en', 'es', 'fr', 'ar', 'zh', 'ru'],
  },
};

export const ICD11_CONFIG = {
  DEFAULT_LANGUAGE: 'en',
  AVAILABLE_LANGUAGES: ['en', 'es', 'fr', 'ar', 'zh', 'ru'],
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003',
  SEARCH_DEBOUNCE_MS: 300,
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  }
};

export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  ENTITY: '/entity'
};

export default {
  ICD11_CONFIG,
  ROUTES,
  ...config
}; 