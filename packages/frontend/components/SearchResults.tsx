import { useICD11Context } from '@/context';
import { ICD11SearchResult } from '@shared/types/icd11';
import { SearchResultItem } from './SearchResultItem';
import { Pagination } from './Pagination';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchResultsProps {
  className?: string;
  maxHeight?: string;
  onSelectResult?: (result: ICD11SearchResult) => void;
}

export function SearchResults({
  className = '',
  maxHeight = 'max-h-[600px]',
  onSelectResult,
}: SearchResultsProps) {
  const { searchParams, results, isLoading, error } = useICD11Context();

  if (isLoading) {
    return (
      <div className={`${className} p-6`}>
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2 text-blue-600">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-lg font-medium">Searching WHO ICD-11 database...</span>
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="flex items-start space-x-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} p-6`}>
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-3">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Search Error</h3>
          <p className="text-red-700 mb-4">{error.message}</p>
          <p className="text-sm text-red-600">
            Please try again with different search terms or check your internet connection.
          </p>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  if (results.data.length === 0) {
    return (
      <div className={`${className} p-6`}>
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 10-8 8 7.962 7.962 0 01-5.291-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600 mb-1">No medical codes found for &quot;{searchParams.term}&quot;</p>
          <p className="text-sm text-gray-500 mb-6">Try using different keywords or check your spelling</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="font-medium text-blue-900 mb-2">Search Suggestions:</h4>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• Try more general terms (e.g., "diabetes" instead of "diabetic ketoacidosis")</li>
              <li>• Use medical terminology</li>
              <li>• Check spelling of medical terms</li>
              <li>• Enable "Flexible Search" option</li>
              <li>• Try searching in a different language</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Results Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {results.meta?.total
                  ? `${results.meta.total} results found`
                  : `${results.data.length} results found`}
              </p>
              <p className="text-sm text-gray-600">
                {results.meta?.total
                  ? `Showing ${(results.meta.page - 1) * results.meta.limit + 1}-${Math.min(
                      results.meta.page * results.meta.limit,
                      results.meta.total
                    )} of ${results.meta.total}`
                  : `Displaying all ${results.data.length} matches`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>WHO ICD-11 • {searchParams.language?.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className={`overflow-y-auto ${maxHeight}`}>
        <div className="divide-y divide-gray-200">
          {results.data.map((result, index) => (
            <div key={result.id} className="hover:bg-gray-50 transition-colors duration-200">
              <SearchResultItem
                result={result}
                onSelectResult={onSelectResult}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <Pagination />
      </div>
    </div>
  );
}

export default SearchResults; 