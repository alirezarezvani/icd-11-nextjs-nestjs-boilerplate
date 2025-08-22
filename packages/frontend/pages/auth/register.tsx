/**
 * Register Page for ICD-11 Healthcare Platform
 */

import React, { useEffect } from 'react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Container, Box, Typography, Paper } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAuth } from '../../hooks/useAuth';
import { RegisterForm } from '../../components/Auth/RegisterForm';
import { MainLayout } from '../../components/Layout/MainLayout';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation(['common', 'auth']);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const redirectTo = router.query.redirect as string;

  useEffect(() => {
    if (isAuthenticated) {
      const destination = redirectTo || '/dashboard';
      router.push(destination);
    }
  }, [isAuthenticated, router, redirectTo]);

  const handleRegisterSuccess = () => {
    const destination = redirectTo || '/dashboard';
    router.push(destination);
  };

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Head>
        <title>{t('auth:register.title', 'Create Account')} | ICD-11 Healthcare Platform</title>
        <meta 
          name="description" 
          content={t('auth:register.description', 'Create your account for the ICD-11 Healthcare Platform')} 
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
              py: 4,
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              }}
            >
              <Box textAlign="center" mb={4}>
                <Typography variant="h3" component="h1" gutterBottom>
                  {t('auth:register.welcome', 'Join Our Platform')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t('auth:register.subtitle', 'Create your account to access the ICD-11 Healthcare Platform')}
                </Typography>
              </Box>

              <RegisterForm
                onSuccess={handleRegisterSuccess}
                onSwitchToLogin={() => router.push('/auth/login')}
                redirectTo={redirectTo}
                isModal={false}
              />
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

export default RegisterPage;