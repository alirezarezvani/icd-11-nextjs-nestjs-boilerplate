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

export function withAuth<P extends {} = {}>(
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
        <WrappedComponent {...(props as P)} />
      </ProtectedRoute>
    );
  };

  // Preserve static methods and displayName
  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  // Copy static properties with proper typing
  if ('getInitialProps' in WrappedComponent && WrappedComponent.getInitialProps) {
    WithAuthComponent.getInitialProps = WrappedComponent.getInitialProps;
  }

  if ('getServerSideProps' in WrappedComponent && WrappedComponent.getServerSideProps) {
    (WithAuthComponent as any).getServerSideProps = WrappedComponent.getServerSideProps;
  }

  if ('getStaticProps' in WrappedComponent && WrappedComponent.getStaticProps) {
    (WithAuthComponent as any).getStaticProps = WrappedComponent.getStaticProps;
  }

  return WithAuthComponent;
}

// Convenience HOCs for common use cases
export const withRequiredAuth = <P extends {} = {}>(Component: NextPage<P> | React.ComponentType<P>) =>
  withAuth(Component, { requireAuth: true });

export const withOptionalAuth = <P extends {} = {}>(Component: NextPage<P> | React.ComponentType<P>) =>
  withAuth(Component, { requireAuth: false });

export const withAdminAuth = <P extends {} = {}>(Component: NextPage<P> | React.ComponentType<P>) =>
  withAuth(Component, {
    requireAuth: true,
    allowedRoles: [UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN],
  });

export const withHealthcareAuth = <P extends {} = {}>(Component: NextPage<P> | React.ComponentType<P>) =>
  withAuth(Component, {
    requireAuth: true,
    allowedRoles: [
      UserRole.HEALTHCARE_PROVIDER,
      UserRole.ORG_ADMIN,
      UserRole.SUPER_ADMIN,
    ],
  });

export const withSuperAdminAuth = <P extends {} = {}>(Component: NextPage<P> | React.ComponentType<P>) =>
  withAuth(Component, {
    requireAuth: true,
    allowedRoles: [UserRole.SUPER_ADMIN],
  });

export default withAuth;