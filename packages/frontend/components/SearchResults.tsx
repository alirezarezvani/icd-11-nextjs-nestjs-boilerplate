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
      <div className={className}>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex items-start space-x-3">
                <Skeleton className="h-4 w-16" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg`}>
        <p className="font-semibold">Error</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  if (results.data.length === 0) {
    return (
      <div className={`${className} text-center py-12`}>
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No results found for &quot;{searchParams.term}&quot;</p>
          <p className="text-sm mt-2">Try using different keywords or check your spelling</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4 text-sm text-muted-foreground">
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