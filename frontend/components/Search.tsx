import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearch } from '../hooks/useSearch';

const SearchContainer = styled.div`
  margin: 2rem 0;
  width: 100%;
  max-width: 600px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:focus {
    outline: none;
    border-color: #0070f3;
    box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.2);
  }
`;

const SearchResults = styled.div`
  margin-top: 1rem;
`;

const ResultItem = styled.div`
  padding: 1rem;
  margin-bottom: 0.5rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  border-left: 3px solid #0070f3;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f0f0f0;
    transform: translateX(2px);
  }
`;

const ResultTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: #333;
`;

const ResultCode = styled.span`
  display: inline-block;
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.5rem;
  background: #e0e0e0;
  padding: 0.2rem 0.5rem;
  border-radius: 2px;
`;

const StatusMessage = styled.div`
  padding: 1rem;
  color: #666;
  text-align: center;
`;

interface SearchProps {
  onSelectEntity: (id: string) => void;
}

const Search: React.FC<SearchProps> = ({ onSelectEntity }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const { data, isLoading, isError } = useSearch(debouncedTerm);
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSelectEntity = (id: string) => {
    onSelectEntity(id);
  };
  
  return (
    <SearchContainer>
      <SearchInput
        type="text"
        placeholder="Search ICD-11 codes and terms..."
        value={searchTerm}
        onChange={handleInputChange}
      />
      
      <SearchResults>
        {isLoading && <StatusMessage>Searching...</StatusMessage>}
        {isError && <StatusMessage>Error fetching results. Please try again.</StatusMessage>}
        
        {!isLoading && !isError && data && data.length === 0 && searchTerm && (
          <StatusMessage>No results found for "{searchTerm}"</StatusMessage>
        )}
        
        {!isLoading && !isError && data && data.length > 0 && (
          data.map((result: any) => (
            <ResultItem key={result.id} onClick={() => handleSelectEntity(result.id)}>
              <ResultTitle>{result.title}</ResultTitle>
              {result.code && <ResultCode>{result.code}</ResultCode>}
            </ResultItem>
          ))
        )}
      </SearchResults>
    </SearchContainer>
  );
};

export default Search; 