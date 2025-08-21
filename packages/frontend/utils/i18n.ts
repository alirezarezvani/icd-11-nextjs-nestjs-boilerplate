/**
 * Utility functions for internationalization
 * Provides helper functions for i18n operations
 */

import { SupportedLocale, TranslationParams } from '@/types/i18n';

// RTL language codes
export const RTL_LANGUAGES: SupportedLocale[] = ['ar'];

// Language configuration mapping
export const LANGUAGE_CONFIG = {
  en: {
    name: 'English',
    nativeName: 'English',
    dir: 'ltr' as const,
    flag: '🇺🇸',
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    dir: 'ltr' as const,
    flag: '🇪🇸',
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    dir: 'ltr' as const,
    flag: '🇫🇷',
  },
  ar: {
    name: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl' as const,
    flag: '🇸🇦',
  },
  zh: {
    name: 'Chinese',
    nativeName: '中文',
    dir: 'ltr' as const,
    flag: '🇨🇳',
  },
  ru: {
    name: 'Russian',
    nativeName: 'Русский',
    dir: 'ltr' as const,
    flag: '🇷🇺',
  },
} as const;

/**
 * Check if a language is RTL (Right-to-Left)
 */
export function isRTL(locale: SupportedLocale): boolean {
  return RTL_LANGUAGES.includes(locale);
}

/**
 * Get the text direction for a locale
 */
export function getTextDirection(locale: SupportedLocale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * Get language display name
 */
export function getLanguageName(locale: SupportedLocale, type: 'name' | 'native' = 'name'): string {
  const config = LANGUAGE_CONFIG[locale];
  return type === 'native' ? config.nativeName : config.name;
}

/**
 * Get all supported locales
 */
export function getSupportedLocales(): SupportedLocale[] {
  return Object.keys(LANGUAGE_CONFIG) as SupportedLocale[];
}

/**
 * Validate if a locale is supported
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return locale in LANGUAGE_CONFIG;
}

/**
 * Get browser preferred language
 */
export function getBrowserPreferredLanguage(): SupportedLocale {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const browserLang = window.navigator.language.split('-')[0] as SupportedLocale;
  return isSupportedLocale(browserLang) ? browserLang : 'en';
}

/**
 * Format translation parameters
 */
export function formatTranslationParams(params: TranslationParams): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(params)) {
    formatted[key] = String(value);
  }
  
  return formatted;
}

/**
 * Generate translation key path
 */
export function createTranslationKey(namespace: string, key: string): string {
  return `${namespace}:${key}`;
}

/**
 * Extract namespace from translation key
 */
export function extractNamespace(key: string): string {
  const parts = key.split(':');
  return parts.length > 1 ? parts[0] : 'common';
}

/**
 * Update document direction and language attributes with enhanced RTL support
 */
export function updateDocumentDirection(locale: SupportedLocale): void {
  if (typeof document === 'undefined') {
    return;
  }

  const direction = getTextDirection(locale);
  const isRTLLocale = isRTL(locale);
  
  // Update document attributes
  document.documentElement.dir = direction;
  document.documentElement.lang = locale;
  
  // Add/remove RTL class for additional styling
  if (isRTLLocale) {
    document.documentElement.classList.add('rtl');
    document.documentElement.classList.remove('ltr');
    document.body.classList.add('rtl-body');
    document.body.classList.remove('ltr-body');
  } else {
    document.documentElement.classList.add('ltr');
    document.documentElement.classList.remove('rtl');
    document.body.classList.add('ltr-body');
    document.body.classList.remove('rtl-body');
  }
  
  // Update viewport meta tag for better mobile RTL support
  let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    document.head.appendChild(viewport);
  }
  viewport.content = 'width=device-width, initial-scale=1, shrink-to-fit=no';
  
  // Dispatch event for components that need to know about direction changes
  const directionChangeEvent = new CustomEvent('directionchange', {
    detail: { locale, direction, isRTL: isRTLLocale }
  });
  document.dispatchEvent(directionChangeEvent);
}

/**
 * Create CSS class names for RTL support
 */
