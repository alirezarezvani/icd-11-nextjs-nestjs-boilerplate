/**
 * User Profile Page for ICD-11 Healthcare Platform
 * Protected route requiring authentication
 */

import React from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { 
  Container, 
  Box, 
  Typography, 
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import { 
  Email, 
  Person, 
  Business,
  CalendarToday,
  Security,
  MedicalServices,
  Verified,
  Edit,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { withRequiredAuth } from '../components/Auth/withAuth';
import { MainLayout } from '../components/Layout/MainLayout';
import { UserRole } from '../services/auth/auth.types';

const Profile: React.FC = () => {
  const { t } = useTranslation(['common', 'auth']);
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) {
    return null; // This shouldn't happen due to withRequiredAuth, but just in case
  }

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

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>{t('common:navigation.profile', 'Profile')} | ICD-11 Healthcare Platform</title>
        <meta 
          name="description" 
          content={t('auth:profile.description', 'Manage your ICD-11 Healthcare Platform profile')} 
        />
      </Head>

      <MainLayout>
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {t('auth:profile.title', 'My Profile')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('auth:profile.subtitle', 'Manage your account information and preferences')}
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {/* Profile Card */}
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                      <Avatar
                        sx={{ 
                          width: 80, 
                          height: 80, 
                          bgcolor: 'primary.main',
                          fontSize: '2rem',
                        }}
                      >
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" component="h2" gutterBottom>
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip
                            icon={<MedicalServices />}
                            label={getRoleLabel(user.role)}
                            color={getRoleColor(user.role)}
                            size="small"
                          />
                          {user.isEmailVerified && (
                            <Chip
                              icon={<Verified />}
                              label={t('auth:profile.verified', 'Verified')}
                              color="success"
                              variant="outlined"
                              size="small"
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {t('auth:profile.memberSince', 'Member since {{date}}', {
                            date: new Date(user.createdAt).toLocaleDateString(),
                          })}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom>
                      {t('auth:profile.accountDetails', 'Account Details')}
                    </Typography>

                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <Email />
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('auth:fields.email', 'Email Address')}
                          secondary={user.email}
                        />
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <Person />
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('auth:fields.fullName', 'Full Name')}
                          secondary={`${user.firstName} ${user.lastName}`}
                        />
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <Security />
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('auth:fields.role', 'Role')}
                          secondary={getRoleLabel(user.role)}
                        />
                      </ListItem>

                      {user.organizationId && (
                        <ListItem>
                          <ListItemIcon>
                            <Business />
                          </ListItemIcon>
                          <ListItemText 
                            primary={t('auth:fields.organization', 'Organization')}
                            secondary={user.organizationId}
                          />
                        </ListItem>
                      )}

                      <ListItem>
                        <ListItemIcon>
                          <CalendarToday />
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('auth:profile.lastLogin', 'Last Login')}
                          secondary={user.lastLoginAt 
                            ? new Date(user.lastLoginAt).toLocaleString()
                            : t('auth:profile.neverLoggedIn', 'Never logged in')
                          }
                        />
                      </ListItem>
                    </List>

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => router.push('/profile/edit')}
                      >
                        {t('auth:actions.editProfile', 'Edit Profile')}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => router.push('/profile/security')}
                      >
                        {t('auth:actions.security', 'Security')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Account Actions */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('auth:profile.quickActions', 'Quick Actions')}
                    </Typography>
                    
                    <List>
                      <ListItem button onClick={() => router.push('/dashboard')}>
                        <ListItemText primary={t('common:navigation.dashboard', 'Dashboard')} />
                      </ListItem>
                      
                      <ListItem button onClick={() => router.push('/settings')}>
                        <ListItemText primary={t('common:navigation.settings', 'Settings')} />
                      </ListItem>
                      
                      <ListItem button onClick={() => router.push('/history')}>
                        <ListItemText primary={t('common:navigation.history', 'Search History')} />
                      </ListItem>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <ListItem button onClick={handleLogout}>
                        <ListItemText 
                          primary={t('auth:actions.signOut', 'Sign Out')}
                          sx={{ color: 'error.main' }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>

                {!user.isEmailVerified && (
                  <Card sx={{ mt: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="warning.main">
                        {t('auth:verification.emailNotVerified', 'Email Not Verified')}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {t('auth:verification.pleaseVerify', 'Please verify your email to access all features.')}
                      </Typography>
                      <Button size="small" variant="outlined">
                        {t('auth:verification.resendEmail', 'Resend verification email')}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
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

export default withRequiredAuth(Profile);