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
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  AccountCircle as AccountIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { withRequiredAuth } from '../components/Auth/withAuth';
import Layout from '../components/Layout';

const SettingsPage: NextPage = () => {
  const { t } = useTranslation(['common', 'auth']);
  const { user } = useAuth();

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            <SettingsIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            {t('common:navigation.settings', 'Settings')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account preferences and application settings
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Account Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <AccountIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Account Settings
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Email Address"
                      secondary={user?.email}
                    />
                    <ListItemSecondaryAction>
                      <Button size="small" variant="outlined">
                        Change
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Password"
                      secondary="Last changed 30 days ago"
                    />
                    <ListItemSecondaryAction>
                      <Button size="small" variant="outlined">
                        Change
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Professional Role"
                      secondary={user?.role}
                    />
                    <ListItemSecondaryAction>
                      <Button size="small" variant="outlined">
                        Update
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Security & Privacy
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Two-Factor Authentication"
                      secondary="Add an extra layer of security"
                    />
                    <ListItemSecondaryAction>
                      <Switch />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Login Notifications"
                      secondary="Get notified of new logins"
                    />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Active Sessions"
                      secondary="Manage your active sessions"
                    />
                    <ListItemSecondaryAction>
                      <Button size="small" variant="outlined">
                        Manage
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Notifications
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Email Notifications"
                      secondary="Receive updates via email"
                    />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Search Updates"
                      secondary="New features and improvements"
                    />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Security Alerts"
                      secondary="Important security notifications"
                    />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked disabled />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Appearance Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <PaletteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Appearance
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Theme"
                      secondary="Choose your preferred theme"
                    />
                    <ListItemSecondaryAction>
                      <Button size="small" variant="outlined">
                        Light
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Language"
                      secondary="Interface language"
                    />
                    <ListItemSecondaryAction>
                      <Button size="small" variant="outlined">
                        English
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Compact Mode"
                      secondary="Show more content on screen"
                    />
                    <ListItemSecondaryAction>
                      <Switch />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Coming Soon Notice */}
        <Box sx={{ mt: 4 }}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Note:</strong> This settings page is currently in development. 
              Advanced features and functionality will be available in future updates.
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

export default withRequiredAuth(SettingsPage);