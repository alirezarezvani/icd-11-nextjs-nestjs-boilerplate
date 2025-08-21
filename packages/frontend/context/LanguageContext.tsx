import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
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
  const { i18n } = useTranslation();
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    (router.locale as SupportedLanguage) || defaultLanguage
  );

  // Track hydration status
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize language from router or saved preference - only after hydration
  useEffect(() => {
    // Only run after hydration to avoid SSR/CSR mismatches
    if (!isHydrated) return;
    
    const routerLocale = router.locale as SupportedLanguage;
    let initialLanguage: SupportedLanguage = defaultLanguage;
    
    // Prioritize router locale for SSR consistency
    if (routerLocale && isSupportedLocale(routerLocale)) {
      initialLanguage = routerLocale;
    } else {
      // Only use saved preferences after first hydration
      const savedLanguage = loadLanguagePreference();
      const browserLanguage = getBrowserPreferredLanguage();
      
      if (savedLanguage) {
        initialLanguage = savedLanguage;
      } else if (browserLanguage) {
        initialLanguage = browserLanguage;
      }
    }
    
    if (initialLanguage !== currentLanguage) {
      setCurrentLanguage(initialLanguage);
      // Sync with next-i18next
      if (i18n && i18n.language !== initialLanguage) {
        i18n.changeLanguage(initialLanguage);
      }
    }
  }, [isHydrated, router.locale, defaultLanguage, i18n]); // Include isHydrated in deps

  // Update document direction and save preference when language changes - only after hydration
  useEffect(() => {
    // Only update DOM after hydration to avoid hydration mismatches
    if (!isHydrated) return;
    
    updateDocumentDirection(currentLanguage);
    saveLanguagePreference(currentLanguage);
  }, [isHydrated, currentLanguage]);

  // Enhanced setLanguage function with router navigation
  const setLanguage = async (language: SupportedLanguage) => {
    if (language in SUPPORTED_LANGUAGES) {
      setCurrentLanguage(language);
      
      // Sync with next-i18next
      if (i18n && i18n.language !== language) {
        await i18n.changeLanguage(language);
      }
      
      // Navigate to new locale route
      await router.push(router.asPath, router.asPath, { locale: language });
    } else {
      console.warn(`Unsupported language: ${language}`);
    }
  };

  const getLanguageName = (code: SupportedLanguage): string => {
    return SUPPORTED_LANGUAGES[code] || code;
  };

  // Use router locale for initial SSR consistency, then currentLanguage after hydration
  const displayLanguage = isHydrated ? currentLanguage : (router.locale as SupportedLanguage || defaultLanguage);
  const isRTL = RTL_LANGUAGES.includes(displayLanguage);

  const contextValue: LanguageContextType = {
    currentLanguage: displayLanguage,
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