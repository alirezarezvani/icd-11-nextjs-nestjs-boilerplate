import React, { useState, useEffect } from 'react';
import { useICD11Context } from '@/context';
import { ICD11SearchResult } from '@/types';

interface SearchProps {
  onSelectEntity: (id: string) => void;
}

const Search: React.FC<SearchProps> = ({ onSelectEntity }) => {
  const { searchParams, results, isLoading, error, setSearchTerm } = useICD11Context();
  const [inputValue, setInputValue] = useState(searchParams.term);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchParams.term) {
        setSearchTerm(inputValue);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [inputValue, searchParams.term, setSearchTerm]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleSelectEntity = (result: ICD11SearchResult) => {
    onSelectEntity(result.id);
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="Search ICD-11 codes and terms..."
        value={inputValue}
        onChange={handleInputChange}
        className="w-full p-3 text-base border-2 border-gray-200 rounded-md mb-4 focus:outline-none focus:border-blue-500"
      />
      
      <div className="bg-white rounded-md shadow-sm max-h-[400px] overflow-y-auto">
        {isLoading && (
          <div className="p-3 text-center text-gray-600">Searching...</div>
        )}
        
        {error && (
          <div className="p-3 text-center text-red-600">Error: {error}</div>
        )}
        
        {!isLoading && !error && results?.data?.length === 0 && inputValue && (
          <div className="p-3 text-center text-gray-600">
            No results found for "{inputValue}"
          </div>
        )}
        
        {!isLoading && !error && results?.data && results.data.length > 0 && (
          <div>
            {results.data.map((result) => (
              <div
                key={result.id}
                onClick={() => handleSelectEntity(result)}
                className="p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <div className="text-sm text-gray-800">{result.title}</div>
                {result.code && (
                  <div className="text-xs text-gray-600 mt-1">{result.code}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search; 