/**
 * Unauthorized Access Page for ICD-11 Healthcare Platform
 */

import React from 'react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { Warning, ArrowBack, Home } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAuth } from '../../hooks/useAuth';
import { MainLayout } from '../../components/Layout/MainLayout';

const UnauthorizedPage: React.FC = () => {
  const { t } = useTranslation(['common', 'auth']);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <>
      <Head>
        <title>{t('auth:unauthorized.title', 'Access Denied')} | ICD-11 Healthcare Platform</title>
        <meta 
          name="description" 
          content={t('auth:unauthorized.description', 'You do not have permission to access this resource')} 
        />
      </Head>

      <MainLayout>
        <Container maxWidth="md">
          <Box
            sx={{
              minHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              py: 4,
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 6,
                borderRadius: 2,
                textAlign: 'center',
                maxWidth: 500,
                width: '100%',
              }}
            >
              <Warning
                sx={{
                  fontSize: 80,
                  color: 'warning.main',
                  mb: 3,
                }}
              />

              <Typography variant="h3" component="h1" gutterBottom>
                {t('auth:unauthorized.heading', 'Access Denied')}
              </Typography>

              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('auth:unauthorized.message', 'You do not have permission to access this resource')}
              </Typography>

              {user && (
                <Box sx={{ my: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('auth:unauthorized.currentUser', 'Currently signed in as:')}
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user.firstName} {user.lastName} ({user.email})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('auth:unauthorized.role', 'Role: {{role}}', { role: user.role })}
                  </Typography>
                </Box>
              )}

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {t('auth:unauthorized.suggestion', 'This might be because:')}
              </Typography>

              <Box sx={{ textAlign: 'left', mb: 4 }}>
                <Typography variant="body2" color="text.secondary" component="li">
                  {t('auth:unauthorized.reason1', 'Your account does not have the required permissions')}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="li">
                  {t('auth:unauthorized.reason2', 'Your session may have expired')}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="li">
                  {t('auth:unauthorized.reason3', 'The resource requires a different user role')}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                {t('auth:unauthorized.contact', 'Contact your administrator if you believe this is an error.')}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleGoBack}
                >
                  {t('common:actions.goBack', 'Go Back')}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={handleGoHome}
                >
                  {t('common:actions.goHome', 'Go Home')}
                </Button>

                {user && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleLogout}
                  >
                    {t('auth:actions.signOut', 'Sign Out')}
                  </Button>
                )}
              </Box>
            </Paper>
          </Box>
        </Container>
      </MainLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'auth',
        'medical',
        'errors',
        'accessibility',
      ])),
    },
  };
};

export default UnauthorizedPage;