import { ICD11SearchResult } from '@shared/types/icd11';
import Link from 'next/link';
import { ROUTES } from '@/config';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <Card 
      className="hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/50"
      onClick={handleResultClick}
    >
      <CardContent className="p-4">
        <Link href={`${ROUTES.ENTITY}/${encodeURIComponent(result.id)}`}>
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="flex items-start justify-between flex-1">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  {result.code && (
                    <code className="text-primary font-mono text-sm bg-muted px-2 py-1 rounded w-fit">
                      {result.code}
                    </code>
                  )}
                  {typeof result.isLeaf !== 'undefined' && (
                    <Badge 
                      variant={result.isLeaf ? "default" : "secondary"} 
                      className="w-fit sm:ml-auto"
                    >
                      {result.isLeaf ? 'Leaf' : 'Category'}
                    </Badge>
                  )}
                </div>
                <h3 className="font-medium text-lg text-foreground hover:text-primary transition-colors line-clamp-2">
                  {result.title}
                </h3>
                {result.matchingPhrases && result.matchingPhrases.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <span className="font-medium">Matched terms:</span>{' '}
                    {result.matchingPhrases.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
