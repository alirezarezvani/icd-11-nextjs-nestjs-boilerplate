import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { useICD11Context } from '@/context';
import { ICD11_CONFIG } from '@/config';
import { SupportedLanguage } from '@shared/types/icd11';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { useSearchSuggestions, useSuggestionNavigation } from '@/hooks/useSearchSuggestions';
import { SearchSuggestion } from '@/services/api/search-suggestions.service';
import SearchSuggestions from './SearchSuggestions';

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
  const { t } = useTranslation(['search', 'common']);
  const { searchParams, isLoading, search, setSearchParams } = useICD11Context();
  const { isRTL } = useLanguage();
  
  // Search suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Search suggestions hooks
  const {
    suggestions,
    historySuggestions,
    popularSuggestions,
    medicalSuggestions,
    isLoading: suggestionsLoading,
    hasSuggestions,
  } = useSearchSuggestions({
    query: searchParams.term || '',
    limit: 8,
    enabled: isInputFocused && (searchParams.term?.length || 0) >= 2,
    debounceMs: 300,
    minQueryLength: 2,
  });
  
  // Keyboard navigation hook
  const {
    selectedIndex,
    selectNext,
    selectPrevious,
    selectSuggestion,
    getSelectedSuggestion,
    resetSelection,
    hasSelection,
  } = useSuggestionNavigation(suggestions);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(searchParams);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchParams(prev => ({ ...prev, term: value }));
    
    // Reset keyboard navigation when user types
    resetSelection();
    
    // Show suggestions if user is typing and has enough characters
    if (value.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleLanguageChange = (value: string) => {
    setSearchParams(prev => ({ ...prev, language: value as SupportedLanguage }));
  };

  const toggleFlexisearch = () => {
    setSearchParams(prev => ({ ...prev, flexisearch: !prev.flexisearch }));
  };
  
  // Handle suggestion selection
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    setSearchParams(prev => ({ ...prev, term: suggestion.text }));
    setShowSuggestions(false);
    resetSelection();
    
    // Trigger search immediately
    search({ ...searchParams, term: suggestion.text });
  }, [searchParams, search, setSearchParams, resetSelection]);
  
  // Handle input focus
  const handleInputFocus = useCallback(() => {
    setIsInputFocused(true);
    
    // Show suggestions if we have a query and suggestions are available
    if ((searchParams.term?.length || 0) >= 2 && hasSuggestions) {
      setShowSuggestions(true);
    }
  }, [searchParams.term, hasSuggestions]);
  
  // Handle input blur
  const handleInputBlur = useCallback(() => {
    setIsInputFocused(false);
    // Don't hide suggestions immediately to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
      resetSelection();
    }, 150);
  }, [resetSelection]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectNext();
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectPrevious();
        break;
      case 'Enter':
        e.preventDefault();
        const selectedSuggestion = getSelectedSuggestion();
        if (selectedSuggestion) {
          handleSuggestionClick(selectedSuggestion);
        } else {
          // No suggestion selected, perform regular search
          handleSubmit(e as any);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        resetSelection();
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestions, suggestions, selectNext, selectPrevious, getSelectedSuggestion, handleSuggestionClick, resetSelection]);
  
  // Close suggestions
  const handleCloseSuggestions = useCallback(() => {
    setShowSuggestions(false);
    resetSelection();
  }, [resetSelection]);

  return (
    <form onSubmit={handleSubmit} className={className} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="space-y-6">
        {/* Main Search Input */}
        <div className="relative">
          <Label htmlFor="search-term" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('search:form.labels.searchTerm')}
          </Label>
          <div className="search-input-wrapper relative">
            <div className="search-icon">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              ref={inputRef}
              id="search-term"
              type="text"
              value={searchParams.term || ''}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              placeholder={t('search:form.placeholders.searchInput')}
              autoFocus={autoFocus}
              autoComplete="off"
              role="combobox"
              aria-expanded={showSuggestions}
              aria-haspopup="listbox"
              aria-owns={showSuggestions ? 'search-suggestions' : undefined}
              aria-activedescendant={hasSelection ? `suggestion-${selectedIndex}` : undefined}
              className={`h-14 text-lg search-input border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all duration-200 ${isRTL ? 'text-right arabic-text' : 'text-left'}`}
            />
            
            {/* Search Suggestions Dropdown */}
            <SearchSuggestions
              suggestions={suggestions}
              historySuggestions={historySuggestions}
              popularSuggestions={popularSuggestions}
              medicalSuggestions={medicalSuggestions}
              isLoading={suggestionsLoading}
              isVisible={showSuggestions && (suggestionsLoading || hasSuggestions)}
              selectedIndex={selectedIndex}
              onSuggestionClick={handleSuggestionClick}
              onClose={handleCloseSuggestions}
              className=""
            />
          </div>
        </div>

        {/* Language and Search Button Row */}
        <div className={`flex flex-col sm:flex-row gap-4 items-end ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          {showLanguageSelect && (
            <div className="flex-1 sm:max-w-xs">
              <Label htmlFor="language-select" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('search:form.labels.searchLanguage')}
              </Label>
              <Select
                value={searchParams.language || ICD11_CONFIG.DEFAULT_LANGUAGE}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className={`h-12 border-2 border-gray-200 rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isRTL ? 'text-right' : 'text-left'}>
                  {ICD11_CONFIG.AVAILABLE_LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      <span className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="font-medium">{lang.toUpperCase()}</span>
                        <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-sm text-gray-500`}>
                          ({t(`search:languages.${lang}`)})
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
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <svg className={`animate-spin h-4 w-4 text-white ${isRTL ? 'ml-2 -mr-1' : '-ml-1 mr-2'}`} fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('search:form.buttons.searching')}
              </div>
            ) : (
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <svg className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {t('search:form.buttons.search')}
              </div>
            )}
          </Button>
        </div>

        {/* Advanced Options */}
        {showAdvancedOptions && (
          <div className="pt-4 border-t border-gray-200">
            <div className="space-y-4">
              <h3 className={`text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>{t('search:form.options.title')}</h3>
              
              {/* Flexible Search Option */}
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <Checkbox
                  id="flexible-search"
                  checked={searchParams.flexisearch}
                  onCheckedChange={toggleFlexisearch}
                  className="w-5 h-5"
                />
                <Label 
                  htmlFor="flexible-search" 
                  className={`text-sm text-gray-700 cursor-pointer flex items-start ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  <div>
                    <div className="font-medium">{t('search:form.labels.flexibleSearch')}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {t('search:form.options.flexibleSearchDescription')}
                    </div>
                  </div>
                </Label>
              </div>

              {/* Search Scope */}
              <div className="flex-1">
                <Label htmlFor="search-scope" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('search:form.labels.searchScope', 'Search Scope')}
                </Label>
                <Select
                  value={searchParams.scope || 'all'}
                  onValueChange={(value) => setSearchParams(prev => ({ ...prev, scope: value as any }))}
                >
                  <SelectTrigger className={`h-10 border-2 border-gray-200 rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={isRTL ? 'text-right' : 'text-left'}>
                    <SelectItem value="all">{t('search:scopes.all', 'All fields')}</SelectItem>
                    <SelectItem value="title">{t('search:scopes.title', 'Title only')}</SelectItem>
                    <SelectItem value="definition">{t('search:scopes.definition', 'Definition only')}</SelectItem>
                    <SelectItem value="synonym">{t('search:scopes.synonym', 'Synonyms only')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                  <Checkbox
                    id="include-deprecated"
                    checked={searchParams.includeDeprecated || false}
                    onCheckedChange={(checked) => setSearchParams(prev => ({ ...prev, includeDeprecated: checked }))}
                    className="w-4 h-4"
                  />
                  <Label 
                    htmlFor="include-deprecated" 
                    className={`text-sm text-gray-700 cursor-pointer ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    {t('search:form.labels.includeDeprecated', 'Include deprecated codes')}
                  </Label>
                </div>

                <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                  <Checkbox
                    id="leaf-nodes-only"
                    checked={searchParams.leafNodesOnly || false}
                    onCheckedChange={(checked) => setSearchParams(prev => ({ ...prev, leafNodesOnly: checked }))}
                    className="w-4 h-4"
                  />
                  <Label 
                    htmlFor="leaf-nodes-only" 
                    className={`text-sm text-gray-700 cursor-pointer ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    {t('search:form.labels.leafNodesOnly', 'Leaf nodes only')}
                  </Label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Stats */}
        {searchParams.term && (
          <div className={`text-xs text-gray-500 border-t border-gray-200 pt-3 ${isRTL ? 'text-right arabic-text' : 'text-left'}`}>
            <span>{t('search:form.stats.searchingIn')} • {t('search:form.stats.language', { language: searchParams.language?.toUpperCase() })}</span>
          </div>
        )}
      </div>
    </form>
  );
}

export default SearchForm; 