import { useState, useEffect } from 'react';
import { useICD11Context } from '@/context';
import { ICD11_CONFIG } from '@/config';

interface SearchFormProps {
  className?: string;
  autoFocus?: boolean;
  showLanguageSelect?: boolean;
  showAdvancedOptions?: boolean;
}

export function SearchForm({
  className = '',
  autoFocus = true,
  showLanguageSelect = true,
  showAdvancedOptions = false,
}: SearchFormProps) {
  const {
    searchParams,
    isLoading,
    search,
    setSearchTerm,
    setLanguage,
    toggleFlexisearch,
  } = useICD11Context();

  const [inputValue, setInputValue] = useState(searchParams.term || '');

  // Update input value when searchParams.term changes
  useEffect(() => {
    setInputValue(searchParams.term || '');
  }, [searchParams.term]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchTerm(value);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className={`${className}`}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-grow">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Search for medical terms..."
              className="w-full input-primary"
              autoFocus={autoFocus}
              aria-label="Search term"
            />
          </div>
          
          {showLanguageSelect && (
            <select
              value={searchParams.language || ICD11_CONFIG.DEFAULT_LANGUAGE}
              onChange={handleLanguageChange}
              className="sm:w-32 input-primary"
              aria-label="Language"
            >
              {ICD11_CONFIG.AVAILABLE_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="btn-primary"
            aria-label="Search"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {showAdvancedOptions && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={searchParams.flexisearch !== false}
                onChange={toggleFlexisearch}
                className="mr-1"
              />
              Flexible search (includes synonyms and related terms)
            </label>
          </div>
        )}
      </div>
    </form>
  );
}

export default SearchForm; 