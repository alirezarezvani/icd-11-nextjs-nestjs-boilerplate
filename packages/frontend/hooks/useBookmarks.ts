import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  bookmarkService, 
  BookmarkItem, 
  BookmarkType,
  CreateEntityBookmarkDto,
  CreateSearchBookmarkDto 
} from '../services/api/bookmark.service';
import { PaginatedResponse } from '../types/api';
import { useAuth } from './useAuth';

interface UseBookmarksOptions {
  page?: number;
  limit?: number;
  type?: BookmarkType;
  searchQuery?: string;
  enabled?: boolean;
}

interface UseBookmarksReturn {
  // Data
  bookmarks: BookmarkItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isCheckingStatus: boolean;
  
  // Error states
  error: Error | null;
  
  // Actions
  refreshBookmarks: () => void;
  createEntityBookmark: (data: CreateEntityBookmarkDto) => Promise<BookmarkItem>;
  createSearchBookmark: (data: CreateSearchBookmarkDto) => Promise<BookmarkItem>;
  updateBookmark: (bookmarkId: string, updates: { tags?: string[]; notes?: string }) => Promise<BookmarkItem>;
  deleteBookmark: (bookmarkId: string) => Promise<void>;
  
  // Status checks
  isEntityBookmarked: (entityId: string) => Promise<boolean>;
  isSearchBookmarked: (searchTerm: string) => Promise<boolean>;
  
  // Filtering and pagination
  goToPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTypeFilter: (type?: BookmarkType) => void;
  setSearchFilter: (searchQuery: string) => void;
  
  // Utilities
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  getEntityBookmarks: () => BookmarkItem[];
  getSearchBookmarks: () => BookmarkItem[];
}

export const useBookmarks = (options: UseBookmarksOptions = {}): UseBookmarksReturn => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(options.page || 1);
  const [limit, setLimitState] = useState(options.limit || 20);
  const [type, setTypeState] = useState<BookmarkType | undefined>(options.type);
  const [searchQuery, setSearchQueryState] = useState(options.searchQuery || '');
  
  // Query key
  const bookmarksQueryKey = ['bookmarks', page, limit, type, searchQuery];
  
  // Bookmarks query
  const {
    data: bookmarksData,
    isLoading,
    error,
    refetch: refreshBookmarks,
  } = useQuery({
    queryKey: bookmarksQueryKey,
    queryFn: () => bookmarkService.getUserBookmarks(page, limit, type, searchQuery || undefined),
    enabled: isAuthenticated && (options.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
  
  // Create entity bookmark mutation
  const createEntityMutation = useMutation({
    mutationFn: bookmarkService.createEntityBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      // Also invalidate entity bookmark status queries
      queryClient.invalidateQueries({ queryKey: ['bookmark-status'] });
    },
  });
  
  // Create search bookmark mutation
  const createSearchMutation = useMutation({
    mutationFn: bookmarkService.createSearchBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      // Also invalidate search bookmark status queries
      queryClient.invalidateQueries({ queryKey: ['bookmark-status'] });
    },
  });
  
  // Update bookmark mutation
  const updateMutation = useMutation({
    mutationFn: ({ bookmarkId, updates }: { 
      bookmarkId: string; 
      updates: { tags?: string[]; notes?: string } 
    }) => bookmarkService.updateBookmark(bookmarkId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
  
  // Delete bookmark mutation
  const deleteMutation = useMutation({
    mutationFn: bookmarkService.deleteBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['bookmark-status'] });
    },
  });
  
  // Actions
  const createEntityBookmark = useCallback(async (data: CreateEntityBookmarkDto): Promise<BookmarkItem> => {
    return await createEntityMutation.mutateAsync(data);
  }, [createEntityMutation]);
  
  const createSearchBookmark = useCallback(async (data: CreateSearchBookmarkDto): Promise<BookmarkItem> => {
    return await createSearchMutation.mutateAsync(data);
  }, [createSearchMutation]);
  
  const updateBookmark = useCallback(async (
    bookmarkId: string, 
    updates: { tags?: string[]; notes?: string }
  ): Promise<BookmarkItem> => {
    return await updateMutation.mutateAsync({ bookmarkId, updates });
  }, [updateMutation]);
  
  const deleteBookmark = useCallback(async (bookmarkId: string): Promise<void> => {
    await deleteMutation.mutateAsync(bookmarkId);
  }, [deleteMutation]);
  
  // Status check functions with caching
  const isEntityBookmarked = useCallback(async (entityId: string): Promise<boolean> => {
    // Check cache first
    const cachedData = queryClient.getQueryData(['bookmark-status', 'entity', entityId]);
    if (cachedData !== undefined) {
      return cachedData as boolean;
    }
    
    // Fetch from API and cache result
    const result = await bookmarkService.isEntityBookmarked(entityId);
    queryClient.setQueryData(['bookmark-status', 'entity', entityId], result, {
      updatedAt: Date.now(),
    });
    
    return result;
  }, [queryClient]);
  
  const isSearchBookmarked = useCallback(async (searchTerm: string): Promise<boolean> => {
    // Check cache first
    const cachedData = queryClient.getQueryData(['bookmark-status', 'search', searchTerm]);
    if (cachedData !== undefined) {
      return cachedData as boolean;
    }
    
    // Fetch from API and cache result
    const result = await bookmarkService.isSearchBookmarked(searchTerm);
    queryClient.setQueryData(['bookmark-status', 'search', searchTerm], result, {
      updatedAt: Date.now(),
    });
    
    return result;
  }, [queryClient]);
  
  // Pagination and filtering
  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);
  
  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPage(1);
  }, []);
  
  const setTypeFilter = useCallback((newType?: BookmarkType) => {
    setTypeState(newType);
    setPage(1);
  }, []);
  
  const setSearchFilter = useCallback((newSearchQuery: string) => {
    setSearchQueryState(newSearchQuery);
    setPage(1);
  }, []);
  
  // Extract data with defaults
  const bookmarks = bookmarksData?.items || [];
  const pagination = {
    total: bookmarksData?.total || 0,
    page: bookmarksData?.page || 1,
    limit: bookmarksData?.limit || limit,
    totalPages: bookmarksData?.totalPages || 0,
  };
  
  const hasNextPage = page < pagination.totalPages;
  const hasPreviousPage = page > 1;
  
  // Utility functions
  const getEntityBookmarks = useCallback(() => {
    return bookmarks.filter(bookmark => bookmark.type === BookmarkType.ENTITY);
  }, [bookmarks]);
  
  const getSearchBookmarks = useCallback(() => {
    return bookmarks.filter(bookmark => bookmark.type === BookmarkType.SEARCH);
  }, [bookmarks]);
  
  return {
    // Data
    bookmarks,
    pagination,
    
    // Loading states
    isLoading,
    isCreating: createEntityMutation.isPending || createSearchMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isCheckingStatus: false, // Status checks are instant due to caching
    
    // Error states
    error: error as Error | null,
    
    // Actions
    refreshBookmarks,
    createEntityBookmark,
    createSearchBookmark,
    updateBookmark,
    deleteBookmark,
    
    // Status checks
    isEntityBookmarked,
    isSearchBookmarked,
    
    // Filtering and pagination
    goToPage,
    setLimit,
    setTypeFilter,
    setSearchFilter,
    
    // Utilities
    hasNextPage,
    hasPreviousPage,
    getEntityBookmarks,
    getSearchBookmarks,
  };
};

