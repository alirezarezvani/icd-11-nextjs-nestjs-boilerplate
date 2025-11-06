/**
 * Protected Route Component for ICD-11 Healthcare Platform
 * Provides authentication and authorization guards for pages and components
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { Shield, Warning } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../services/auth/auth.types';
import { AuthModal } from './AuthModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;
  showAuthModal?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  allowedRoles = [],
  redirectTo,
  fallback,
  showAuthModal = false,
}) => {
  const { t } = useTranslation(['common', 'auth']);
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasRole, hasAnyRole } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (isLoading) return;

      setIsChecking(false);

      // If authentication is not required, allow access
      if (!requireAuth) {
        return;
      }

      // If user is not authenticated
      if (!isAuthenticated) {
        if (showAuthModal) {
          setShowModal(true);
        } else if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push(`/auth/login?redirect=${encodeURIComponent(router.asPath)}`);
        }
        return;
      }

      // If specific roles are required, check authorization
      if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
        router.push('/auth/unauthorized');
        return;
      }
    };

    checkAccess();
  }, [
    isLoading,
    isAuthenticated,
    user,
    requireAuth,
    allowedRoles,
    redirectTo,
    showAuthModal,
    router,
    hasAnyRole,
  ]);

  // Show loading spinner while checking authentication
  if (isLoading || isChecking) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          {t('auth:loading.verifying', 'Verifying access...')}
        </Typography>
      </Box>
    );
  }

  // If authentication is not required, show content
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If user is not authenticated and we're showing modal
  if (!isAuthenticated && showAuthModal) {
    return (
      <>
        <AuthModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            // Page will re-render with authenticated state
          }}
        />
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
          gap={2}
          sx={{ opacity: 0.5 }}
        >
          <Shield sx={{ fontSize: 60, color: 'text.secondary' }} />
          <Typography variant="h6" align="center">
            {t('auth:protection.loginRequired', 'Please sign in to access this content')}
          </Typography>
          <Button
            variant="contained"
            onClick={() => setShowModal(true)}
            startIcon={<Shield />}
          >
            {t('auth:actions.signIn', 'Sign In')}
          </Button>
        </Box>
      </>
    );
  }

  // If user is not authenticated (fallback)
  if (!isAuthenticated) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        gap={2}
      >
        <Shield sx={{ fontSize: 60, color: 'text.secondary' }} />
        <Typography variant="h6" align="center">
          {t('auth:protection.loginRequired', 'Please sign in to access this content')}
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(router.asPath)}`)}
          startIcon={<Shield />}
        >
          {t('auth:actions.signIn', 'Sign In')}
        </Button>
      </Box>
    );
  }

  // If role authorization failed
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        gap={2}
      >
        <Warning sx={{ fontSize: 60, color: 'warning.main' }} />
        <Typography variant="h6" align="center">
          {t('auth:protection.insufficientPermissions', 'Insufficient permissions to access this content')}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {t('auth:protection.contactAdmin', 'Contact your administrator if you believe this is an error')}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => router.back()}
        >
          {t('common:actions.goBack', 'Go Back')}
        </Button>
      </Box>
    );
  }

  // User is authenticated and authorized, show protected content
  return <>{children}</>;
};

export default ProtectedRoute;