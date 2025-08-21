import { useState, useEffect } from 'react';
import type { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Layout } from '../components/Layout/Layout';
import { SearchForm, SearchResults } from '@/components';
import { useICD11Context } from '@/context';
import { ICD11_CONFIG } from '@/config';
import { ICD11SearchResult, SupportedLanguage } from '@shared/types/icd11';

export default function SearchPage() {
  const router = useRouter();
  const { t } = useTranslation(['common', 'search', 'medical']);
  const { search, searchParams, setSearchParams } = useICD11Context();
  const [selectedResult, setSelectedResult] = useState<ICD11SearchResult | null>(null);

  // Handle incoming query parameters on initial load
  useEffect(() => {
    const { term, lang } = router.query;
    const newParams = { ...searchParams };
    let needsSearch = false;

    if (term && typeof term === 'string' && term !== newParams.term) {
      newParams.term = term;
      needsSearch = true;
    }

    if (lang && typeof lang === 'string' && lang !== newParams.language) {
      newParams.language = lang as SupportedLanguage;
      needsSearch = true;
    }

    if (needsSearch) {
      search(newParams);
    }
  }, [router.query, search, searchParams]);
  
  const handleSelectResult = (result: ICD11SearchResult) => {
    setSelectedResult(result);
    
    // Navigate to entity page
    router.push(`/entity/${result.id}`);
  };

  return (
    <Layout 
      title={searchParams.term ? `${t('common:nav.search')}: ${searchParams.term} | ${t('common:meta.defaultTitle')}` : `${t('common:nav.search')} | ${t('common:meta.defaultTitle')}`} 
      description={t('common:meta.defaultDescription')}
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              {searchParams.term
                ? t('search:results.title') + ` for "${searchParams.term}"`
                : t('common:meta.defaultTitle')}
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              {t('common:meta.defaultDescription')} {t('common:homepage.hero.description')}
            </p>
          </div>

          {/* Main Search Section - Full Width */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <SearchForm showAdvancedOptions showLanguageSelect className="mb-0" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Enhanced Left sidebar with search options */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Language Selection Card */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
{t('search:form.labels.searchLanguage')}
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {ICD11_CONFIG.AVAILABLE_LANGUAGES.map((lang) => (
                      <label 
                        key={lang} 
                        className={`flex items-center cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 hover:bg-blue-50 ${
                          searchParams.language === lang 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="language"
                          value={lang}
                          checked={searchParams.language === lang}
                          onChange={() => setSearchParams(prev => ({...prev, language: lang as SupportedLanguage}))}
                          className="sr-only"
                        />
                        <span className="font-medium text-sm">{lang.toUpperCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Search Tips Card */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
{t('medical:search.suggestions.title')}
                  </h2>
                  <ul className="space-y-3">
                    {[
                      t('medical:search.suggestions.terminology'),
                      t('medical:search.suggestions.commonNames'),
                      t('medical:search.suggestions.codes'),
                      t('medical:search.suggestions.flexible'),
                      t('medical:search.suggestions.specific'),
                      t('medical:search.suggestions.broad')
                    ].map((tip, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Enhanced Main content area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <SearchResults 
                  className="p-0" 
                  maxHeight="max-h-[800px]" 
                  onSelectResult={handleSelectResult}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', [
        'common',
        'search',
        'medical',
        'errors',
        'accessibility'
      ])),
    },
  };
}; 