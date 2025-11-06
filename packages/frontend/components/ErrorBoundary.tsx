import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Typography, Paper, Box, Button, Alert } from '@mui/material';
import { ErrorOutline as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorStack = error.stack?.toLowerCase() || '';
    
    // Check if this is a browser extension error (comprehensive detection)
    const isExtensionError = 
      // Stack-based detection
      errorStack.includes('chrome-extension://') ||
      errorStack.includes('moz-extension://') ||
      errorStack.includes('safari-web-extension://') ||
      errorStack.includes('extension://') ||
      errorStack.includes('inpage.js') ||
      errorStack.includes('contentscript.js') ||
      errorStack.includes('background.js') ||
      
      // Message-based detection
      errorMessage.includes('metamask') ||
      errorMessage.includes('wallet') ||
      errorMessage.includes('web3') ||
      errorMessage.includes('ethereum') ||
      errorMessage.includes('coinbase') ||
      errorMessage.includes('trustwallet') ||
      errorMessage.includes('binance') ||
      errorMessage.includes('failed to connect') ||
      errorMessage.includes('connect') && (errorMessage.includes('wallet') || errorMessage.includes('metamask')) ||
      errorMessage.includes('extension') && errorMessage.includes('error') ||
      errorMessage.includes('inject') && errorMessage.includes('ethereum');

    if (isExtensionError) {
      // Don't trigger error boundary for extension errors
      console.log('Browser extension error suppressed by ErrorBoundary:', error.message);
      return { hasError: false, error: null, errorInfo: null };
    }

    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorStack = error.stack?.toLowerCase() || '';
    
    // Check if this is a browser extension error (comprehensive detection)
    const isExtensionError = 
      // Stack-based detection
      errorStack.includes('chrome-extension://') ||
      errorStack.includes('moz-extension://') ||
      errorStack.includes('safari-web-extension://') ||
      errorStack.includes('extension://') ||
      errorStack.includes('inpage.js') ||
      errorStack.includes('contentscript.js') ||
      errorStack.includes('background.js') ||
      
      // Message-based detection
      errorMessage.includes('metamask') ||
      errorMessage.includes('wallet') ||
      errorMessage.includes('web3') ||
      errorMessage.includes('ethereum') ||
      errorMessage.includes('coinbase') ||
      errorMessage.includes('trustwallet') ||
      errorMessage.includes('binance') ||
      errorMessage.includes('failed to connect') ||
      errorMessage.includes('connect') && (errorMessage.includes('wallet') || errorMessage.includes('metamask')) ||
      errorMessage.includes('extension') && errorMessage.includes('error') ||
      errorMessage.includes('inject') && errorMessage.includes('ethereum');

    if (isExtensionError) {
      // Don't log extension errors
      console.log('Browser extension error suppressed by ErrorBoundary:', error.message);
      this.setState({ hasError: false, error: null, errorInfo: null });
      return;
    }

    // Log application errors
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom color="error">
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              The application encountered an unexpected error. This is likely a temporary issue.
            </Typography>

            <Alert severity="error" sx={{ textAlign: 'left', mb: 3 }}>
              <Typography variant="body2" component="div">
                <strong>Error:</strong> {this.state.error.message}
              </Typography>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" component="pre" sx={{ 
                    fontSize: '0.75rem', 
                    overflow: 'auto',
                    maxHeight: 200 
                  }}>
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </Box>
              )}
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleReload}
              >
                Reload Page
              </Button>
              <Button
                variant="outlined"
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Note:</strong> If you have browser extensions like MetaMask installed, 
                they may cause harmless errors that can be ignored. Try disabling extensions 
                if the problem persists.
              </Typography>
            </Alert>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;