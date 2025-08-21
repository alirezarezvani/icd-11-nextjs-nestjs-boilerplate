import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Laptop as DesktopIcon,
  Tablet as TabletIcon,
  Phone as MobileIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useBranding } from '../../context/OrganizationContext';

interface PreviewPanelProps {
  mode: 'desktop' | 'tablet' | 'mobile';
  onModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}

export function PreviewPanel({ mode, onModeChange }: PreviewPanelProps) {
  const { branding } = useBranding();
  const [previewBranding, setPreviewBranding] = useState(branding);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Listen for branding updates from the configurator
  useEffect(() => {
    const handleBrandingUpdate = (event: CustomEvent) => {
      setPreviewBranding(event.detail);
    };

    window.addEventListener('brandingUpdated', handleBrandingUpdate as EventListener);
    return () => {
      window.removeEventListener('brandingUpdated', handleBrandingUpdate as EventListener);
    };
  }, []);

  // Reset to current branding when it changes
  useEffect(() => {
    setPreviewBranding(branding);
  }, [branding]);

  const getPreviewDimensions = () => {
    switch (mode) {
      case 'desktop':
        return { width: '100%', height: '100%' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      case 'mobile':
        return { width: '375px', height: '667px' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const dimensions = getPreviewDimensions();
  const isMobile = mode === 'mobile';
  const sidebarWidth = isMobile ? 0 : parseInt(previewBranding.layout.sidebarWidth);

  const menuItems = [
    { icon: <HomeIcon />, text: 'Dashboard', active: true },
    { icon: <SearchIcon />, text: 'ICD-11 Search', active: false },
    { icon: <HospitalIcon />, text: 'Medical Records', active: false },
    { icon: <PersonIcon />, text: 'Patients', active: false },
    { icon: <SettingsIcon />, text: 'Settings', active: false },
  ];

  const PreviewContent = () => (
    <Box
      sx={{
        width: dimensions.width,
        height: dimensions.height,
        maxWidth: '100%',
        maxHeight: '100%',
        backgroundColor: previewBranding.colorScheme.background,
        color: previewBranding.colorScheme.text,
        fontFamily: previewBranding.typography.fontFamily,
        fontSize: previewBranding.typography.fontSize.base,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      {/* App Bar */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: previewBranding.colorScheme.primary,
          height: previewBranding.layout.headerHeight,
          zIndex: 1200,
        }}
        elevation={0}
      >
        <Toolbar sx={{ minHeight: previewBranding.layout.headerHeight }}>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {previewBranding.logoUrl && (
              <img
                src={previewBranding.logoUrl}
                alt="Logo"
                style={{
                  height: '40px',
                  marginRight: '16px',
                  objectFit: 'contain',
                }}
              />
            )}
            <Typography
              variant="h6"
              sx={{
                fontWeight: previewBranding.typography.fontWeight.semibold,
                fontSize: previewBranding.typography.fontSize.lg,
              }}
            >
              Healthcare Platform
            </Typography>
          </Box>

          {/* Search */}
          {!isMobile && (
            <Box sx={{ maxWidth: 400, flex: 1 }}>
              <TextField
                size="small"
                placeholder="Search ICD-11 codes..."
                variant="outlined"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    '& input': {
                      color: 'white',
                    },
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                  },
                }}
              />
            </Box>
          )}

          <Box sx={{ ml: 2 }}>
            <Button color="inherit" size="small">
              Profile
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', height: `calc(100% - ${previewBranding.layout.headerHeight})` }}>
        {/* Sidebar - Desktop and Tablet */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              width: sidebarWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: sidebarWidth,
                boxSizing: 'border-box',
                backgroundColor: previewBranding.colorScheme.surface,
                borderRight: `1px solid ${previewBranding.colorScheme.text}20`,
                position: 'relative',
                top: 'unset',
                height: '100%',
              },
            }}
          >
            <List sx={{ p: 1 }}>
              {menuItems.map((item, index) => (
                <ListItem
                  key={index}
                  component="button"
                  sx={{
                    borderRadius: previewBranding.layout.borderRadius,
                    mb: 0.5,
                    backgroundColor: item.active ? `${previewBranding.colorScheme.primary}20` : 'transparent',
                    color: item.active ? previewBranding.colorScheme.primary : previewBranding.colorScheme.text,
                    '&:hover': {
                      backgroundColor: `${previewBranding.colorScheme.primary}10`,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: item.active ? previewBranding.colorScheme.primary : previewBranding.colorScheme.textSecondary,
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: previewBranding.typography.fontSize.sm,
                      fontWeight: item.active ? previewBranding.typography.fontWeight.medium : previewBranding.typography.fontWeight.normal,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Drawer>
        )}

        {/* Mobile Menu */}
        {isMobile && (
          <Drawer
            anchor="left"
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': {
                width: 280,
                backgroundColor: previewBranding.colorScheme.surface,
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: previewBranding.typography.fontWeight.semibold,
                  color: previewBranding.colorScheme.text,
                }}
              >
                Menu
              </Typography>
              <List>
                {menuItems.map((item, index) => (
                  <ListItem
                    key={index}
                    component="button"
                    onClick={() => setMobileMenuOpen(false)}
                    sx={{
                      borderRadius: previewBranding.layout.borderRadius,
                      mb: 0.5,
                      backgroundColor: item.active ? `${previewBranding.colorScheme.primary}20` : 'transparent',
                      color: item.active ? previewBranding.colorScheme.primary : previewBranding.colorScheme.text,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: item.active ? previewBranding.colorScheme.primary : previewBranding.colorScheme.textSecondary,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>
        )}

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            p: 2,
            backgroundColor: previewBranding.colorScheme.background,
            overflow: 'auto',
          }}
        >
          {/* Page Header */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                fontSize: previewBranding.typography.fontSize['2xl'],
                fontWeight: previewBranding.typography.fontWeight.bold,
                color: previewBranding.colorScheme.text,
                mb: 1,
              }}
            >
              Dashboard
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: previewBranding.colorScheme.textSecondary,
                fontSize: previewBranding.typography.fontSize.base,
              }}
            >
              Welcome to your healthcare platform
            </Typography>
          </Box>

          {/* Sample Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 3 }}>
            {[
              { title: 'Active Patients', value: '1,234', color: previewBranding.colorScheme.info },
              { title: 'ICD-11 Searches', value: '5,678', color: previewBranding.colorScheme.success },
              { title: 'Appointments', value: '234', color: previewBranding.colorScheme.warning },
              { title: 'Medical Records', value: '9,876', color: previewBranding.colorScheme.error },
            ].map((stat, index) => (
              <Card
                key={index}
                sx={{
                  backgroundColor: previewBranding.colorScheme.surface,
                  borderRadius: previewBranding.layout.borderRadius,
                  boxShadow: previewBranding.layout.shadows.md,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: previewBranding.typography.fontSize.lg,
                      fontWeight: previewBranding.typography.fontWeight.semibold,
                      color: stat.color,
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: previewBranding.colorScheme.textSecondary,
                      fontSize: previewBranding.typography.fontSize.sm,
                    }}
                  >
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Sample Content */}
          <Card
            sx={{
              backgroundColor: previewBranding.colorScheme.surface,
              borderRadius: previewBranding.layout.borderRadius,
              boxShadow: previewBranding.layout.shadows.md,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: previewBranding.typography.fontSize.lg,
                    fontWeight: previewBranding.typography.fontWeight.medium,
                    color: previewBranding.colorScheme.text,
                  }}
                >
                  Recent ICD-11 Searches
                </Typography>
                <Chip
                  label="Live Preview"
                  size="small"
                  sx={{
                    backgroundColor: previewBranding.colorScheme.accent,
                    color: 'white',
                    fontSize: previewBranding.typography.fontSize.xs,
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  'Essential hypertension',
                  'Type 2 diabetes mellitus',
                  'Acute myocardial infarction',
                ].map((search, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      backgroundColor: previewBranding.colorScheme.background,
                      borderRadius: previewBranding.layout.borderRadius,
                      border: `1px solid ${previewBranding.colorScheme.text}10`,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: previewBranding.colorScheme.text,
                        fontSize: previewBranding.typography.fontSize.base,
                      }}
                    >
                      {search}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: previewBranding.colorScheme.textSecondary,
                        fontSize: previewBranding.typography.fontSize.xs,
                      }}
                    >
                      Searched 2 hours ago
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Paper
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Preview Controls */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">Live Preview</Typography>
        
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, newMode) => newMode && onModeChange(newMode)}
          size="small"
        >
          <ToggleButton value="desktop" aria-label="desktop">
            <DesktopIcon />
          </ToggleButton>
          <ToggleButton value="tablet" aria-label="tablet">
            <TabletIcon />
          </ToggleButton>
          <ToggleButton value="mobile" aria-label="mobile">
            <MobileIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Preview Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: mode === 'desktop' ? 'flex-start' : 'center',
          p: mode === 'desktop' ? 0 : 2,
          overflow: 'auto',
          backgroundColor: 'grey.100',
        }}
      >
        <PreviewContent />
      </Box>
    </Paper>
  );
}