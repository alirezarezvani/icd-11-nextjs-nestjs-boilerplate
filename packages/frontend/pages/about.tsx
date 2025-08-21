import React from 'react';
import type { NextPage, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';

const About: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation(['about', 'common']);
  const { isRTL } = useLanguage();

  const handleStartSearching = () => {
    router.push('/search');
  };

  const handleLearnMore = () => {
    window.open('https://icd.who.int/en', '_blank', 'noopener,noreferrer');
  };

  return (
    <Layout
      title={t('about:meta.title')}
      description={t('about:meta.description')}
    >
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          {/* Hero Section - Matching homepage design */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative container mx-auto px-4 py-16 lg:py-20">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-white bg-opacity-20 rounded-full p-6">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3s-4.5 4.03-4.5 9 2.015 9 4.5 9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9l3 3-3 3m0 0l-3-3 3-3m-3 3H9m1.5 0h.75" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  {t('about:hero.title')}
                  <span className="block text-blue-200 font-light">{t('about:hero.subtitle')}</span>
                </h1>
                <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed">
                  {t('about:hero.description')}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={handleStartSearching}
                    className="inline-flex items-center px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg backdrop-blur-sm border border-white border-opacity-20"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {t('about:cta.buttons.startSearching')}
                  </button>
                  <button
                    onClick={handleLearnMore}
                    className="inline-flex items-center px-6 py-3 border-2 border-white border-opacity-30 hover:border-opacity-50 text-white rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:bg-white hover:bg-opacity-10"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {t('about:cta.buttons.learnMore')}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Decorative wave - matching homepage */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg className="w-full h-12 text-blue-50" preserveAspectRatio="none" viewBox="0 0 1200 120" fill="currentColor">
                <path d="M0,36L40,46.7C80,57,160,79,240,85.3C320,92,400,82,480,73.3C560,64,640,57,720,58.7C800,60,880,72,960,73.3C1040,75,1120,67,1160,62.7L1200,58.7L1200,120L1160,120C1120,120,1040,120,960,120C880,120,800,120,720,120C640,120,560,120,480,120C400,120,320,120,240,120C160,120,80,120,40,120L0,120Z"></path>
              </svg>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-4 lg:px-8 py-8">
            {/* Platform Overview Section */}
            <div className="mb-8 -mt-12 relative z-10">
              <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-10 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    {t('about:sections.platformOverview.title')}
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    {t('about:sections.platformOverview.description')}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 rounded-lg p-2 mr-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 10-8 8 7.962 7.962 0 01-5.291-2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {t('about:sections.platformOverview.features.title')}
                    </h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {t('about:sections.platformOverview.features.items', { returnObjects: true }).map((feature, index) => {
                      const iconColors = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600', 'text-indigo-600'];
                      const bgColors = ['bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-orange-50', 'bg-indigo-50'];
                      const borderColors = ['border-blue-200', 'border-green-200', 'border-purple-200', 'border-orange-200', 'border-indigo-200'];
                      
                      return (
                        <div key={index} className="flex items-start p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                          <div className={`${bgColors[index % bgColors.length]} ${borderColors[index % borderColors.length]} border rounded-lg p-2 mr-3 flex-shrink-0`}>
                            <svg className={`w-4 h-4 ${iconColors[index % iconColors.length]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {index === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />}
                              {index === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />}
                              {index === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
                              {index === 3 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />}
                              {index >= 4 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />}
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-700 leading-relaxed">
                            {feature}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Healthcare Applications Section */}
            <div className="mb-8">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                  {t('about:sections.healthcareApplications.title')}
                </h3>
                <p className="text-lg text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                  {t('about:sections.healthcareApplications.description')}
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {t('about:sections.healthcareApplications.useCases.items', { returnObjects: true }).map((useCase, index) => {
                    const iconData = [
                      { icon: 'hospital', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                      { icon: 'research', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
                      { icon: 'billing', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
                      { icon: 'report', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
                      { icon: 'team', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' }
                    ];
                    
                    const currentIcon = iconData[index % iconData.length];
                    
                    return (
                      <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                        <div className={`${currentIcon.bg} ${currentIcon.border} border rounded-full p-4 mb-4 inline-flex`}>
                          <svg className={`w-8 h-8 ${currentIcon.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {currentIcon.icon === 'hospital' && (
                              <>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M12 8l-2-2m0 0l-2-2 2-2 2 2-2 2z" />
                              </>
                            )}
                            {currentIcon.icon === 'research' && (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            )}
                            {currentIcon.icon === 'billing' && (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            )}
                            {currentIcon.icon === 'report' && (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            )}
                            {currentIcon.icon === 'team' && (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            )}
                          </svg>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed font-medium">{useCase}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Global Accessibility Section */}
            <div className="mb-8">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                  {t('about:sections.globalAccessibility.title')}
                </h3>
                <p className="text-lg text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                  {t('about:sections.globalAccessibility.description')}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Languages Card */}
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mr-3">
                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {t('about:sections.globalAccessibility.languages.title')}
                      </h4>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {t('about:sections.globalAccessibility.languages.description')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {t('about:sections.globalAccessibility.languages.items', { returnObjects: true }).map((language, index) => {
                        const colors = ['text-blue-600 bg-blue-50 border-blue-200', 'text-red-600 bg-red-50 border-red-200', 'text-green-600 bg-green-50 border-green-200', 'text-amber-600 bg-amber-50 border-amber-200', 'text-purple-600 bg-purple-50 border-purple-200', 'text-cyan-600 bg-cyan-50 border-cyan-200'];
                        return (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[index % colors.length]} hover:shadow-sm transition-all duration-200`}
                          >
                            {language.split(' - ')[0]}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Accessibility Features Card */}
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 mr-3">
                        <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {t('about:sections.globalAccessibility.accessibility.title')}
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {t('about:sections.globalAccessibility.accessibility.items', { returnObjects: true }).map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-1 mr-3 mt-0.5 flex-shrink-0">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-700 leading-relaxed">
                            {feature}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WHO Partnership Section */}
            <div className="mb-8">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                  {t('about:sections.whoPartnership.title')}
                </h3>
                <p className="text-lg text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                  {t('about:sections.whoPartnership.description')}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Compliance Card */}
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mr-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {t('about:sections.whoPartnership.compliance.title')}
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {t('about:sections.whoPartnership.compliance.items', { returnObjects: true }).map((item, index) => (
                        <div key={index} className="flex items-start">
                          <div className="bg-green-50 border border-green-200 rounded p-1 mr-3 mt-0.5 flex-shrink-0">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-700 leading-relaxed">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Source Card */}
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mr-3">
                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {t('about:sections.whoPartnership.dataSource.title')}
                      </h4>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {t('about:sections.whoPartnership.dataSource.description')}
                    </p>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 text-center italic font-medium">
                          {t('about:sections.whoPartnership.dataSource.copyright')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Excellence Section */}
            <div className="mb-8">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                  {t('about:sections.technicalExcellence.title')}
                </h3>
                <p className="text-lg text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                  {t('about:sections.technicalExcellence.description')}
                </p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Frontend Technologies */}
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mr-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {t('about:sections.technicalExcellence.architecture.frontend.title')}
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {t('about:sections.technicalExcellence.architecture.frontend.items', { returnObjects: true }).map((tech, index) => (
                        <p key={index} className="text-sm font-medium text-gray-600">
                          {tech}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Backend Technologies */}
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mr-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {t('about:sections.technicalExcellence.architecture.backend.title')}
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {t('about:sections.technicalExcellence.architecture.backend.items', { returnObjects: true }).map((tech, index) => (
                        <p key={index} className="text-sm font-medium text-gray-600">
                          {tech}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Performance Features */}
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mr-3">
                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {t('about:sections.technicalExcellence.performance.title')}
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {t('about:sections.technicalExcellence.performance.items', { returnObjects: true }).map((feature, index) => (
                        <p key={index} className="text-sm font-medium text-gray-600">
                          {feature}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action Section - Matching homepage style */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 lg:p-12 text-center">
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="relative z-10">
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                  {t('about:cta.title')}
                </h3>
                <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8 leading-relaxed">
                  {t('about:cta.description')}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={handleStartSearching}
                    className="inline-flex items-center px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg backdrop-blur-sm border border-white border-opacity-20"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {t('about:cta.buttons.startSearching')}
                  </button>
                  <button
                    onClick={handleLearnMore}
                    className="inline-flex items-center px-6 py-3 border-2 border-white border-opacity-30 hover:border-opacity-50 text-white rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:bg-white hover:bg-opacity-10"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {t('about:cta.buttons.learnMore')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', [
        'about',
        'common',
        'search',
        'medical',
        'errors',
        'accessibility'
      ])),
    },
  };
};

export default About; 