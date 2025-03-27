import { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Button, 
  IconButton, 
  useMediaQuery, 
  useTheme, 
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useState } from 'react';
import config from '../config';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ 
  children, 
  title = config.app.name,
  description = 'Search WHO ICD-11 medical codes',
}: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const navItems = [
    { title: 'Search', href: '/', icon: <SearchIcon fontSize="small" /> },
    { title: 'About', href: '/about', icon: <InfoIcon fontSize="small" /> },
  ];

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              {config.app.name}
            </Link>
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex' }}>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} passHref>
                  <Button 
                    color="inherit" 
                    startIcon={item.icon}
                    sx={{ ml: 1 }}
                  >
                    {item.title}
                  </Button>
                </Link>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      {isMobile && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer}
        >
          <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer}
          >
            <List>
              <ListItem>
                <Typography variant="h6" color="primary">
                  {config.app.name}
                </Typography>
              </ListItem>
              <Divider />
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <ListItem button>
                    <Box sx={{ mr: 2 }}>{item.icon}</Box>
                    <ListItemText primary={item.title} />
                  </ListItem>
                </Link>
              ))}
            </List>
          </Box>
        </Drawer>
      )}
      
      <main>
        {children}
      </main>
      
      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', mt: 'auto' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} {config.app.name} | 
            <Link href="/about" style={{ marginLeft: '8px', textDecoration: 'none', color: 'inherit' }}>
              About
            </Link>
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Data sourced from the WHO ICD-11 API
          </Typography>
        </Container>
      </Box>
    </>
  );
} 