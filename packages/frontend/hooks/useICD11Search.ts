import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { icd11Service } from '../services/api/icd11.service';
import { ICD11SearchResult, ICD11SearchParams, ICD11SearchCategory, ICD11SearchScope, SupportedLanguage } from '../types/icd11';
import { PaginatedResponse } from '../types/api';
import config from '../config';
import { useAuth } from './useAuth';

interface UseICD11SearchOptions {
  initialTerm?: string;
  language?: SupportedLanguage;
  flexisearch?: boolean;
  limit?: number;
  debounceMs?: number;
}

interface UseICD11SearchResult {
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

export const useICD11Search = (options: UseICD11SearchOptions = {}): UseICD11SearchResult => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useState<ICD11SearchParams>({
    term: options.initialTerm || '',
    language: options.language || (config.app.defaultLanguage as SupportedLanguage),
    flexisearch: options.flexisearch !== undefined ? options.flexisearch : true,
    limit: options.limit || config.pagination.defaultLimit,
    page: 1,
    scope: ICD11SearchScope.ALL,
    includeDeprecated: false,
    leafNodesOnly: false,
  });

  // Track whether the last search was tracked (for first page searches by authenticated users)
  const [lastSearchTracked, setLastSearchTracked] = useState(false);
  
  const [debouncedSearchParams, setDebouncedSearchParams] = useState<ICD11SearchParams>(searchParams);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const debounceMs = options.debounceMs || 500; // Default 500ms debounce

  // Debounce search params to prevent too many API calls
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchParams(searchParams);
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchParams, debounceMs]);

  const { data, error, isLoading, refetch } = useQuery<PaginatedResponse<ICD11SearchResult>, Error>(
    ['icd11-search', debouncedSearchParams],
    async () => {
      const results = await icd11Service.search(debouncedSearchParams);
      
      // Update tracking status based on search conditions
      // Backend automatically tracks if: user is authenticated, page === 1, and term exists
      const willBeTracked = isAuthenticated && 
                           debouncedSearchParams.page === 1 && 
                           !!debouncedSearchParams.term && 
                           debouncedSearchParams.term.length >= 2;
      
      setLastSearchTracked(willBeTracked);
      
      return results;
    },
    {
      enabled: !!debouncedSearchParams.term && debouncedSearchParams.term.length >= 2, // Only search with 2+ characters
      retry: 2, // Limit retries for failed requests
      refetchOnWindowFocus: false, // Don't refetch on window focus
    }
  );

  const search = useCallback((params: Partial<ICD11SearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...params }));
  }, []);

  return {
    search,
    results: data || null,
    isLoading,
    error,
    searchParams,
    setSearchParams,
    // Search history tracking status (informational)
    isTrackingEnabled: isAuthenticated,
    lastSearchTracked,
  };
}; 