import { useICD11Context } from '@/context';
import { ICD11_CONFIG } from '@/config';
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
    setSearchParams(prev => ({ ...prev, language: value }));
  };

  const toggleFlexisearch = () => {
    setSearchParams(prev => ({ ...prev, flexisearch: !prev.flexisearch }));
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-grow">
              <Label htmlFor="search-term" className="sr-only">
                Search Term
              </Label>
              <Input
                id="search-term"
                type="text"
                value={searchParams.term || ''}
                onChange={handleInputChange}
                placeholder="Search for medical terms..."
                autoFocus={autoFocus}
                className="text-base" // Better touch targets on mobile
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {showLanguageSelect && (
                <div className="sm:w-32">
                  <Label htmlFor="language-select" className="sr-only">
                    Language
                  </Label>
                  <Select
                    value={searchParams.language || ICD11_CONFIG.DEFAULT_LANGUAGE}
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICD11_CONFIG.AVAILABLE_LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <Button
                type="submit"
                disabled={isLoading || !searchParams.term?.trim()}
                className="w-full sm:w-auto"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </div>

        {showAdvancedOptions && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="flexible-search"
              checked={searchParams.flexisearch}
              onCheckedChange={toggleFlexisearch}
            />
            <Label 
              htmlFor="flexible-search" 
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Flexible search (includes synonyms and related terms)
            </Label>
          </div>
        )}
      </div>
    </form>
  );
}

export default SearchForm; 