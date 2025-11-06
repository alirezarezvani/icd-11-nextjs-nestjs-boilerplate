/**
 * Main Layout component with authentication awareness
 * Extends the base Layout with authentication features
 */

import React, { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Layout } from './Layout';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  title,
  description,
  requireAuth = false,
  allowedRoles = [],
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // For now, just use the regular Layout
  // The authentication logic is handled by ProtectedRoute components
  // This MainLayout can be extended later with user-specific features
  
  return (
    <Layout title={title} description={description}>
      {children}
    </Layout>
  );
};

export default MainLayout;