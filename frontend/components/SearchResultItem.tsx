import { ICD11SearchResult } from '@shared/types/icd11';
import Link from 'next/link';
import { ROUTES } from '@/config';

interface SearchResultItemProps {
  result: ICD11SearchResult;
  onSelectResult?: (result: ICD11SearchResult) => void;
}

export function SearchResultItem({ result, onSelectResult }: SearchResultItemProps) {
  const handleResultClick = () => {
    if (onSelectResult) {
      onSelectResult(result);
    }
  };

  return (
    <div
      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleResultClick}
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
  );
}
