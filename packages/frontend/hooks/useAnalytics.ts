/**
 * useAnalytics Hook - Custom hook for managing analytics data
 * Provides data fetching, caching, and state management for user analytics
 */

import { useState, useEffect, useCallback } from 'react';
import { AnalyticsService, UserAnalytics } from '../services/api/analytics.service';
import { useAuth } from './useAuth';

interface UseAnalyticsState {
  data: UserAnalytics | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UseAnalyticsOptions {
  days?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseAnalyticsReturn extends UseAnalyticsState {
  refetch: () => Promise<void>;
  setDaysPeriod: (days: number) => void;
  isStale: boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEFAULT_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

export const useAnalytics = (options: UseAnalyticsOptions = {}): UseAnalyticsReturn => {
  const {
    days = 30,
    autoRefresh = false,
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
  } = options;

  const { isAuthenticated, user } = useAuth();
  
  const [state, setState] = useState<UseAnalyticsState>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const [daysPeriod, setDaysPeriod] = useState(days);

  // Calculate if data is stale
  const isStale = state.lastUpdated
    ? Date.now() - state.lastUpdated.getTime() > CACHE_DURATION
    : true;

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setState(prev => ({
        ...prev,
        data: null,
        loading: false,
        error: null,
        lastUpdated: null,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const analyticsData = await AnalyticsService.getUserAnalytics(daysPeriod);
      
      setState({
        data: analyticsData,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load analytics data';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [isAuthenticated, user, daysPeriod]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  // Update days period and refetch if needed
  const updateDaysPeriod = useCallback((newDays: number) => {
    setDaysPeriod(newDays);
  }, []);

  // Initial fetch and dependency-based refetch
  useEffect(() => {
    if (isAuthenticated && (isStale || !state.data)) {
      fetchAnalytics();
    }
  }, [isAuthenticated, daysPeriod, fetchAnalytics, isStale, state.data]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !isAuthenticated) {
      return;
    }

    const interval = setInterval(() => {
      if (isStale) {
        fetchAnalytics();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, isAuthenticated, refreshInterval, isStale, fetchAnalytics]);

  // Clear data when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setState({
        data: null,
        loading: false,
        error: null,
        lastUpdated: null,
      });
    }
  }, [isAuthenticated]);

  return {
    ...state,
    refetch,
    setDaysPeriod: updateDaysPeriod,
    isStale,
  };
};

export default useAnalytics;