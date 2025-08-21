import type { AppProps } from 'next/app';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { queryClient } from '../lib/react-query';
import '../styles/globals.css';
import { ICD11Provider } from '../context/ICD11Context';
import { LanguageProvider } from '../context/LanguageContext';
import { OrganizationProvider } from '../context/OrganizationContext';
import { CustomThemeProvider } from '../context/ThemeContext';
import { AccessibilityProvider } from '../components/Accessibility';

export default function App({ Component, pageProps }: AppProps) {
  // Extract organization info from URL or props for multi-tenant support
  const organizationSlug = pageProps.organizationSlug;
  const domain = pageProps.domain;

  return (
    <QueryClientProvider client={queryClient}>
      <OrganizationProvider organizationSlug={organizationSlug} domain={domain}>
        <CustomThemeProvider>
          <AccessibilityProvider>
            <LanguageProvider>
              <ICD11Provider>
                <Component {...pageProps} />
              </ICD11Provider>
            </LanguageProvider>
          </AccessibilityProvider>
        </CustomThemeProvider>
      </OrganizationProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
} 