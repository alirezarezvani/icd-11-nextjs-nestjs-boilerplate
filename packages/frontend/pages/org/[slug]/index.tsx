import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useOrganization } from '../../../context/OrganizationContext';
import { Container, Typography, Alert, Skeleton } from '@mui/material';
import { Layout } from '../../../components/Layout/Layout';

interface OrganizationHomeProps {
  organizationSlug: string;
  domain?: string;
}

export default function OrganizationHome({ organizationSlug, domain }: OrganizationHomeProps) {
  const router = useRouter();
  const { organization, isLoading, error } = useOrganization();

  if (isLoading) {
    return (
      <Layout title="Loading Organization...">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Skeleton variant="text" width="60%" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="40%" height={30} sx={{ mb: 4 }} />
          <Skeleton variant="rectangular" width="100%" height={200} />
        </Container>
      </Layout>
    );
  }

  if (error || !organization) {
    return (
      <Layout title="Organization Error">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Organization not found'}
          </Alert>
        </Container>
      </Layout>
    );
  }

  const pageTitle = `${organization.name} - ICD-11 Healthcare Platform`;
  const pageDescription = organization.description || `Healthcare platform for ${organization.name}`;

  return (
    <Layout title={pageTitle} description={pageDescription}>
      {organization.branding?.[0]?.faviconUrl && (
        <Head>
          <link rel="icon" href={organization.branding[0].faviconUrl} />
        </Head>
      )}
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to {organization.name}
        </Typography>
        
        {organization.description && (
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {organization.description}
          </Typography>
        )}

        <Typography variant="body1" sx={{ mt: 4 }}>
          This is a customized healthcare platform powered by ICD-11 medical coding system.
          The platform provides advanced medical code search, patient management, and healthcare
          data organization tools.
        </Typography>

        {organization.features.customBranding && (
          <Alert severity="info" sx={{ mt: 3 }}>
            This organization has custom branding enabled. 
            <strong> <a href="/customization">Customize your branding →</a></strong>
          </Alert>
        )}
      </Container>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<OrganizationHomeProps> = async (context) => {
  const { slug } = context.params!;
  const organizationSlug = Array.isArray(slug) ? slug[0] : slug;
  
  if (!organizationSlug) {
    return {
      notFound: true,
    };
  }
  
  // Get organization domain from headers if available
  const domain = context.req.headers['x-organization-domain'] as string || '';

  return {
    props: {
      organizationSlug,
      domain,
    },
  };
};