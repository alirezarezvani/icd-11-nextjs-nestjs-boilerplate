/**
 * Analytics Service - API calls for search analytics data
 * Supports both user-specific and global analytics
 */

import { apiRequest } from './client';

// Types matching backend interfaces
export interface SearchAnalytics {
  totalSearches: number;
  uniqueUsers: number;
  avgSearchesPerUser: number;
  topSearchTerms: { term: string; count: number }[];
  searchesByLanguage: { language: string; count: number }[];
  searchesByDay: { date: string; count: number }[];
  bookmarkStats: {
    totalBookmarks: number;
    entityBookmarks: number;
    searchBookmarks: number;
    avgBookmarksPerUser: number;
  };
}

export interface UserAnalytics {
  totalSearches: number;
  uniqueSearchTerms: number;
  topSearchTerms: { term: string; count: number }[];
  searchesByLanguage: { language: string; count: number }[];
  recentSearches: number;
  totalBookmarks: number;
  bookmarksByType: { type: string; count: number }[];
  avgResultsPerSearch: number;
}

export class AnalyticsService {
  /**
   * Get user-specific analytics data
   * @param days Number of days to include in analytics (default: 30)
   */
  static async getUserAnalytics(days: number = 30): Promise<UserAnalytics> {
    try {
      const response = await apiRequest.get<UserAnalytics>(
        '/search-analytics/user',
        { days }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user analytics:', error);
      throw new Error('Unable to load your analytics data. Please try again later.');
    }
  }

  /**
   * Get global platform analytics (admin only)
   * @param days Number of days to include in analytics (default: 30)
   */
  static async getGlobalAnalytics(days: number = 30): Promise<SearchAnalytics> {
    try {
      const response = await apiRequest.get<SearchAnalytics>(
        '/search-analytics/global',
        { days }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global analytics:', error);
      throw new Error('Unable to load platform analytics. Please check your permissions.');
    }
  }
}

export default AnalyticsService;