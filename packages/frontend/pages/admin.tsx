import React from 'react';
import { NextPage } from 'next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import {
  Container,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  People as UsersIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Dataset as DatabaseIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { withAdminAuth } from '../components/Auth/withAuth';
import Layout from '../components/Layout';
import { UserRole } from '../services/auth/auth.types';

// Mock data for demonstration
const mockStats = {
  totalUsers: 1247,
  activeUsers: 892,
  searchesThisMonth: 15683,
  systemHealth: 98.5,
};

const mockRecentActivity = [
  { id: 1, action: 'New user registration', user: 'john.doe@hospital.com', time: '5 minutes ago' },
  { id: 2, action: 'Search performed', user: 'jane.smith@clinic.org', time: '12 minutes ago' },
  { id: 3, action: 'Profile updated', user: 'dr.wilson@medical.edu', time: '1 hour ago' },
  { id: 4, action: 'Admin settings changed', user: 'admin@healthcare.gov', time: '2 hours ago' },
];

const AdminPage: NextPage = () => {
  const { t } = useTranslation(['common', 'auth']);
  const { user } = useAuth();

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            <AdminIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            {t('common:navigation.admin', 'Administration')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            System administration and management dashboard
          </Typography>
          <Chip
            label={`Logged in as: ${user?.role}`}
            color="primary"
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </Box>

        {/* Quick Stats */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { 
            xs: '1fr',
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(4, 1fr)' 
          },
          gap: 3,
          mb: 4 
        }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <UsersIcon color="primary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {mockStats.totalUsers.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
              <Typography variant="caption" color="success.main">
                +12% this month
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="success" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {mockStats.activeUsers.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Active Users
              </Typography>
              <Typography variant="caption" color="success.main">
                +8% this week
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AnalyticsIcon color="info" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {mockStats.searchesThisMonth.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Searches This Month
              </Typography>
              <Typography variant="caption" color="info.main">
                +25% vs last month
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {mockStats.systemHealth}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                System Health
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={mockStats.systemHealth} 
                sx={{ mt: 1 }}
                color="success"
              />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3
        }}>
          {/* Admin Actions */}
          <Box sx={{ flex: { md: 2 } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('auth:admin.users', 'Administrative Actions')}
                </Typography>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 2
                }}>
                  <Card variant="outlined">
                    <CardContent>
                      <UsersIcon color="primary" sx={{ mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        {t('auth:admin.users', 'User Management')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t('auth:admin.usersDescription', 'Manage organization users and permissions')}
                      </Typography>
                      <Button variant="outlined" fullWidth>
                        Manage Users
                      </Button>
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <CardContent>
                      <AnalyticsIcon color="info" sx={{ mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        {t('auth:admin.analytics', 'Analytics')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t('auth:admin.analyticsDescription', 'View usage analytics and reports')}
                      </Typography>
                      <Button variant="outlined" fullWidth>
                        View Analytics
                      </Button>
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <CardContent>
                      <SecurityIcon color="warning" sx={{ mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        {t('auth:admin.security', 'Security')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t('auth:admin.securityDescription', 'Security settings and audit logs')}
                      </Typography>
                      <Button variant="outlined" fullWidth>
                        Security Settings
                      </Button>
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <CardContent>
                      <DatabaseIcon color="secondary" sx={{ mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        System Settings
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Configure system settings and preferences
                      </Typography>
                      <Button variant="outlined" fullWidth>
                        System Config
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Recent Activity */}
          <Box sx={{ flex: { md: 1 } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <List dense>
                  {mockRecentActivity.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem>
                        <ListItemIcon>
                          <NotificationsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.action}
                          secondary={
                            <>
                              <Typography variant="caption" display="block">
                                {activity.user}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.time}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < mockRecentActivity.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
              <CardActions>
                <Button size="small">View All Activity</Button>
              </CardActions>
            </Card>
          </Box>
        </Box>

        {/* Access Control Notice */}
        {user?.role !== UserRole.SUPER_ADMIN && (
          <Box sx={{ mt: 4 }}>
            <Alert severity="warning" icon={<WarningIcon />}>
              <Typography variant="body2">
                <strong>Limited Access:</strong> Some administrative functions may be restricted based on your role ({user?.role}). 
                Contact your system administrator if you need additional permissions.
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Coming Soon Notice */}
        <Box sx={{ mt: 4 }}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Note:</strong> This administration dashboard shows mock data for demonstration. 
              Full administrative features and real-time monitoring will be available in future updates.
            </Typography>
          </Alert>
        </Box>
      </Container>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
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
});

export default withAdminAuth(AdminPage);