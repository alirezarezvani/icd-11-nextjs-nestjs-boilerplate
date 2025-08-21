import React from 'react';
import { useRouter } from 'next/router';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import { ICD11Entity, ICD11BreadcrumbItem } from '@shared/types/icd11';
import { useLanguage } from '../../context/LanguageContext';

interface BreadcrumbProps {
  currentEntity?: ICD11Entity;
  ancestors?: ICD11Entity[];
  breadcrumbs?: ICD11BreadcrumbItem[];
  loading?: boolean;
  showHome?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  currentEntity,
  ancestors = [],
  breadcrumbs,
  loading = false,
  showHome = true,
}) => {
  const router = useRouter();
  const { isRTL } = useLanguage();

  const handleNavigate = (entityId: string) => {
    router.push(`/entity/${Buffer.from(entityId).toString('base64').replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' }[m]!))}`);
  };

  const handleHomeClick = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <Box sx={{ py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Loading navigation...
        </Typography>
      </Box>
    );
  }

  // Use breadcrumbs if provided, otherwise fall back to ancestors + current entity
  const navigationItems = breadcrumbs || [
    ...ancestors.map((ancestor, index) => ({
      id: ancestor.id,
      title: ancestor.title,
      level: index,
    })),
    ...(currentEntity ? [{
      id: currentEntity.id,
      title: currentEntity.title,
      level: ancestors.length,
    }] : []),
  ];

  const breadcrumbItems = [
    // Home item
    ...(showHome ? [
      <Link
        key="home"
        component="button"
        variant="body2"
        onClick={handleHomeClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          textDecoration: 'none',
          color: 'primary.main',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        <HomeIcon fontSize="small" />
        Home
      </Link>
    ] : []),
    
    // Navigation items (excluding the last one which will be current)
    ...navigationItems.slice(0, -1).map((item) => (
      <Link
        key={item.id}
        component="button"
        variant="body2"
        onClick={() => handleNavigate(item.id)}
        sx={{
          textDecoration: 'none',
          color: 'primary.main',
          '&:hover': {
            textDecoration: 'underline',
          },
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={item.title || 'Untitled'}
      >
        {item.title || 'Untitled'}
      </Link>
    )),
    
    // Current item (last item)
    ...(navigationItems.length > 0 ? [
      <Typography
        key={navigationItems[navigationItems.length - 1].id}
        variant="body2"
        color="text.primary"
        sx={{ 
          fontWeight: 'medium',
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={navigationItems[navigationItems.length - 1].title || 'Untitled'}
      >
        {navigationItems[navigationItems.length - 1].title || 'Untitled'}
      </Typography>
    ] : [])
  ];

  return (
    <Box sx={{ py: 1, mb: 2 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon 
          fontSize="small" 
          sx={{ 
            transform: isRTL ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease-in-out',
          }} 
        />}
        aria-label="breadcrumb"
        sx={{
          direction: isRTL ? 'rtl' : 'ltr',
          '& .MuiBreadcrumbs-ol': {
            flexWrap: 'wrap',
          },
        }}
      >
        {breadcrumbItems}
      </Breadcrumbs>
    </Box>
  );
};

export default Breadcrumb;