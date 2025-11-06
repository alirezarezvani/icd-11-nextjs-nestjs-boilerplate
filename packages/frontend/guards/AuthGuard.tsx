import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../services/auth/auth.types';
import { useTranslation } from 'next-i18next';
import AuthModal from '../components/Auth/AuthModal';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
  showModal?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = false,
  allowedRoles,
  fallbackPath = '/',
  showModal = false,
}) => {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check if user has required role
  const hasRequiredRole = (userRole: UserRole, allowedRoles?: UserRole[]): boolean => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(userRole);
  };

  useEffect(() => {
    // Don't do anything while still loading
    if (isLoading) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      if (showModal) {
        setShowAuthModal(true);
      } else {
        router.push(fallbackPath);
      }
      return;
    }

    // If user is authenticated but doesn't have required role
    if (requireAuth && isAuthenticated && user && allowedRoles && !hasRequiredRole(user.role, allowedRoles)) {
      router.push(fallbackPath);
      return;
    }

    // Close auth modal if user becomes authenticated
    if (isAuthenticated && showAuthModal) {
      setShowAuthModal(false);
    }
  }, [isAuthenticated, isLoading, user, requireAuth, allowedRoles, router, fallbackPath, showModal, showAuthModal]);

  // Show loading while loading
  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          {t('auth:loading.initializing', 'Initializing...')}
        </Typography>
      </Box>
    );
  }

  // Show auth modal if required
  if (requireAuth && !isAuthenticated && showModal) {
    return (
      <>
        {children}
        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="login"
        />
      </>
    );
  }

  // Show unauthorized message if user doesn't have required role
  if (requireAuth && isAuthenticated && user && allowedRoles && !hasRequiredRole(user.role, allowedRoles)) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        gap={2}
        textAlign="center"
        p={4}
      >
        <Typography variant="h5" color="error" gutterBottom>
          {t('auth:errors.unauthorized', 'Access Denied')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('auth:errors.insufficientPermissions', 'You do not have permission to access this page.')}
        </Typography>
      </Box>
    );
  }

  // Show content if all checks pass
  return <>{children}</>;
};

export default AuthGuard;