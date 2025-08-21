import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout } from '../components/Layout/Layout';
import { SearchForm } from '../components/SearchForm';
import { SearchResults } from '../components/SearchResults';
import { useICD11Context } from '@/context';
import { ICD11SearchResult } from '@shared/types/icd11';

const Home: NextPage = () => {
  const router = useRouter();
  const { searchParams } = useICD11Context();

  const handleSelectResult = (result: ICD11SearchResult) => {
    router.push(`/entity/${Buffer.from(result.id).toString('base64').replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' }[m]!))}`);
  };

  return (
    <Layout title="ICD-11 Search | WHO Healthcare Code Explorer">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative container mx-auto px-4 py-20 lg:py-24">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-white bg-opacity-20 rounded-full p-6">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 10-8 8 7.962 7.962 0 01-5.291-2z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                ICD-11 Healthcare
                <span className="block text-blue-200">Code Search</span>
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto mb-8 leading-relaxed">
                Official WHO International Classification of Diseases (ICD-11) database search. 
                Find accurate medical codes and classifications for healthcare documentation.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-200">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  WHO Official Database
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  6 Languages Supported
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Real-time Search
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-12 text-blue-50" preserveAspectRatio="none" viewBox="0 0 1200 120" fill="currentColor">
              <path d="M0,36L40,46.7C80,57,160,79,240,85.3C320,92,400,82,480,73.3C560,64,640,57,720,58.7C800,60,880,72,960,73.3C1040,75,1120,67,1160,62.7L1200,58.7L1200,120L1160,120C1120,120,1040,120,960,120C880,120,800,120,720,120C640,120,560,120,480,120C400,120,320,120,240,120C160,120,80,120,40,120L0,120Z"></path>
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-8">
          {/* Main Search Section */}
          <div className="mb-8 -mt-12 relative z-10">
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-10 max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Search Medical Codes & Classifications
                </h2>
                <p className="text-lg text-gray-600">
                  Enter medical terms, conditions, or symptoms to find corresponding ICD-11 codes
                </p>
              </div>
              <SearchForm 
                autoFocus={true}
                showLanguageSelect={true}
                showAdvancedOptions={true}
                className="mb-0"
              />
            </div>
          </div>

          {/* Quick Start Guide */}
          {!searchParams.term && (
            <div className="mb-8">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                  How to Search Effectively
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: (
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      ),
                      title: "Use Medical Terms",
                      description: "Search using proper medical terminology like 'hypertension' instead of 'high blood pressure'"
                    },
                    {
                      icon: (
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                      ),
                      title: "Choose Language",
                      description: "Select from English, Spanish, French, Arabic, Chinese, or Russian for localized results"
                    },
                    {
                      icon: (
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ),
                      title: "Use Flexible Search",
                      description: "Enable flexible search to include synonyms, alternative spellings, and related terms"
                    }
                  ].map((item, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                      <div className="flex justify-center mb-4">
                        <div className="bg-gray-50 rounded-full p-3">
                          {item.icon}
                        </div>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchParams.term && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <SearchResults 
                  className="p-0" 
                  maxHeight="max-h-[800px]" 
                  onSelectResult={handleSelectResult}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;