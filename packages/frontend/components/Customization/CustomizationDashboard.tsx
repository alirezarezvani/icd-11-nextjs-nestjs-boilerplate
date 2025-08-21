import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useOrganization, useBranding } from '../../context/OrganizationContext';
import { BrandingConfigurator } from './BrandingConfigurator';
import { LogoUploader } from './LogoUploader';
import { AdvancedSettings } from './AdvancedSettings';
import { PreviewPanel } from './PreviewPanel';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customization-tabpanel-${index}`}
      aria-labelledby={`customization-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `customization-tab-${index}`,
    'aria-controls': `customization-tabpanel-${index}`,
  };
}

export function CustomizationDashboard() {
  const [currentTab, setCurrentTab] = useState(0);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const { organization, isLoading, error, canCustomizeBranding } = useOrganization();
  const { branding, canCustomize } = useBranding();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="text" width="300px" height={40} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" width="100%" height={600} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!canCustomize) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Custom branding is not available for your current plan. 
          Please upgrade to Professional or Enterprise to access customization features.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Brand Customization
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize the appearance and branding of your {organization?.name} platform
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 200px)' }}>
        {/* Configuration Panel */}
        <Paper 
          sx={{ 
            flex: '0 0 60%', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="customization tabs"
            >
              <Tab 
                icon={<PaletteIcon />} 
                label="Colors & Typography" 
                {...a11yProps(0)} 
              />
              <Tab 
                icon={<ImageIcon />} 
                label="Logo & Assets" 
                {...a11yProps(1)} 
              />
              <Tab 
                icon={<SettingsIcon />} 
                label="Layout & Spacing" 
                {...a11yProps(2)} 
              />
              <Tab 
                icon={<CodeIcon />} 
                label="Advanced" 
                {...a11yProps(3)} 
              />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <TabPanel value={currentTab} index={0}>
              <BrandingConfigurator />
            </TabPanel>
            <TabPanel value={currentTab} index={1}>
              <LogoUploader />
            </TabPanel>
            <TabPanel value={currentTab} index={2}>
              <AdvancedSettings type="layout" />
            </TabPanel>
            <TabPanel value={currentTab} index={3}>
              <AdvancedSettings type="css" />
            </TabPanel>
          </Box>
        </Paper>

        {/* Preview Panel */}
        <Box sx={{ flex: '0 0 38%' }}>
          <PreviewPanel 
            mode={previewMode}
            onModeChange={setPreviewMode}
          />
        </Box>
      </Box>
    </Container>
  );
}