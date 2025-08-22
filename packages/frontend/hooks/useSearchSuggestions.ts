import { useState, useCallback, useMemo } from 'react';
import { useQuery } from 'react-query';
import { searchSuggestionsService, SearchSuggestion } from '../services/api/search-suggestions.service';
import { useAuth } from './useAuth';
import { useDebounce } from './useDebounce';

interface UseSearchSuggestionsOptions {
  query: string;
  limit?: number;
  enabled?: boolean;
  debounceMs?: number;
  minQueryLength?: number;
}

interface UseSearchSuggestionsReturn {
  // Data
  suggestions: SearchSuggestion[];
  historySuggestions: SearchSuggestion[];
  popularSuggestions: SearchSuggestion[];
  medicalSuggestions: SearchSuggestion[];
  
  // Loading states
  isLoading: boolean;
  
  // Error states
  error: Error | null;
  
  // Actions
  refreshSuggestions: () => void;
  
  // Utilities
  hasSuggestions: boolean;
  isEmpty: boolean;
}

export const useSearchSuggestions = (options: UseSearchSuggestionsOptions): UseSearchSuggestionsReturn => {
  const { isAuthenticated } = useAuth();
  const {
    query,
    limit = 10,
    enabled = true,
    debounceMs = 300,
    minQueryLength = 2,
  } = options;
  
  // Debounce the query to avoid too many API calls
  const debouncedQuery = useDebounce(query, debounceMs);
  
  // Determine if we should fetch suggestions
  const shouldFetch = enabled && 
    debouncedQuery.length >= minQueryLength && 
    debouncedQuery.trim().length > 0;
  
  // Choose endpoint based on authentication
  const suggestionsQuery = useQuery({
    queryKey: ['searchSuggestions', isAuthenticated ? 'user' : 'public', debouncedQuery, limit],
    queryFn: () => {
      if (isAuthenticated) {
        return searchSuggestionsService.getUserSuggestions(debouncedQuery, limit);
      } else {
        return searchSuggestionsService.getPublicSuggestions(debouncedQuery, limit);
      }
    },
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
  
  // Process suggestions by type
  const { suggestions, historySuggestions, popularSuggestions, medicalSuggestions } = useMemo(() => {
    const allSuggestions = suggestionsQuery.data || [];
    
    return {
      suggestions: allSuggestions,
      historySuggestions: allSuggestions.filter(s => s.type === 'history'),
      popularSuggestions: allSuggestions.filter(s => s.type === 'popular'),
      medicalSuggestions: allSuggestions.filter(s => s.type === 'medical'),
    };
  }, [suggestionsQuery.data]);
  
  const refreshSuggestions = useCallback(() => {
    suggestionsQuery.refetch();
  }, [suggestionsQuery]);
  
  return {
    // Data
    suggestions,
    historySuggestions,
    popularSuggestions,
    medicalSuggestions,
    
    // Loading states
    isLoading: suggestionsQuery.isLoading,
    
    // Error states
    error: suggestionsQuery.error as Error | null,
    
    // Actions
    refreshSuggestions,
    
    // Utilities
    hasSuggestions: suggestions.length > 0,
    isEmpty: suggestions.length === 0 && !suggestionsQuery.isLoading,
  };
};

/**
 * Hook for getting static medical term suggestions
 * Useful for showing suggestions when user hasn't typed anything yet
 */
export const useStaticSuggestions = () => {
  const commonMedicalTerms = useMemo(() => [
    { text: 'diabetes', type: 'medical' as const },
    { text: 'hypertension', type: 'medical' as const },
    { text: 'asthma', type: 'medical' as const },
    { text: 'pneumonia', type: 'medical' as const },
    { text: 'influenza', type: 'medical' as const },
    { text: 'tuberculosis', type: 'medical' as const },
    { text: 'malaria', type: 'medical' as const },
    { text: 'cancer', type: 'medical' as const },
    { text: 'stroke', type: 'medical' as const },
    { text: 'heart disease', type: 'medical' as const },
  ], []);
  
  return {
    staticSuggestions: commonMedicalTerms,
  };
};

/**
 * Hook for managing search suggestion selection and keyboard navigation
 */
export const useSuggestionNavigation = (suggestions: SearchSuggestion[]) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const selectNext = useCallback(() => {
    setSelectedIndex(prev => {
      const nextIndex = prev + 1;
      return nextIndex >= suggestions.length ? -1 : nextIndex;
    });
  }, [suggestions.length]);
  
  const selectPrevious = useCallback(() => {
    setSelectedIndex(prev => {
      const nextIndex = prev - 1;
      return nextIndex < -1 ? suggestions.length - 1 : nextIndex;
    });
  }, [suggestions.length]);
  
  const selectSuggestion = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);
  
  const getSelectedSuggestion = useCallback(() => {
    return selectedIndex >= 0 && selectedIndex < suggestions.length 
      ? suggestions[selectedIndex] 
      : null;
  }, [selectedIndex, suggestions]);
  
  const resetSelection = useCallback(() => {
    setSelectedIndex(-1);
  }, []);
  
  // Reset selection when suggestions change
  useState(() => {
    resetSelection();
  });
  
  return {
    selectedIndex,
    selectNext,
    selectPrevious,
    selectSuggestion,
    getSelectedSuggestion,
    resetSelection,
    hasSelection: selectedIndex >= 0,
  };
};