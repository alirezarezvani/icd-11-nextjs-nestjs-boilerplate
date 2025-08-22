import { createContext, useContext, ReactNode } from 'react';
import { useICD11Search } from '@/hooks';
import { ICD11SearchParams, ICD11SearchResult } from '@shared/types/icd11';
import { PaginatedResponse } from '@shared/types/api';

// Context type definition
interface ICD11ContextType {
  search: (params: Partial<ICD11SearchParams>) => void;
  results: PaginatedResponse<ICD11SearchResult> | null;
  isLoading: boolean;
  error: Error | null;
  searchParams: ICD11SearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<ICD11SearchParams>>;
  // Search history tracking status (informational)
  isTrackingEnabled: boolean;
  lastSearchTracked: boolean;
}

// Create context with initial empty values
const ICD11Context = createContext<ICD11ContextType | undefined>(undefined);

// Provider props
interface ICD11ProviderProps {
  children: ReactNode;
}

// Context provider component
export function ICD11Provider({ children }: ICD11ProviderProps) {
  const searchState = useICD11Search();

  return (
    <ICD11Context.Provider value={searchState}>
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