export function createRTLClasses(locale: SupportedLocale): string {
  const direction = getTextDirection(locale);
  const baseClasses = direction === 'rtl' ? 'rtl direction-rtl' : 'ltr direction-ltr';
  
  // Add locale-specific classes for better styling control
  return `${baseClasses} lang-${locale}`;
}

/**
 * Get RTL-aware CSS properties for inline styles
 */
export function getRTLStyles(locale: SupportedLocale): React.CSSProperties {
  const isRTLLocale = isRTL(locale);
  return {
    direction: isRTLLocale ? 'rtl' : 'ltr',
    textAlign: isRTLLocale ? 'right' : 'left',
    ...(locale === 'ar' && {
      fontFamily: '"Noto Sans Arabic", "Traditional Arabic", "Arial Unicode MS", sans-serif',
      lineHeight: '1.6'
    })
  };
}

/**
 * Get appropriate padding/margin classes for RTL
 */
export function getRTLSpacingClasses(locale: SupportedLocale, type: 'margin' | 'padding', side: 'start' | 'end', size: string): string {
  const isRTLLocale = isRTL(locale);
  const prefix = type === 'margin' ? 'm' : 'p';
  
  if (side === 'start') {
    return isRTLLocale ? `${prefix}r-${size}` : `${prefix}l-${size}`;
  } else {
    return isRTLLocale ? `${prefix}l-${size}` : `${prefix}r-${size}`;
  }
}

/**
 * Get appropriate float classes for RTL
 */
export function getRTLFloatClass(locale: SupportedLocale, side: 'start' | 'end'): string {
  const isRTLLocale = isRTL(locale);
  
  if (side === 'start') {
    return isRTLLocale ? 'float-right' : 'float-left';
  } else {
    return isRTLLocale ? 'float-left' : 'float-right';
  }
}

/**
 * Get text alignment class for RTL
 */
export function getRTLTextAlign(locale: SupportedLocale, align?: 'start' | 'end' | 'center'): string {
  if (align === 'center') return 'text-center';
  
  const isRTLLocale = isRTL(locale);
  
  if (align === 'start') {
    return isRTLLocale ? 'text-right' : 'text-left';
  } else if (align === 'end') {
    return isRTLLocale ? 'text-left' : 'text-right';
  }
  
  // Default alignment based on locale
  return isRTLLocale ? 'text-right' : 'text-left';
}

/**
 * Sort locales by native name for display
 */
export function getSortedLocales(): Array<{ code: SupportedLocale; name: string; nativeName: string }> {
  return getSupportedLocales()
    .map(code => ({
      code,
      name: LANGUAGE_CONFIG[code].name,
      nativeName: LANGUAGE_CONFIG[code].nativeName,
    }))
    .sort((a, b) => a.nativeName.localeCompare(b.nativeName));
}

/**
 * Get locale from path or subdomain
 */
export function getLocaleFromUrl(url: string): SupportedLocale | null {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length > 0) {
      const potentialLocale = pathSegments[0];
      return isSupportedLocale(potentialLocale) ? potentialLocale : null;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Create locale-aware URL
 */
export function createLocalizedUrl(path: string, locale: SupportedLocale): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `/${locale}/${cleanPath}`;
}

/**
 * Storage key for language preference
 */
export const LANGUAGE_STORAGE_KEY = 'icd11-preferred-language';

/**
 * Save language preference to localStorage
 */
export function saveLanguagePreference(locale: SupportedLocale): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    } catch (error) {
      console.warn('Failed to save language preference:', error);
    }
  }
}

/**
 * Load language preference from localStorage
 */
export function loadLanguagePreference(): SupportedLocale | null {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return saved && isSupportedLocale(saved) ? saved : null;
    } catch (error) {
      console.warn('Failed to load language preference:', error);
    }
  }
  
  return null;
}

export default {
  isRTL,
  getTextDirection,
  getLanguageName,
  getSupportedLocales,
  isSupportedLocale,
  getBrowserPreferredLanguage,
  formatTranslationParams,
  updateDocumentDirection,
  createRTLClasses,
  getSortedLocales,
  saveLanguagePreference,
  loadLanguagePreference,
};