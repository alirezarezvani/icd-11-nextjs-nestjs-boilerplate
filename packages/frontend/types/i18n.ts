/**
 * TypeScript definitions for i18n translations
 * Provides type safety for translation keys and parameters
 */

// Common namespace types
export interface CommonTranslations {
  nav: {
    search: string;
    about: string;
    openMenu: string;
  };
  footer: {
    copyright: string;
    aboutLink: string;
    dataSource: string;
  };
  meta: {
    defaultDescription: string;
    defaultTitle: string;
  };
  buttons: {
    submit: string;
    cancel: string;
    clear: string;
    search: string;
    reset: string;
    save: string;
    load: string;
    delete: string;
    edit: string;
    view: string;
    close: string;
    open: string;
    expand: string;
    collapse: string;
  };
  loading: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

// Search namespace types
export interface SearchTranslations {
  form: {
    labels: {
      searchTerm: string;
      searchLanguage: string;
      flexibleSearch: string;
    };
    placeholders: {
      searchInput: string;
    };
    buttons: {
      search: string;
      searching: string;
    };
    options: {
      title: string;
      flexibleSearchDescription: string;
    };
    stats: {
      searchingIn: string;
      language: string;
    };
  };
  languages: {
    en: string;
    es: string;
    fr: string;
    ar: string;
    zh: string;
    ru: string;
  };
  results: {
    title: string;
    noResults: string;
    noResultsDescription: string;
    loading: string;
    error: string;
    errorDescription: string;
    showingResults: string;
    foundResults: string;
    loadMore: string;
    viewDetails: string;
    copyCode: string;
    codeHierarchy: string;
    parentCodes: string;
    childCodes: string;
    relatedCodes: string;
  };
  filters: {
    title: string;
    clear: string;
    apply: string;
    category: string;
    chapter: string;
    codeType: string;
  };
}

// Medical namespace types
export interface MedicalTranslations {
  terms: {
    condition: string;
    disease: string;
    disorder: string;
    syndrome: string;
    symptom: string;
    diagnosis: string;
    treatment: string;
    procedure: string;
    medication: string;
    anatomy: string;
    pathology: string;
    epidemiology: string;
  };
  categories: {
    infectious: string;
    neoplasms: string;
    blood: string;
    endocrine: string;
    mental: string;
    nervous: string;
    sensory: string;
    circulatory: string;
    respiratory: string;
    digestive: string;
    skin: string;
    musculoskeletal: string;
    genitourinary: string;
    pregnancy: string;
    perinatal: string;
    congenital: string;
    symptoms: string;
    injury: string;
    external: string;
    health: string;
  };
  properties: {
    code: string;
    title: string;
    definition: string;
    inclusion: string;
    exclusion: string;
    synonym: string;
    parent: string;
    children: string;
    related: string;
  };
  search: {
    suggestions: {
      title: string;
      general: string;
      terminology: string;
      spelling: string;
      flexible: string;
      language: string;
    };
  };
}

// Errors namespace types
export interface ErrorsTranslations {
  search: {
    title: string;
    message: string;
    description: string;
    noResults: string;
    noResultsDescription: string;
    noResultsSubtext: string;
    tryAgain: string;
  };
  network: {
    title: string;
    message: string;
    description: string;
    timeout: string;
    offline: string;
  };
  api: {
    title: string;
    message: string;
    description: string;
    rateLimit: string;
    invalidRequest: string;
    notFound: string;
    serverError: string;
  };
  validation: {
    required: string;
    minLength: string;
    maxLength: string;
    invalidFormat: string;
    invalidLanguage: string;
    emptySearch: string;
  };
  general: {
    title: string;
    message: string;
    description: string;
    retry: string;
    contact: string;
    goHome: string;
  };
}

// Accessibility namespace types
export interface AccessibilityTranslations {
  labels: {
    mainContent: string;
    navigation: string;
    search: string;
    results: string;
    pagination: string;
    languageSelector: string;
    menu: string;
    close: string;
    open: string;
    expand: string;
    collapse: string;
    loading: string;
    error: string;
  };
  descriptions: {
    searchForm: string;
    searchInput: string;
    languageSelect: string;
    flexibleSearch: string;
    searchButton: string;
    resultsList: string;
    resultItem: string;
    loadMore: string;
    pagination: string;
  };
  announcements: {
    searchStarted: string;
    searchCompleted: string;
    searchFailed: string;
    noResults: string;
    pageChanged: string;
    languageChanged: string;
    flexibleSearchEnabled: string;
    flexibleSearchDisabled: string;
  };
  instructions: {
    searchTips: string;
    navigation: string;
    keyboard: string;
  };
  errors: {
    required: string;
    invalid: string;
    searchFailed: string;
    networkError: string;
  };
}

// Complete translation structure
export interface Translations {
  common: CommonTranslations;
  search: SearchTranslations;
  medical: MedicalTranslations;
  errors: ErrorsTranslations;
  accessibility: AccessibilityTranslations;
}

// Translation key paths type for type safety
export type TranslationKeys = 
  | keyof CommonTranslations
  | `search.${keyof SearchTranslations}`
  | `medical.${keyof MedicalTranslations}`
  | `errors.${keyof ErrorsTranslations}`
  | `accessibility.${keyof AccessibilityTranslations}`;

// Supported language codes
export type SupportedLocale = 'en' | 'es' | 'fr' | 'ar' | 'zh' | 'ru';

// Translation parameters interface for interpolation
export interface TranslationParams {
  [key: string]: string | number;
}

// Hook return type for useTranslation
export interface UseTranslationReturn {
  t: (key: string, params?: TranslationParams) => string;
  ready: boolean;
  i18n: {
    language: string;
    changeLanguage: (lng: string) => void;
    dir: () => 'ltr' | 'rtl';
  };
}

// Extended next-i18next types
declare module 'next-i18next' {
  interface Resources {
    common: CommonTranslations;
    search: SearchTranslations;
    medical: MedicalTranslations;
    errors: ErrorsTranslations;
    accessibility: AccessibilityTranslations;
  }
}

export default Translations;