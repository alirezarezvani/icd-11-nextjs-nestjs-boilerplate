/**
 * Higher-Order Component for Authentication Protection
 * Provides a simple way to protect pages and components
 */

import React from 'react';
import { NextPage } from 'next';
import { UserRole } from '../../services/auth/auth.types';
import { ProtectedRoute } from './ProtectedRoute';

interface WithAuthOptions {
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  showAuthModal?: boolean;
  fallback?: React.ReactNode;
}

export function withAuth<P = {}>(
  WrappedComponent: NextPage<P> | React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    requireAuth = true,
    allowedRoles = [],
    redirectTo,
    showAuthModal = false,
    fallback,
  } = options;

  const WithAuthComponent: NextPage<P> = (props) => {
    return (
      <ProtectedRoute
        requireAuth={requireAuth}
        allowedRoles={allowedRoles}
        redirectTo={redirectTo}
        showAuthModal={showAuthModal}
        fallback={fallback}
      >
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };

  // Preserve static methods and displayName
  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  // Copy static properties
  if (WrappedComponent.getInitialProps) {
    WithAuthComponent.getInitialProps = WrappedComponent.getInitialProps;
  }

  if (WrappedComponent.getServerSideProps) {
    // @ts-ignore
    WithAuthComponent.getServerSideProps = WrappedComponent.getServerSideProps;
  }

  if (WrappedComponent.getStaticProps) {
    // @ts-ignore
    WithAuthComponent.getStaticProps = WrappedComponent.getStaticProps;
  }

  return WithAuthComponent;
}

// Convenience HOCs for common use cases
export const withRequiredAuth = <P = {}>(Component: NextPage<P> | React.ComponentType<P>) =>
  withAuth(Component, { requireAuth: true });

export const withOptionalAuth = <P = {}>(Component: NextPage<P> | React.ComponentType<P>) =>
  withAuth(Component, { requireAuth: false });

export const withAdminAuth = <P = {}>(Component: NextPage<P> | React.ComponentType<P>) =>
  withAuth(Component, {
    requireAuth: true,
    allowedRoles: [UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN],
  });

export const withHealthcareAuth = <P = {}>(Component: NextPage<P> | React.ComponentType<P>) =>
  withAuth(Component, {
    requireAuth: true,
    allowedRoles: [
      UserRole.HEALTHCARE_PROVIDER,
      UserRole.ORG_ADMIN,
      UserRole.SUPER_ADMIN,
    ],
  });

export const withSuperAdminAuth = <P = {}>(Component: NextPage<P> | React.ComponentType<P>) =>
  withAuth(Component, {
    requireAuth: true,
    allowedRoles: [UserRole.SUPER_ADMIN],
  });

export default withAuth;