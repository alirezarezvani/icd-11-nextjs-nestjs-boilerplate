/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr', 'ar', 'zh', 'ru'],
    localeDetection: false, // Prevent automatic locale detection to avoid hydration issues
  },
  localePath: typeof window === 'undefined' 
    ? require('path').resolve('./public/locales')
    : '/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  /**
   * @link https://github.com/isaachinman/next-i18next#6-advanced-configuration
   */
  // saveMissing: false,
  strictMode: true,
  serializeConfig: false,
  react: {
    useSuspense: false,
  },
  // Namespace configuration
  ns: ['common', 'search', 'medical', 'errors', 'accessibility'],
  defaultNS: 'common',
  fallbackNS: 'common',
  // Return keys for missing translations instead of empty strings
  returnEmptyString: false,
  // Use cimode for debugging missing translations
  debug: process.env.NODE_ENV === 'development',
  interpolation: {
    escapeValue: false, // React already does escaping
  },
  // Support for RTL languages
  supportedLngs: ['en', 'es', 'fr', 'ar', 'zh', 'ru'],
  nonExplicitSupportedLngs: true,
};