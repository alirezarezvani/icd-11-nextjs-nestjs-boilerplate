import { useICD11Context } from '@/context';
import { ICD11SearchResult } from '@shared/types/icd11';
import { SearchResultItem } from './SearchResultItem';
import { Pagination } from './Pagination';

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
        <p>No results found for &quot;{searchParams.term}&quot;</p>
        <p className="text-sm mt-2">Try using different keywords or check your spelling</p>
      </div>
    );
  }

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
          <SearchResultItem
            key={result.id}
            result={result}
            onSelectResult={onSelectResult}
          />
        ))}
      </div>

      <Pagination />
    </div>
  );
}

export default SearchResults; 