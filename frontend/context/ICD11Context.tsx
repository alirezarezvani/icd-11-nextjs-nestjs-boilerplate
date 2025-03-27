import { createContext, useContext, ReactNode } from 'react';
import { useICD11Search } from '@/hooks';
import { ICD11SearchParams } from '@/services/api';
import { ICD11SearchResult, PaginatedResponse } from '@/types';

// Context type definition
interface ICD11ContextType {
  // Search state
  searchParams: ICD11SearchParams;
  results: PaginatedResponse<ICD11SearchResult> | null;
  isLoading: boolean;
  error: Error | null;
  
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
  autoSearch?: boolean;
}

// Context provider component
export function ICD11Provider({
  children,
  initialTerm = '',
  initialLanguage,
  autoSearch = false,
}: ICD11ProviderProps) {
  // Use the search hook
  const icd11Search = useICD11Search({
    initialTerm,
    initialLanguage,
    autoSearch,
  });

  return (
    <ICD11Context.Provider value={icd11Search}>
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