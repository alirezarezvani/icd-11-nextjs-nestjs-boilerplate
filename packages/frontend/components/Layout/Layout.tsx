import React, { ReactNode, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
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
  const { isRTL } = useLanguage();
  
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems: NavItem[] = [
    { title: 'Home', href: '/', icon: <HomeIcon /> },
    { title: 'Search', href: '/search', icon: <SearchIcon /> },
    { title: 'Customization', href: '/customization', icon: <SettingsIcon /> },
    { title: 'Integration Test', href: '/integration-test', icon: <TestIcon /> },
    { title: 'About', href: '/about', icon: <InfoIcon /> },
  ];

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
    <Box sx={{ width: 250, pt: 2 }}>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton 
              onClick={() => handleNavigation(item.href)}
              selected={isCurrentPath(item.href)}
              sx={{
                borderRadius: 1,
                mx: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: isCurrentPath(item.href) ? 'inherit' : 'text.primary',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <html dir={isRTL ? 'rtl' : 'ltr'} />
      </Head>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* App Bar */}
        <AppBar position="static" elevation={1}>
          <Toolbar>
            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
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
                '&:hover': {
                  opacity: 0.8,
                },
              }}
              onClick={() => handleNavigation('/')}
            >
              {config.app.name}
            </Typography>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                {navItems.map((item) => (
                  <IconButton
                    key={item.href}
                    color="inherit"
                    onClick={() => handleNavigation(item.href)}
                    sx={{
                      borderRadius: 1,
                      px: 2,
                      backgroundColor: isCurrentPath(item.href) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  >
                    {item.icon}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {item.title}
                    </Typography>
                  </IconButton>
                ))}
              </Box>
            )}
            
            {/* Language Selector */}
            <Box sx={{ ml: 1 }}>
              <LanguageSelector 
                variant="standard" 
                size="small" 
                showLabel={false} 
                showIcon={!isMobile}
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
            py: 3,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                © {new Date().getFullYear()} {config.app.name} |
                <Typography 
                  component="span" 
                  variant="body2" 
                  color="primary"
                  sx={{ 
                    ml: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                  onClick={() => handleNavigation('/about')}
                >
                  About
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Data sourced from the WHO ICD-11 API
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default Layout;