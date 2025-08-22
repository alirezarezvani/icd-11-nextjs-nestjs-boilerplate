import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { SearchSuggestion } from '@/services/api/search-suggestions.service';
import { useLanguage } from '@/context/LanguageContext';

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  historySuggestions: SearchSuggestion[];
  popularSuggestions: SearchSuggestion[];
  medicalSuggestions: SearchSuggestion[];
  isLoading: boolean;
  isVisible: boolean;
  selectedIndex: number;
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  onClose: () => void;
  className?: string;
}

export function SearchSuggestions({
  suggestions,
  historySuggestions,
  popularSuggestions,
  medicalSuggestions,
  isLoading,
  isVisible,
  selectedIndex,
  onSuggestionClick,
  onClose,
  className = '',
}: SearchSuggestionsProps) {
  const { t } = useTranslation(['search', 'common']);
  const { isRTL } = useLanguage();
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected suggestion
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.querySelector(
        `[data-suggestion-index="${selectedIndex}"]`
      ) as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible || (!isLoading && suggestions.length === 0)) {
    return null;
  }

  const getSuggestionIcon = (type: string) => {
    const iconClass = "w-4 h-4 text-gray-500";
    switch (type) {
      case 'history':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'popular':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'medical':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
    }
  };

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'history':
        return t('search:suggestions.history.title');
      case 'popular':
        return t('search:suggestions.popular.title');
      case 'medical':
        return t('search:suggestions.medical.title');
      default:
        return '';
    }
  };

  const renderSuggestionGroup = (groupSuggestions: SearchSuggestion[], title: string, emptyMessage: string) => {
    if (groupSuggestions.length === 0) return null;

    return (
      <div className="py-2">
        <div className={`px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>
          {title}
        </div>
        {groupSuggestions.map((suggestion, groupIndex) => {
          const globalIndex = suggestions.findIndex(s => s === suggestion);
          const isSelected = globalIndex === selectedIndex;
          
          return (
            <button
              key={`${suggestion.type}-${suggestion.text}-${groupIndex}`}
              data-suggestion-index={globalIndex}
              type="button"
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors duration-150 ${
                isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              } ${isRTL ? 'text-right' : 'text-left'}`}
              onClick={() => onSuggestionClick(suggestion)}
              role="option"
              aria-selected={isSelected}
            >
              <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                <div className="flex-shrink-0">
                  {getSuggestionIcon(suggestion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium text-gray-900 truncate ${isRTL ? 'arabic-text' : ''}`}>
                    {suggestion.text}
                  </div>
                  {suggestion.category && (
                    <div className={`text-xs text-gray-500 truncate ${isRTL ? 'arabic-text' : ''}`}>
                      {suggestion.category}
                    </div>
                  )}
                </div>
                {suggestion.count && (
                  <div className="flex-shrink-0">
                    <span className="text-xs text-gray-400">
                      ({suggestion.count})
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`absolute top-full left-0 right-0 z-50 mt-1 ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div
        ref={suggestionsRef}
        className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        role="listbox"
        aria-label={t('search:suggestions.title')}
      >
        {isLoading ? (
          <div className="px-4 py-8 text-center">
            <div className="inline-flex items-center space-x-2">
              <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm text-gray-500">{t('search:suggestions.loading')}</span>
            </div>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="text-sm text-gray-500">{t('search:suggestions.noSuggestions')}</div>
          </div>
        ) : (
          <div className="py-1">
            {renderSuggestionGroup(
              historySuggestions,
              t('search:suggestions.history.title'),
              t('search:suggestions.history.empty')
            )}
            
            {renderSuggestionGroup(
              popularSuggestions,
              t('search:suggestions.popular.title'),
              t('search:suggestions.popular.empty')
            )}
            
            {renderSuggestionGroup(
              medicalSuggestions,
              t('search:suggestions.medical.title'),
              t('search:suggestions.medical.empty')
            )}
            
            {/* Keyboard hint */}
            <div className={`px-3 py-2 border-t border-gray-100 bg-gray-50 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="text-xs text-gray-500">
                {t('search:suggestions.keyboardHint')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchSuggestions;