import type { AppProps } from 'next/app';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { queryClient } from '../lib/react-query';
import '../styles/globals.css';
import { ICD11Provider } from '../context/ICD11Context';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ICD11Provider>
        <Component {...pageProps} />
      </ICD11Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
} 