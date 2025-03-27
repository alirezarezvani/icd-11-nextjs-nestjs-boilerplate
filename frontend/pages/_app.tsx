import type { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from '../components/Layout';
import '../styles/globals.css';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#005EB8', // WHO blue
    },
    secondary: {
      main: '#D81B60',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system', 
      'BlinkMacSystemFont', 
      '"Segoe UI"', 
      'Roboto', 
      '"Helvetica Neue"', 
      'Arial', 
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);

  // This effect prevents hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
} 