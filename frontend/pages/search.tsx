import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { SearchForm, SearchResults } from '@/components';
import { useICD11Context } from '@/context';
import { ICD11_CONFIG } from '@/config';
import { ICD11SearchResult } from '@/types';

export default function SearchPage() {
  const router = useRouter();
  const { search, searchParams, setSearchTerm, setLanguage } = useICD11Context();
  const [selectedResult, setSelectedResult] = useState<ICD11SearchResult | null>(null);
  
  // Handle incoming query parameters on initial load
  useEffect(() => {
    const { term, lang } = router.query;
    
    if (term && typeof term === 'string' && term !== searchParams.term) {
      setSearchTerm(term);
    }
    
    if (lang && typeof lang === 'string' && lang !== searchParams.language) {
      setLanguage(lang);
    }
    
    // Perform search if there's a term
    if (term && typeof term === 'string' && term.trim()) {
      search();
    }
  }, [router.query, search, searchParams.language, searchParams.term, setLanguage, setSearchTerm]);
  
  const handleSelectResult = (result: ICD11SearchResult) => {
    setSelectedResult(result);
    
    // Navigate to entity page
    router.push(`/entity/${result.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Head>
        <title>
          {searchParams.term ? `Search: ${searchParams.term} | ICD-11` : 'Advanced Search | ICD-11'}
        </title>
        <meta
          name="description"
          content="Advanced search for WHO ICD-11 medical codes and classifications"
        />
      </Head>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar with search options */}
        <div className="lg:col-span-3">
          <div className="card mb-4">
            <h2 className="text-xl font-semibold mb-4">Search Options</h2>
            <SearchForm showAdvancedOptions showLanguageSelect className="mb-4" />
            
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Language</h3>
              <div className="space-y-2">
                {ICD11_CONFIG.AVAILABLE_LANGUAGES.map((lang) => (
                  <label key={lang} className="flex items-center cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="language"
                      value={lang}
                      checked={searchParams.language === lang}
                      onChange={() => setLanguage(lang)}
                      className="mr-2"
                    />
                    {lang.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Search Tips</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Use medical terminology for best results</li>
              <li>Try both common and scientific names</li>
              <li>Search by ICD-11 codes if known</li>
              <li>Enable flexible search for broader results</li>
              <li>Too many results? Use more specific terms</li>
              <li>Too few results? Try related terms</li>
            </ul>
          </div>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-9">
          <h1 className="text-2xl font-bold mb-4">
            {searchParams.term
              ? `Search Results for "${searchParams.term}"`
              : 'Advanced Search'}
          </h1>
          
          <SearchResults 
            className="mt-4" 
            maxHeight="max-h-[800px]" 
            onSelectResult={handleSelectResult}
          />
        </div>
      </div>
    </div>
  );
} 