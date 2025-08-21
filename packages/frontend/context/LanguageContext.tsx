import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { SupportedLanguage } from '@shared/types/icd11';
import { 
  updateDocumentDirection, 
  saveLanguagePreference, 
  loadLanguagePreference,
  getBrowserPreferredLanguage,
  isSupportedLocale
} from '@/utils/i18n';

// Language configuration
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  ar: 'العربية',
  zh: '中文',
  ru: 'Русский',
} as const;

// Language context interface
interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  availableLanguages: typeof SUPPORTED_LANGUAGES;
  getLanguageName: (code: SupportedLanguage) => string;
  isRTL: boolean;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider props
interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: SupportedLanguage;
}

// RTL languages
const RTL_LANGUAGES: SupportedLanguage[] = ['ar'];

// Context provider component
export function LanguageProvider({ 
  children, 
  defaultLanguage = 'en' 
}: LanguageProviderProps) {
  const router = useRouter();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    (router.locale as SupportedLanguage) || defaultLanguage
  );

  // Initialize language from router or saved preference
  useEffect(() => {
    const routerLocale = router.locale as SupportedLanguage;
    const savedLanguage = loadLanguagePreference();
    const browserLanguage = getBrowserPreferredLanguage();
    
    let initialLanguage: SupportedLanguage = defaultLanguage;
    
    if (routerLocale && isSupportedLocale(routerLocale)) {
      initialLanguage = routerLocale;
    } else if (savedLanguage) {
      initialLanguage = savedLanguage;
    } else if (browserLanguage) {
      initialLanguage = browserLanguage;
    }
    
    if (initialLanguage !== currentLanguage) {
      setCurrentLanguage(initialLanguage);
    }
  }, [router.locale, defaultLanguage, currentLanguage]);

  // Update document direction and save preference when language changes
  useEffect(() => {
    updateDocumentDirection(currentLanguage);
    saveLanguagePreference(currentLanguage);
  }, [currentLanguage]);

  // Enhanced setLanguage function with router navigation
  const setLanguage = async (language: SupportedLanguage) => {
    if (language in SUPPORTED_LANGUAGES) {
      setCurrentLanguage(language);
      
      // Navigate to new locale route
      await router.push(router.asPath, router.asPath, { locale: language });
    } else {
      console.warn(`Unsupported language: ${language}`);
    }
  };

  const getLanguageName = (code: SupportedLanguage): string => {
    return SUPPORTED_LANGUAGES[code] || code;
  };

  const isRTL = RTL_LANGUAGES.includes(currentLanguage);

  const contextValue: LanguageContextType = {
    currentLanguage,
    setLanguage,
    availableLanguages: SUPPORTED_LANGUAGES,
    getLanguageName,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook for using the language context
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}

// Custom hook for getting localized text
export function useLocalizedText() {
  const { currentLanguage } = useLanguage();
  
  const getText = (textMap: Record<string, string>, fallback = ''): string => {
    return textMap[currentLanguage] || textMap.en || fallback;
  };
  
  return { getText, currentLanguage };
}