import React from 'react';
import Head from 'next/head';
import { Layout } from '../components/Layout/Layout';
import { CustomizationDashboard } from '../components/Customization';

export default function CustomizationPage() {
  return (
    <Layout title="Brand Customization - ICD-11 Healthcare Platform" description="Customize the branding and appearance of your healthcare platform">
      <CustomizationDashboard />
    </Layout>
  );
}