import React, { useState, useEffect } from 'react';
import { Button, Skeleton, Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { UserMenu } from './UserMenu';
import { AuthModal, AuthModalMode } from './AuthModal';

interface AuthButtonsProps {
  variant?: 'desktop' | 'mobile';
  className?: string;
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({
  variant = 'desktop',
  className = '',
}) => {
  const { t } = useTranslation(['common', 'auth']);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignInClick = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const handleSignUpClick = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  const handleModalClose = () => {
    setAuthModalOpen(false);
  };

  // Navigation handlers for UserMenu
  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  const handleDashboardClick = () => {
    router.push('/dashboard');
  };

  // Show skeleton while loading or not mounted (prevents hydration mismatch)
  if (!isMounted || isLoading) {
    const isMobile = variant === 'mobile';
    return (
      <Box className={className} sx={{ display: 'flex', gap: 1, flexDirection: isMobile ? 'column' : 'row' }}>
        <Skeleton variant="rectangular" width={isMobile ? '100%' : 80} height={36} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={isMobile ? '100%' : 80} height={36} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  // Show user menu if authenticated
  if (isAuthenticated) {
    return (
      <div className={className}>
        <UserMenu 
          onProfileClick={handleProfileClick}
          onSettingsClick={handleSettingsClick}
          onDashboardClick={handleDashboardClick}
        />
      </div>
    );
  }

  // Show auth buttons if not authenticated
  const isMobile = variant === 'mobile';

  return (
    <div className={`${className} ${isMobile ? 'space-y-2' : 'space-x-2'} flex ${isMobile ? 'flex-col' : 'flex-row'}`}>
      <Button
        variant="outlined"
        onClick={handleSignInClick}
        sx={{
          color: 'white',
          borderColor: 'rgba(255, 255, 255, 0.5)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            borderColor: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
          textTransform: 'none',
          fontWeight: 500,
        }}
        fullWidth={isMobile}
      >
        {t('auth:actions.signIn', 'Sign In')}
      </Button>

      <Button
        variant="contained"
        onClick={handleSignUpClick}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          color: 'primary.main',
          '&:hover': {
            backgroundColor: 'white',
          },
          textTransform: 'none',
          fontWeight: 600,
        }}
        fullWidth={isMobile}
      >
        {t('auth:actions.signUp', 'Sign Up')}
      </Button>

      <AuthModal
        open={authModalOpen}
        onClose={handleModalClose}
        initialMode={authModalMode}
      />
    </div>
  );
};

export default AuthButtons;