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
  const { searchParams, isLoading, search, setSearchParams } = useICD11Context();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(searchParams);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({ ...prev, term: e.target.value }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams(prev => ({ ...prev, language: e.target.value }));
  };

  const toggleFlexisearch = () => {
    setSearchParams(prev => ({ ...prev, flexisearch: !prev.flexisearch }));
  };

  return (
    <form onSubmit={handleSubmit} className={`${className}`}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-grow">
            <label htmlFor="search-term" className="sr-only">
              Search Term
            </label>
            <input
              id="search-term"
              type="text"
              value={searchParams.term || ''}
              onChange={handleInputChange}
              placeholder="Search for medical terms..."
              className="w-full input-primary"
              autoFocus={autoFocus}
            />
          </div>
          
          {showLanguageSelect && (
            <div>
              <label htmlFor="language-select" className="sr-only">
                Language
              </label>
              <select
                id="language-select"
                value={searchParams.language || ICD11_CONFIG.DEFAULT_LANGUAGE}
                onChange={handleLanguageChange}
                className="sm:w-32 input-primary"
              >
                {ICD11_CONFIG.AVAILABLE_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !searchParams.term?.trim()}
            className="btn-primary"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {showAdvancedOptions && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <label htmlFor="flexible-search" className="flex items-center cursor-pointer">
              <input
                id="flexible-search"
                type="checkbox"
                checked={searchParams.flexisearch}
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