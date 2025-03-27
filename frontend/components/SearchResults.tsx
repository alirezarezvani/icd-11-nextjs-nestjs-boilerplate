import { useICD11Context } from '@/context';
import { ICD11SearchResult } from '@/types';
import Link from 'next/link';
import { ROUTES } from '@/config';

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
  const { searchParams, results, isLoading, error, search } = useICD11Context();

  if (isLoading) {
    return (
      <div className={`${className} flex justify-center py-8`}>
        <div className="animate-pulse text-gray-500">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded`}>
        <p className="font-bold">Error</p>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  if (results.data.length === 0) {
    return (
      <div className={`${className} text-center py-8 text-gray-500`}>
        <p>No results found for "{searchParams.term}"</p>
        <p className="text-sm mt-2">Try using different keywords or check your spelling</p>
      </div>
    );
  }

  const handleResultClick = (result: ICD11SearchResult) => {
    if (onSelectResult) {
      onSelectResult(result);
    }
  };

  return (
    <div className={className}>
      <div className="mb-4 text-sm text-gray-600">
        {results.meta?.total
          ? `Showing ${(results.meta.page - 1) * results.meta.limit + 1}-${Math.min(
              results.meta.page * results.meta.limit,
              results.meta.total
            )} of ${results.meta.total} results`
          : `${results.data.length} results found`}
      </div>

      <div className={`overflow-y-auto ${maxHeight} space-y-4`}>
        {results.data.map((result) => (
          <div
            key={result.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleResultClick(result)}
          >
            <Link href={`${ROUTES.ENTITY}/${result.id}`}>
              <div className="flex items-start">
                {result.code && (
                  <span className="text-blue-600 font-mono mr-3">{result.code}</span>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{result.title}</h3>
                  {result.matchingPhrases && result.matchingPhrases.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Matched terms:</span>{' '}
                      {result.matchingPhrases.join(', ')}
                    </p>
                  )}
                </div>
                {typeof result.isLeaf !== 'undefined' && (
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      result.isLeaf
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {result.isLeaf ? 'Leaf' : 'Category'}
                  </span>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>

      {results.meta && results.data.length > 0 && (
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => search({ page: Math.max(1, searchParams.page || 1) - 1 })}
            disabled={searchParams.page === 1 || isLoading}
            className="btn-secondary disabled:opacity-50"
            aria-label="Previous page"
          >
            Previous
          </button>
          <div className="text-sm text-center text-gray-600 self-center">
            Page {searchParams.page || 1} of{' '}
            {results.meta.total
              ? Math.ceil(results.meta.total / (searchParams.limit || 10))
              : 1}
          </div>
          <button
            onClick={() => search({ page: (searchParams.page || 1) + 1 })}
            disabled={
              !results.meta ||
              results.meta.page * results.meta.limit >= results.meta.total ||
              isLoading
            }
            className="btn-secondary disabled:opacity-50"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchResults; 