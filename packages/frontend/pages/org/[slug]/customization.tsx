import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useOrganization } from '../../../context/OrganizationContext';
import { CustomizationDashboard } from '../../../components/Customization';
import { Container, Alert, Skeleton } from '@mui/material';

interface OrganizationCustomizationProps {
  organizationSlug: string;
  domain?: string;
}

export default function OrganizationCustomization({ organizationSlug, domain }: OrganizationCustomizationProps) {
  const { organization, isLoading, error, canCustomizeBranding } = useOrganization();

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="text" width="300px" height={40} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" width="100%" height={600} />
      </Container>
    );
  }

  if (error || !organization) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Organization not found'}
        </Alert>
      </Container>
    );
  }

  if (!canCustomizeBranding) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Custom branding is not available for your current plan ({organization.plan}). 
          Please upgrade to Professional or Enterprise to access customization features.
        </Alert>
      </Container>
    );
  }

  const pageTitle = `Brand Customization - ${organization.name}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={`Customize the branding and appearance of ${organization.name} healthcare platform`}
        />
        {organization.branding?.[0]?.faviconUrl && (
          <link rel="icon" href={organization.branding[0].faviconUrl} />
        )}
      </Head>
      
      <CustomizationDashboard />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<OrganizationCustomizationProps> = async (context) => {
  const { slug } = context.params!;
  const organizationSlug = Array.isArray(slug) ? slug[0] : slug;
  
  // Get organization domain from headers if available
  const domain = context.req.headers['x-organization-domain'] as string;

  return {
    props: {
      organizationSlug,
      domain,
    },
  };
};