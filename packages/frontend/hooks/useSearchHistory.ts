import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { searchHistoryService, SearchHistoryItem, CreateSearchHistoryDto } from '../services/api/search-history.service';
import { PaginatedResponse } from '../types/api';
import { useAuth } from './useAuth';

interface UseSearchHistoryOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
  enabled?: boolean;
}

interface UseSearchHistoryReturn {
  // Data
  searchHistory: SearchHistoryItem[];
  topTerms: { term: string; count: number }[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  
  // Loading states
  isLoading: boolean;
  isLoadingTopTerms: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  isClearing: boolean;
  
  // Error states
  error: Error | null;
  topTermsError: Error | null;
  
  // Actions
  refreshHistory: () => void;
  refreshTopTerms: () => void;
  createSearchHistory: (data: CreateSearchHistoryDto) => Promise<void>;
  deleteHistoryItem: (historyId: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  
  // Pagination
  goToPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearchFilter: (searchTerm: string) => void;
  
  // Utilities
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const useSearchHistory = (options: UseSearchHistoryOptions = {}): UseSearchHistoryReturn => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(options.page || 1);
  const [limit, setLimitState] = useState(options.limit || 20);
  const [searchTerm, setSearchTermState] = useState(options.searchTerm || '');
  
  // Query keys
  const searchHistoryQueryKey = ['searchHistory', page, limit, searchTerm];
  const topTermsQueryKey = ['searchHistory', 'topTerms'];
  
  // Search history query
  const {
    data: searchHistoryData,
    isLoading,
    error,
    refetch: refreshHistory,
  } = useQuery({
    queryKey: searchHistoryQueryKey,
    queryFn: () => searchHistoryService.getUserHistory(page, limit, searchTerm || undefined),
    enabled: isAuthenticated && (options.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
  
  // Top terms query
  const {
    data: topTerms = [],
    isLoading: isLoadingTopTerms,
    error: topTermsError,
    refetch: refreshTopTerms,
  } = useQuery({
    queryKey: topTermsQueryKey,
    queryFn: () => searchHistoryService.getTopTerms(10),
    enabled: isAuthenticated && (options.enabled !== false),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
  
  // Create search history mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateSearchHistoryDto) => {
      // Note: The backend automatically creates search history, 
      // this is mainly for manual tracking if needed
      return Promise.resolve();
    },
    onSuccess: () => {
      // Invalidate and refetch search history queries
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
    },
  });
  
  // Delete history item mutation
  const deleteMutation = useMutation({
    mutationFn: searchHistoryService.deleteHistoryItem,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
    },
  });
  
  // Clear all history mutation
  const clearMutation = useMutation({
    mutationFn: searchHistoryService.clearHistory,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
    },
  });
  
  // Actions
  const createSearchHistory = useCallback(async (data: CreateSearchHistoryDto) => {
    await createMutation.mutateAsync(data);
  }, [createMutation]);
  
  const deleteHistoryItem = useCallback(async (historyId: string) => {
    await deleteMutation.mutateAsync(historyId);
  }, [deleteMutation]);
  
  const clearHistory = useCallback(async () => {
    await clearMutation.mutateAsync();
  }, [clearMutation]);
  
  // Pagination helpers
  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);
  
  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);
  
  const setSearchFilter = useCallback((newSearchTerm: string) => {
    setSearchTermState(newSearchTerm);
    setPage(1); // Reset to first page when searching
  }, []);
  
  // Extract data with defaults
  const searchHistory = searchHistoryData?.items || [];
  const pagination = {
    total: searchHistoryData?.total || 0,
    page: searchHistoryData?.page || 1,
    limit: searchHistoryData?.limit || limit,
    totalPages: searchHistoryData?.totalPages || 0,
  };
  
  const hasNextPage = page < pagination.totalPages;
  const hasPreviousPage = page > 1;
  
  return {
    // Data
    searchHistory,
    topTerms,
    pagination,
    
    // Loading states
    isLoading,
    isLoadingTopTerms,
    isCreating: createMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isClearing: clearMutation.isLoading,
    
    // Error states
    error: error as Error | null,
    topTermsError: topTermsError as Error | null,
    
    // Actions
    refreshHistory,
    refreshTopTerms,
    createSearchHistory,
    deleteHistoryItem,
    clearHistory,
    
    // Pagination
    goToPage,
    setLimit,
    setSearchFilter,
    
    // Utilities
    hasNextPage,
    hasPreviousPage,
  };
};

/**
 * Hook for tracking search history automatically
 * This hook provides a simple interface to track searches without managing state
 * Note: The backend automatically tracks searches when using the ICD11 search API,
 * but this hook can be used for additional frontend tracking or diagnostics
 */
export const useSearchHistoryTracker = () => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  
  const trackSearch = useCallback(async (data: CreateSearchHistoryDto) => {
    if (!isAuthenticated) {
      console.log('Search not tracked: User not authenticated');
      return false;
    }
    
    // The backend automatically tracks searches when using the ICD11 search API
    // This could be used for additional frontend tracking or analytics
    console.log('Search tracking (backend automatic):', {
      searchTerm: data.searchTerm,
      language: data.language,
      resultsCount: data.resultsCount,
      userId: user?.id,
      timestamp: new Date().toISOString(),
    });
    
    // Optionally invalidate search history queries to refresh the data
    queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
    
    return true;
  }, [isAuthenticated, user?.id, queryClient]);
  
  const getTrackingStatus = useCallback(() => {
    return {
      canTrack: isAuthenticated,
      userId: user?.id || null,
      trackingMethod: 'backend-automatic',
      description: 'Search history is automatically tracked by the backend when users are authenticated and performing first-page searches.',
    };
  }, [isAuthenticated, user?.id]);
  
  return { 
    trackSearch,
    getTrackingStatus,
    isTrackingEnabled: isAuthenticated,
  };
};

/**
 * Hook for getting quick access to recent searches
 */
export const useRecentSearches = (limit: number = 5) => {
  const { searchHistory, isLoading, error } = useSearchHistory({
    limit,
    enabled: true,
  });
  
  return {
    recentSearches: searchHistory.slice(0, limit),
    isLoading,
    error,
  };
};