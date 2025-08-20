import React from 'react';
import { useRouter } from 'next/router';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import { ICD11Entity } from '@shared/types/icd11';

interface BreadcrumbProps {
  currentEntity?: ICD11Entity;
  ancestors?: ICD11Entity[];
  loading?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  currentEntity,
  ancestors = [],
  loading = false
}) => {
  const router = useRouter();

  const handleNavigate = (entityId: string) => {
    router.push(`/entity/${encodeURIComponent(entityId)}`);
  };

  const handleHomeClick = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <Box sx={{ py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Loading breadcrumb...
        </Typography>
      </Box>
    );
  }

  const breadcrumbItems = [
    // Home item
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
    </Link>,
    
    // Ancestor items
    ...ancestors.map((ancestor) => (
      <Link
        key={ancestor.id}
        component="button"
        variant="body2"
        onClick={() => handleNavigate(ancestor.id)}
        sx={{
          textDecoration: 'none',
          color: 'primary.main',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        {ancestor.title || 'Untitled'}
      </Link>
    )),
    
    // Current entity item
    ...(currentEntity ? [
      <Typography
        key={currentEntity.id}
        variant="body2"
        color="text.primary"
        sx={{ fontWeight: 'medium' }}
      >
        {currentEntity.title || 'Untitled'}
      </Typography>
    ] : [])
  ];

  return (
    <Box sx={{ py: 1, mb: 2 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {breadcrumbItems}
      </Breadcrumbs>
    </Box>
  );
};

export default Breadcrumb;