import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { icd11Service } from '../services/api/icd11.service';
import { ICD11SearchResult, ICD11SearchParams, SupportedLanguage } from '@shared/types/icd11';
import { PaginatedResponse } from '@shared/types/api';
import config from '../config';

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
}

export const useICD11Search = (options: UseICD11SearchOptions = {}): UseICD11SearchResult => {
  const [searchParams, setSearchParams] = useState<ICD11SearchParams>({
    term: options.initialTerm || '',
    language: options.language || (config.app.defaultLanguage as SupportedLanguage),
    flexisearch: options.flexisearch !== undefined ? options.flexisearch : true,
    limit: options.limit || config.pagination.defaultLimit,
    page: 1,
  });
  
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
    () => icd11Service.search(debouncedSearchParams),
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
  };
}; 