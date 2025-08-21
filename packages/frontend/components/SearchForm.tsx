import { useICD11Context } from '@/context';
import { ICD11_CONFIG } from '@/config';
import { SupportedLanguage } from '@shared/types/icd11';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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

  const handleLanguageChange = (value: string) => {
    setSearchParams(prev => ({ ...prev, language: value as SupportedLanguage }));
  };

  const toggleFlexisearch = () => {
    setSearchParams(prev => ({ ...prev, flexisearch: !prev.flexisearch }));
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-6">
        {/* Main Search Input */}
        <div className="relative">
          <Label htmlFor="search-term" className="block text-sm font-medium text-gray-700 mb-2">
            Search Medical Terms or Codes
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              id="search-term"
              type="text"
              value={searchParams.term || ''}
              onChange={handleInputChange}
              placeholder="Enter medical term, condition, or ICD-11 code..."
              autoFocus={autoFocus}
              className="h-14 text-lg pl-12 pr-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all duration-200"
            />
          </div>
        </div>

        {/* Language and Search Button Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {showLanguageSelect && (
            <div className="flex-1 sm:max-w-xs">
              <Label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
                Search Language
              </Label>
              <Select
                value={searchParams.language || ICD11_CONFIG.DEFAULT_LANGUAGE}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="h-12 border-2 border-gray-200 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICD11_CONFIG.AVAILABLE_LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      <span className="flex items-center">
                        <span className="font-medium">{lang.toUpperCase()}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          {lang === 'en' ? '(English)' : 
                           lang === 'es' ? '(Español)' :
                           lang === 'fr' ? '(Français)' :
                           lang === 'ar' ? '(العربية)' :
                           lang === 'zh' ? '(中文)' :
                           lang === 'ru' ? '(Русский)' : ''}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Button
            type="submit"
            disabled={isLoading || !searchParams.term?.trim()}
            className="h-12 px-8 text-base font-medium bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 rounded-lg shadow-md transition-all duration-200 min-w-[140px]"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Searching...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </div>
            )}
          </Button>
        </div>

        {/* Advanced Options */}
        {showAdvancedOptions && (
          <div className="pt-4 border-t border-gray-200">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Search Options</h3>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="flexible-search"
                  checked={searchParams.flexisearch}
                  onCheckedChange={toggleFlexisearch}
                  className="w-5 h-5"
                />
                <Label 
                  htmlFor="flexible-search" 
                  className="text-sm text-gray-700 cursor-pointer flex items-start"
                >
                  <div>
                    <div className="font-medium">Flexible Search</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Include synonyms, related terms, and alternative spellings in search results
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* Search Stats */}
        {searchParams.term && (
          <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
            <span>Searching in WHO ICD-11 database • Language: {searchParams.language?.toUpperCase()}</span>
          </div>
        )}
      </div>
    </form>
  );
}

export default SearchForm; 