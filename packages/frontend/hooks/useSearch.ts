import { useQuery } from 'react-query';
import { apiClient } from '../services/apiClient';

interface SearchResult {
  id: string;
  title: string;
  code?: string;
  isLeaf: boolean;
}

const fetchSearchResults = async (term: string): Promise<SearchResult[]> => {
  if (!term) return [];
  
  const response = await apiClient.get(`/api/icd11/search?term=${encodeURIComponent(term)}`);
  return response.data;
};

export const useSearch = (searchTerm: string) => {
  return useQuery(
    ['icd11-search', searchTerm],
    () => fetchSearchResults(searchTerm),
    {
      enabled: searchTerm.length > 0,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
    }
  );
}; 