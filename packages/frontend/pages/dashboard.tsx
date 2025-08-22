/**
 * Dashboard Page for ICD-11 Healthcare Platform
 * Protected route requiring authentication
 */

import React from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Avatar,
  Chip,
  Alert,
} from '@mui/material';
import { 
  Search, 
  History, 
  Bookmark, 
  Settings, 
  MedicalServices,
  Analytics,
  People,
  Security,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { withRequiredAuth } from '../components/Auth/withAuth';
import { MainLayout } from '../components/Layout/MainLayout';
import { UserRole } from '../services/auth/auth.types';

const Dashboard: React.FC = () => {
  const { t } = useTranslation(['common', 'auth', 'search']);
  const router = useRouter();
  const { user, hasRole } = useAuth();

  const quickActions = [
    {
      title: t('search:actions.search', 'Search ICD-11'),
      description: t('search:actions.searchDescription', 'Find medical codes and classifications'),
      icon: <Search />,
      action: () => router.push('/search'),
      color: 'primary' as const,
    },
    {
      title: t('common:navigation.history', 'Search History'),
      description: t('search:actions.historyDescription', 'View your recent searches'),
      icon: <History />,
      action: () => router.push('/history'),
      color: 'secondary' as const,
    },
    {
      title: t('common:navigation.bookmarks', 'Bookmarks'),
      description: t('search:actions.bookmarksDescription', 'Access your saved codes'),
      icon: <Bookmark />,
      action: () => router.push('/bookmarks'),
      color: 'info' as const,
    },
    {
      title: t('common:navigation.settings', 'Settings'),
      description: t('auth:profile.settings', 'Manage your account settings'),
      icon: <Settings />,
      action: () => router.push('/settings'),
      color: 'default' as const,
    },
  ];

  const adminActions = [
    {
      title: t('auth:admin.users', 'User Management'),
      description: t('auth:admin.usersDescription', 'Manage organization users'),
      icon: <People />,
      action: () => router.push('/admin/users'),
      color: 'warning' as const,
    },
    {
      title: t('auth:admin.analytics', 'Analytics'),
      description: t('auth:admin.analyticsDescription', 'View usage analytics'),
      icon: <Analytics />,
      action: () => router.push('/admin/analytics'),
      color: 'success' as const,
    },
    {
      title: t('auth:admin.security', 'Security'),
      description: t('auth:admin.securityDescription', 'Security settings'),
      icon: <Security />,
      action: () => router.push('/admin/security'),
      color: 'error' as const,
    },
  ];

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'error';
      case UserRole.ORG_ADMIN:
        return 'warning';
      case UserRole.HEALTHCARE_PROVIDER:
        return 'info';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return t('auth:roles.superAdmin', 'Super Admin');
      case UserRole.ORG_ADMIN:
        return t('auth:roles.orgAdmin', 'Organization Admin');
      case UserRole.HEALTHCARE_PROVIDER:
        return t('auth:roles.provider', 'Healthcare Provider');
      default:
        return t('auth:roles.user', 'User');
    }
  };

  return (
    <>
      <Head>
        <title>{t('common:navigation.dashboard', 'Dashboard')} | ICD-11 Healthcare Platform</title>
        <meta 
          name="description" 
          content={t('auth:dashboard.description', 'Your ICD-11 Healthcare Platform dashboard')} 
        />
      </Head>

      <MainLayout>
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            {/* Welcome Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                <Avatar
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    bgcolor: 'primary.main',
                    fontSize: '1.5rem',
                  }}
                >
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {t('auth:dashboard.welcome', 'Welcome back, {{name}}!', {
                      name: user?.firstName,
                    })}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      icon={<MedicalServices />}
                      label={getRoleLabel(user?.role || UserRole.USER)}
                      color={getRoleColor(user?.role || UserRole.USER)}
                      size="small"
                    />
                    {user?.organizationId && (
                      <Chip
                        label={t('auth:profile.organization', 'Organization Member')}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
              </Box>

              <Typography variant="body1" color="text.secondary">
                {t('auth:dashboard.subtitle', 'Access ICD-11 medical classifications and manage your healthcare data')}
              </Typography>
            </Box>

            {!user?.isEmailVerified && (
              <Alert severity="warning" sx={{ mb: 4 }}>
                {t('auth:verification.emailNotVerified', 'Please verify your email address to access all features.')}
                <Button size="small" sx={{ ml: 2 }}>
                  {t('auth:verification.resendEmail', 'Resend verification email')}
                </Button>
              </Alert>
            )}

            {/* Quick Actions */}
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
              {t('auth:dashboard.quickActions', 'Quick Actions')}
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={action.action}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: `${action.color}.main`,
                            width: 48,
                            height: 48,
                          }}
                        >
                          {action.icon}
                        </Avatar>
                      </Box>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" color={action.color}>
                        {t('common:actions.open', 'Open')}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Admin Actions */}
            {hasRole(UserRole.ORG_ADMIN) && (
              <>
                <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                  {t('auth:dashboard.adminActions', 'Administrative Actions')}
                </Typography>

                <Grid container spacing={3}>
                  {adminActions.map((action, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card
                        sx={{
                          height: '100%',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 4,
                          },
                        }}
                        onClick={action.action}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: `${action.color}.main`,
                                width: 48,
                                height: 48,
                              }}
                            >
                              {action.icon}
                            </Avatar>
                          </Box>
                          <Typography variant="h6" component="h3" gutterBottom>
                            {action.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {action.description}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button size="small" color={action.color}>
                            {t('common:actions.manage', 'Manage')}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
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
        'search',
        'medical',
        'errors',
        'accessibility',
      ])),
    },
  };
};

export default withRequiredAuth(Dashboard);