import React, { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  BugReport as TestIcon,
} from '@mui/icons-material';
import { LanguageSelector } from '../LanguageSelector';
import { useLanguage } from '../../context/LanguageContext';
import config from '../../config';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = config.app.name,
  description = 'Search WHO ICD-11 medical codes',
}) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation('common');
  const { isRTL } = useLanguage();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatches by ensuring translations are loaded
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fallback navigation items for SSR to prevent hydration mismatches
  const fallbackNavItems: NavItem[] = [
    { title: 'Home', href: '/', icon: <HomeIcon /> },
    { title: 'Search', href: '/search', icon: <SearchIcon /> },
    { title: 'Customization', href: '/customization', icon: <SettingsIcon /> },
    { title: 'Integration Test', href: '/integration-test', icon: <TestIcon /> },
    { title: 'About', href: '/about', icon: <InfoIcon /> },
  ];

  // Use translated navigation items after hydration, fallback during SSR
  const navItems: NavItem[] = isMounted ? [
    { title: t('nav.home'), href: '/', icon: <HomeIcon /> },
    { title: t('nav.search'), href: '/search', icon: <SearchIcon /> },
    { title: t('nav.customization'), href: '/customization', icon: <SettingsIcon /> },
    { title: t('nav.integrationTest'), href: '/integration-test', icon: <TestIcon /> },
    { title: t('nav.about'), href: '/about', icon: <InfoIcon /> },
  ] : fallbackNavItems;

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setDrawerOpen(false);
  };

  const isCurrentPath = (href: string) => {
    return router.pathname === href || (href === '/' && router.pathname === '/search');
  };

  const drawerContent = (
    <Box sx={{ width: 280, pt: 3, pb: 2 }}>
      {/* Drawer Header */}
      <Box sx={{ px: 3, pb: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            color: '#0f4c75',
            fontSize: '1.1rem',
            letterSpacing: '-0.025em',
          }}
        >
          {config.app.name}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#64748b',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          {isMounted ? t('nav.subtitle') : 'Healthcare Code Search'}
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ pt: 2 }}>
        <List sx={{ px: 2 }}>
          {navItems.map((item) => (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                onClick={() => handleNavigation(item.href)}
                selected={isCurrentPath(item.href)}
                sx={{
                  borderRadius: '12px',
                  py: 1.5,
                  px: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(15, 76, 117, 0.1)',
                    color: '#0f4c75',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(15, 76, 117, 0.15)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(45, 55, 72, 0.06)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isCurrentPath(item.href) ? '#0f4c75' : '#64748b',
                    minWidth: 36,
                    fontSize: '20px',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title}
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: isCurrentPath(item.href) ? 600 : 500,
                      fontSize: '0.9rem',
                      letterSpacing: '0.025em',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Language Selector in Drawer */}
      <Box sx={{ px: 3, pt: 2, mt: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <Typography variant="caption" sx={{ color: '#64748b', mb: 2, display: 'block' }}>
          {isMounted ? t('nav.language') : 'Language'}
        </Typography>
        <LanguageSelector 
          variant="menu"
          size="small"
          showLabel={false}
        />
      </Box>
    </Box>
  );

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* App Bar */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            color: '#2d3748',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          }}
        >
          <Toolbar>
            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                edge="start"
                aria-label={isMounted ? t('nav.openMenu') : 'Open menu'}
                onClick={handleDrawerToggle}
                sx={{ 
                  mr: 2,
                  color: '#2d3748',
                  '&:hover': {
                    backgroundColor: 'rgba(45, 55, 72, 0.08)',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            {/* Logo/Title */}
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '1.25rem',
                color: '#0f4c75',
                letterSpacing: '-0.025em',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  color: '#3282b8',
                  transform: 'translateY(-1px)',
                },
              }}
              onClick={() => handleNavigation('/')}
            >
              {config.app.name}
            </Typography>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 3 }}>
                {navItems.map((item) => (
                  <IconButton
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    sx={{
                      borderRadius: '10px',
                      px: 2,
                      py: 1,
                      color: isCurrentPath(item.href) ? '#0f4c75' : '#64748b',
                      backgroundColor: isCurrentPath(item.href) 
                        ? 'rgba(15, 76, 117, 0.1)' 
                        : 'transparent',
                      fontWeight: isCurrentPath(item.href) ? 600 : 500,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: isCurrentPath(item.href)
                          ? 'rgba(15, 76, 117, 0.15)'
                          : 'rgba(45, 55, 72, 0.08)',
                        color: isCurrentPath(item.href) ? '#0f4c75' : '#2d3748',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                      },
                    }}
                  >
                    <Box sx={{ 
                      fontSize: '18px', 
                      display: 'flex', 
                      alignItems: 'center',
                      mr: 1,
                    }}>
                      {item.icon}
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 'inherit',
                        letterSpacing: '0.025em',
                      }}
                    >
                      {item.title}
                    </Typography>
                  </IconButton>
                ))}
              </Box>
            )}
            
            {/* Language Selector */}
            <Box sx={{ ml: 1 }}>
              <LanguageSelector 
                variant="compact" 
                size={isMobile ? 'small' : 'medium'} 
                showLabel={false} 
                showLanguageName={!isMobile}
              />
            </Box>
          </Toolbar>
        </AppBar>

        {/* Mobile Drawer */}
        <Drawer
          anchor={isRTL ? 'right' : 'left'}
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
          {children}
        </Box>
        
        {/* Footer */}
        <Box 
          component="footer" 
          sx={{ 
            mt: 'auto',
            py: 4,
            bgcolor: '#fafbfc',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64748b',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  mb: 0.5,
                }}
              >
                © {new Date().getFullYear()} {config.app.name} 
                <Typography 
                  component="span" 
                  sx={{ 
                    mx: 1,
                    color: '#cbd5e0',
                    fontWeight: 300,
                  }}
                >
                  •
                </Typography>
                <Typography 
                  component="span" 
                  sx={{ 
                    color: '#0f4c75',
                    cursor: 'pointer',
                    fontWeight: 600,
                    '&:hover': {
                      color: '#3282b8',
                      textDecoration: 'underline',
                    },
                  }}
                  onClick={() => handleNavigation('/about')}
                >
                  {isMounted ? t('nav.about') : 'About'}
                </Typography>
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#a0aec0',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                {isMounted ? t('footer.dataSource') : 'Data sourced from the WHO ICD-11 API'}
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default Layout;