import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useICD11Search } from '@/hooks';
import { ICD11SearchParams } from '@/services/api';
import { ICD11SearchResult, PaginatedResponse } from '@/types';
import { ICD11_CONFIG } from '@/config';

// Context type definition
interface ICD11ContextType {
  // Search state
  searchParams: ICD11SearchParams;
  results: PaginatedResponse<ICD11SearchResult> | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  search: (params?: Partial<ICD11SearchParams>) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setLanguage: (language: string) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  toggleFlexisearch: () => void;
  clearResults: () => void;
  resetSearch: () => void;
}

// Create context with initial empty values
const ICD11Context = createContext<ICD11ContextType | undefined>(undefined);

// Provider props
interface ICD11ProviderProps {
  children: ReactNode;
  initialTerm?: string;
  initialLanguage?: string;
}

// Context provider component
export function ICD11Provider({
  children,
  initialTerm = '',
  initialLanguage = ICD11_CONFIG.DEFAULT_LANGUAGE,
}: ICD11ProviderProps) {
  // Initialize search parameters
  const [searchParams, setSearchParams] = useState<ICD11SearchParams>({
    term: initialTerm,
    language: initialLanguage,
    page: 1,
    limit: ICD11_CONFIG.PAGINATION.DEFAULT_LIMIT,
    flexisearch: true,
    flatResults: false,
    includeDescendants: false
  });

  // Use the search hook
  const {
    search: performSearch,
    results,
    isLoading,
    error,
    resetSearch: resetSearchHook,
    setOptions
  } = useICD11Search({
    initialTerm,
    language: initialLanguage,
    limit: ICD11_CONFIG.PAGINATION.DEFAULT_LIMIT,
    flexisearch: true,
    flatResults: false,
    includeDescendants: false
  });

  // Action handlers
  const search = useCallback(async (params?: Partial<ICD11SearchParams>) => {
    if (params) {
      setSearchParams(prev => ({ ...prev, ...params }));
      setOptions(params);
    }
    await performSearch(params?.term || searchParams.term, params?.page || searchParams.page);
  }, [performSearch, searchParams, setOptions]);

  const setSearchTerm = useCallback((term: string) => {
    setSearchParams(prev => ({ ...prev, term, page: 1 }));
    search({ term, page: 1 });
  }, [search]);

  const setLanguage = useCallback((language: string) => {
    setSearchParams(prev => ({ ...prev, language }));
    setOptions({ language });
    search({ language });
  }, [search, setOptions]);

  const setPage = useCallback((page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
    search({ page });
  }, [search]);

  const setLimit = useCallback((limit: number) => {
    setSearchParams(prev => ({ ...prev, limit }));
    setOptions({ limit });
    search({ limit });
  }, [search, setOptions]);

  const toggleFlexisearch = useCallback(() => {
    setSearchParams(prev => ({ ...prev, flexisearch: !prev.flexisearch }));
    setOptions({ flexisearch: !searchParams.flexisearch });
    search({ flexisearch: !searchParams.flexisearch });
  }, [search, searchParams.flexisearch, setOptions]);

  const clearResults = useCallback(() => {
    setSearchParams(prev => ({ ...prev, term: '' }));
    resetSearchHook();
  }, [resetSearchHook]);

  const resetSearch = useCallback(() => {
    setSearchParams({
      term: '',
      language: initialLanguage,
      page: 1,
      limit: ICD11_CONFIG.PAGINATION.DEFAULT_LIMIT,
      flexisearch: true,
      flatResults: false,
      includeDescendants: false
    });
    resetSearchHook();
  }, [initialLanguage, resetSearchHook]);

  const contextValue: ICD11ContextType = {
    searchParams,
    results,
    isLoading,
    error,
    search,
    setSearchTerm,
    setLanguage,
    setPage,
    setLimit,
    toggleFlexisearch,
    clearResults,
    resetSearch
  };

  return (
    <ICD11Context.Provider value={contextValue}>
      {children}
    </ICD11Context.Provider>
  );
}

// Custom hook for using the context
export function useICD11Context() {
  const context = useContext(ICD11Context);
  
  if (context === undefined) {
    throw new Error('useICD11Context must be used within an ICD11Provider');
  }
  
  return context;
} 