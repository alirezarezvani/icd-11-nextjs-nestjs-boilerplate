import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useOrganization } from '../../../context/OrganizationContext';
import { Container, Typography, Alert, Skeleton, Chip, Box } from '@mui/material';

interface CustomDomainHomeProps {
  hostname: string;
}

export default function CustomDomainHome({ hostname }: CustomDomainHomeProps) {
  const { organization, isLoading, error } = useOrganization();

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width="60%" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="40%" height={30} sx={{ mb: 4 }} />
        <Skeleton variant="rectangular" width="100%" height={200} />
      </Container>
    );
  }

  if (error || !organization) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          This domain is not configured for any healthcare organization. 
          Please contact your system administrator.
        </Alert>
      </Container>
    );
  }

  const pageTitle = organization.name;
  const pageDescription = organization.description || `Healthcare platform for ${organization.name}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {organization.branding?.[0]?.faviconUrl && (
          <link rel="icon" href={organization.branding[0].faviconUrl} />
        )}
      </Head>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Typography variant="h3" component="h1">
            {organization.name}
          </Typography>
          {organization.features.customDomain && (
            <Chip 
              label="Custom Domain" 
              color="primary" 
              size="small" 
              variant="outlined" 
            />
          )}
        </Box>
        
        {organization.description && (
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {organization.description}
          </Typography>
        )}

        <Typography variant="body1" sx={{ mt: 4 }}>
          Welcome to your dedicated healthcare platform. This white-label solution is 
          powered by the ICD-11 medical coding system and provides comprehensive 
          healthcare management tools.
        </Typography>

        {organization.features.whiteLabel && (
          <Alert severity="success" sx={{ mt: 3 }}>
            This is a white-label deployment with full branding customization.
          </Alert>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Platform Features
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {Object.entries(organization.features)
              .filter(([, enabled]) => enabled)
              .map(([feature, enabled]) => (
                <Chip
                  key={feature}
                  label={formatFeatureName(feature)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
          </Box>
        </Box>
      </Container>
    </>
  );
}

function formatFeatureName(feature: string): string {
  return feature
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

export const getServerSideProps: GetServerSideProps<CustomDomainHomeProps> = async (context) => {
  const { hostname } = context.params!;
  const hostnameStr = Array.isArray(hostname) ? hostname[0] : hostname;

  return {
    props: {
      hostname: hostnameStr,
    },
  };
};