import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage } from '@shared/types/icd11';

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

// Language storage key
const LANGUAGE_STORAGE_KEY = 'icd11-preferred-language';

// RTL languages
const RTL_LANGUAGES: SupportedLanguage[] = ['ar'];

// Context provider component
export function LanguageProvider({ 
  children, 
  defaultLanguage = 'en' 
}: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(defaultLanguage);

  // Load language preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage;
      if (savedLanguage && savedLanguage in SUPPORTED_LANGUAGES) {
        setCurrentLanguage(savedLanguage);
      } else {
        // Try to detect browser language
        const browserLanguage = navigator.language.split('-')[0] as SupportedLanguage;
        if (browserLanguage in SUPPORTED_LANGUAGES) {
          setCurrentLanguage(browserLanguage);
        }
      }
    }
  }, []);

  // Save language preference to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
    }
  }, [currentLanguage]);

  // Update document direction for RTL languages
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = RTL_LANGUAGES.includes(currentLanguage) ? 'rtl' : 'ltr';
      document.documentElement.lang = currentLanguage;
    }
  }, [currentLanguage]);

  const setLanguage = (language: SupportedLanguage) => {
    if (language in SUPPORTED_LANGUAGES) {
      setCurrentLanguage(language);
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