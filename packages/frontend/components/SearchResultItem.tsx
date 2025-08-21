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
    <div 
      className="p-6 cursor-pointer group"
      onClick={handleResultClick}
    >
      <Link href={`${ROUTES.ENTITY}/${Buffer.from(result.id).toString('base64').replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' }[m]!))}`} className="block">
        <div className="flex items-start space-x-4">
          {/* Medical Icon */}
          <div className="flex-shrink-0 mt-1">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 10-8 8 7.962 7.962 0 01-5.291-2z" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header with code and category */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {result.code && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors duration-200">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {result.code}
                  </span>
                )}
                {typeof result.isLeaf !== 'undefined' && (
                  <Badge 
                    variant={result.isLeaf ? "default" : "secondary"} 
                    className={`text-xs ${result.isLeaf 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                    } transition-colors duration-200`}
                  >
                    {result.isLeaf ? (
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Final Code
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Category
                      </div>
                    )}
                  </Badge>
                )}
              </div>
              
              {/* Arrow indicator */}
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900 transition-colors duration-200 mb-2 leading-snug">
              {result.title}
            </h3>

            {/* Matching phrases */}
            {result.matchingPhrases && result.matchingPhrases.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium text-gray-700">Related terms:</span>
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.matchingPhrases.slice(0, 3).map((phrase, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-50 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors duration-200"
                    >
                      {phrase}
                    </span>
                  ))}
                  {result.matchingPhrases.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-50 text-gray-500">
                      +{result.matchingPhrases.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Hover instruction */}
            <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <p className="text-xs text-blue-600 font-medium">
                Click to view detailed information →
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
