import type { AppProps } from 'next/app';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { appWithTranslation } from 'next-i18next';
import nextI18nConfig from '../next-i18next.config';
import { queryClient } from '../lib/react-query';
import '../styles/globals.css';
import { ICD11Provider } from '../context/ICD11Context';
import { LanguageProvider } from '../context/LanguageContext';
import { OrganizationProvider } from '../context/OrganizationContext';
import { CustomThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { AccessibilityProvider } from '../components/Accessibility';
import ErrorBoundary from '../components/ErrorBoundary';
import { useEffect } from 'react';

function App({ Component, pageProps }: AppProps) {
  // Extract organization info from URL or props for multi-tenant support
  const organizationSlug = pageProps.organizationSlug;
  const domain = pageProps.domain;

  // Suppress browser extension errors (MetaMask, etc.)
  useEffect(() => {
    // Global error handler to suppress browser extension errors
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message?.toLowerCase() || '';
      const errorFilename = event.filename?.toLowerCase() || '';
      const errorStack = (event.error?.stack || '').toLowerCase();
      
      // Check if error is from browser extension (comprehensive patterns)
      const isExtensionError = 
        // URL-based detection
        errorFilename.includes('chrome-extension://') || 
        errorFilename.includes('moz-extension://') ||
        errorFilename.includes('safari-web-extension://') ||
        errorFilename.includes('extension://') ||
        
        // Stack-based detection
        errorStack.includes('chrome-extension://') ||
        errorStack.includes('moz-extension://') ||
        errorStack.includes('safari-web-extension://') ||
        
        // Message-based detection (wallet/web3 keywords)
        errorMessage.includes('metamask') ||
        errorMessage.includes('wallet') ||
        errorMessage.includes('web3') ||
        errorMessage.includes('ethereum') ||
        errorMessage.includes('coinbase') ||
        errorMessage.includes('trustwallet') ||
        errorMessage.includes('binance') ||
        errorMessage.includes('connect') && (errorMessage.includes('wallet') || errorMessage.includes('metamask')) ||
        
        // Specific error patterns
        errorMessage.includes('failed to connect') ||
        errorMessage.includes('extension') && errorMessage.includes('error') ||
        errorMessage.includes('inject') && errorMessage.includes('ethereum') ||
        
        // Common extension script patterns
        errorFilename.includes('inpage.js') ||
        errorFilename.includes('contentscript.js') ||
        errorFilename.includes('background.js');
      
      if (isExtensionError) {
        // Completely suppress extension errors
        console.log('Browser extension error suppressed:', event.message);
        event.preventDefault();
        event.stopImmediatePropagation();
        return true; // Prevent default error handling
      }
      return false; // Allow other errors to be handled normally
    };

    // Global unhandled rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      let reasonMessage = '';
      let reasonStack = '';
      
      if (reason) {
        if (typeof reason === 'string') {
          reasonMessage = reason.toLowerCase();
        } else if (typeof reason === 'object' && reason.message) {
          reasonMessage = reason.message.toLowerCase();
          reasonStack = (reason.stack || '').toLowerCase();
        }
      }
      
      // Check if promise rejection is from browser extension
      const isExtensionError = 
        reasonMessage.includes('metamask') ||
        reasonMessage.includes('wallet') ||
        reasonMessage.includes('web3') ||
        reasonMessage.includes('ethereum') ||
        reasonMessage.includes('coinbase') ||
        reasonMessage.includes('trustwallet') ||
        reasonMessage.includes('binance') ||
        reasonMessage.includes('failed to connect') ||
        reasonMessage.includes('extension') ||
        reasonMessage.includes('inject') ||
        reasonStack.includes('chrome-extension://') ||
        reasonStack.includes('moz-extension://') ||
        reasonStack.includes('safari-web-extension://') ||
        reasonStack.includes('inpage.js') ||
        reasonStack.includes('contentscript.js');
      
      if (isExtensionError) {
        console.log('Browser extension promise rejection suppressed:', reasonMessage);
        event.preventDefault();
        return true;
      }
      return false;
    };

    // Intercept console errors for extension filtering
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorMessage = args.join(' ').toLowerCase();
      
      // Suppress extension-related console errors
      if (errorMessage.includes('metamask') ||
          errorMessage.includes('wallet') ||
          errorMessage.includes('web3') ||
          errorMessage.includes('ethereum') ||
          errorMessage.includes('failed to connect') ||
          errorMessage.includes('chrome-extension://') ||
          errorMessage.includes('moz-extension://') ||
          errorMessage.includes('inpage.js')) {
        console.log('Browser extension console error suppressed:', args[0]);
        return;
      }
      
      // Call original console.error for non-extension errors
      originalConsoleError.apply(console, args);
    };

    // Add global error listeners
    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
      console.error = originalConsoleError; // Restore original console.error
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <OrganizationProvider organizationSlug={organizationSlug} domain={domain}>
          <LanguageProvider>
            <CustomThemeProvider>
              <AccessibilityProvider>
                <AuthProvider>
                  <ICD11Provider>
                    <Component {...pageProps} />
                  </ICD11Provider>
                </AuthProvider>
              </AccessibilityProvider>
            </CustomThemeProvider>
          </LanguageProvider>
        </OrganizationProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default appWithTranslation(App, nextI18nConfig); 