/**
 * Hook for managing a single bookmark's status
 * Useful for bookmark toggle buttons
 */
export const useBookmarkStatus = (entityId?: string, searchTerm?: string) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const statusKey = entityId 
    ? ['bookmark-status', 'entity', entityId]
    : searchTerm 
    ? ['bookmark-status', 'search', searchTerm]
    : null;
  
  const { data: isBookmarked = false, isLoading } = useQuery({
    queryKey: statusKey!,
    queryFn: () => {
      if (entityId) {
        return bookmarkService.isEntityBookmarked(entityId);
      } else if (searchTerm) {
        return bookmarkService.isSearchBookmarked(searchTerm);
      }
      return Promise.resolve(false);
    },
    enabled: isAuthenticated && !!statusKey,
    staleTime: 5 * 60 * 1000,
  });
  
  const toggleBookmark = useCallback(async (bookmarkData: CreateEntityBookmarkDto | CreateSearchBookmarkDto) => {
    if (!isAuthenticated) return;
    
    if (isBookmarked) {
      // Find and delete the bookmark
      // This would require additional API or finding the bookmark ID
      console.warn('Delete bookmark functionality needs bookmark ID');
    } else {
      // Create the bookmark
      if ('entityId' in bookmarkData) {
        await bookmarkService.createEntityBookmark(bookmarkData);
      } else {
        await bookmarkService.createSearchBookmark(bookmarkData);
      }
    }
    
    // Invalidate status cache
    if (statusKey) {
      queryClient.invalidateQueries({ queryKey: statusKey });
    }
    queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
  }, [isAuthenticated, isBookmarked, statusKey, queryClient]);
  
  return {
    isBookmarked,
    isLoading,
    toggleBookmark,
  };
};