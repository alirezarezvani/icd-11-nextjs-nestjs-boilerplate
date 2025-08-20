import { useState, useCallback } from 'react';
import { useQuery } from 'react-query';
import { icd11Service } from '../services/api/icd11.service';
import { ICD11SearchResult, ICD11SearchParams } from '@shared/types/icd11';
import { PaginatedResponse } from '@shared/types/api';
import config from '../config';

interface UseICD11SearchOptions {
  initialTerm?: string;
  language?: string;
  flexisearch?: boolean;
  limit?: number;
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
    language: options.language || config.app.defaultLanguage,
    flexisearch: options.flexisearch !== undefined ? options.flexisearch : true,
    limit: options.limit || config.pagination.defaultLimit,
    page: 1,
  });

  const { data, error, isLoading, refetch } = useQuery<PaginatedResponse<ICD11SearchResult>, Error>(
    ['icd11-search', searchParams],
    () => icd11Service.search(searchParams),
    {
      enabled: !!searchParams.term,
    }
  );

  const search = useCallback((params: Partial<ICD11SearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...params }));
    refetch();
  }, [refetch]);

  return {
    search,
    results: data || null,
    isLoading,
    error,
    searchParams,
    setSearchParams,
  };
}; 