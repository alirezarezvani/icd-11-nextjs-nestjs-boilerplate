import { useState, useCallback } from 'react';
import { icd11Service } from '../services/api/icd11.service';
import { ICD11SearchResult, PaginatedResponse } from '../types';
import config from '../config';

interface UseICD11SearchOptions {
  initialTerm?: string;
  language?: string;
  flexisearch?: boolean;
  flatResults?: boolean;
  includeDescendants?: boolean;
  limit?: number;
}

interface UseICD11SearchResult {
  search: (term: string, page?: number) => Promise<void>;
  results: PaginatedResponse<ICD11SearchResult> | null;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  resetSearch: () => void;
  setOptions: (options: Partial<UseICD11SearchOptions>) => void;
}

export const useICD11Search = (options: UseICD11SearchOptions = {}): UseICD11SearchResult => {
  const [searchTerm, setSearchTerm] = useState<string>(options.initialTerm || '');
  const [results, setResults] = useState<PaginatedResponse<ICD11SearchResult> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchOptions, setSearchOptions] = useState({
    language: options.language || config.app.defaultLanguage,
    flexisearch: options.flexisearch !== undefined ? options.flexisearch : true,
    flatResults: options.flatResults !== undefined ? options.flatResults : false,
    includeDescendants: options.includeDescendants !== undefined ? options.includeDescendants : false,
    limit: options.limit || config.pagination.defaultLimit,
  });

  const search = useCallback(async (term: string, page: number = 1) => {
    if (!term.trim()) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchTerm(term);

    try {
      const response = await icd11Service.search(
        term,
        searchOptions.language,
        page,
        searchOptions.limit,
        searchOptions.flexisearch,
        searchOptions.flatResults,
        searchOptions.includeDescendants
      );

      setResults(response);
    } catch (error: any) {
      setError(error.message || 'An error occurred during search');
      setResults(null);
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    searchOptions.language,
    searchOptions.limit,
    searchOptions.flexisearch,
    searchOptions.flatResults,
    searchOptions.includeDescendants
  ]);

  const resetSearch = useCallback(() => {
    setSearchTerm('');
    setResults(null);
    setError(null);
  }, []);

  const setOptions = useCallback((newOptions: Partial<UseICD11SearchOptions>) => {
    setSearchOptions(prev => ({
      ...prev,
      ...newOptions,
    }));
  }, []);

  return {
    search,
    results,
    isLoading,
    error,
    searchTerm,
    resetSearch,
    setOptions,
  };
}; 