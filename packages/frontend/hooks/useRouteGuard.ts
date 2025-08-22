/**
 * Route Guard Hook for ICD-11 Healthcare Platform
 * Provides programmatic route protection and navigation guards
 */

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './useAuth';
import { UserRole } from '../services/auth/auth.types';

interface UseRouteGuardOptions {
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  onUnauthorized?: () => void;
  onForbidden?: () => void;
}

export function useRouteGuard(options: UseRouteGuardOptions = {}) {
  const {
    requireAuth = true,
    allowedRoles = [],
    redirectTo,
    onUnauthorized,
    onForbidden,
  } = options;

  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasRole, hasAnyRole } = useAuth();

  const checkAccess = useCallback(() => {
    if (isLoading) return { allowed: true, reason: 'loading' };

    // If authentication is not required, allow access
    if (!requireAuth) {
      return { allowed: true, reason: 'no-auth-required' };
    }

    // If user is not authenticated
    if (!isAuthenticated) {
      return { allowed: false, reason: 'not-authenticated' };
    }

    // If specific roles are required, check authorization
    if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
      return { allowed: false, reason: 'insufficient-role' };
    }

    return { allowed: true, reason: 'authorized' };
  }, [isLoading, requireAuth, isAuthenticated, allowedRoles, hasAnyRole]);

  const redirectToLogin = useCallback(() => {
    const returnUrl = router.asPath;
    const loginUrl = redirectTo || `/auth/login?redirect=${encodeURIComponent(returnUrl)}`;
    router.push(loginUrl);
  }, [router, redirectTo]);

  const redirectToUnauthorized = useCallback(() => {
    router.push('/auth/unauthorized');
  }, [router]);

  useEffect(() => {
    const access = checkAccess();
    
    if (!access.allowed) {
      if (access.reason === 'not-authenticated') {
        if (onUnauthorized) {
          onUnauthorized();
        } else {
          redirectToLogin();
        }
      } else if (access.reason === 'insufficient-role') {
        if (onForbidden) {
          onForbidden();
        } else {
          redirectToUnauthorized();
        }
      }
    }
  }, [
    checkAccess,
    onUnauthorized,
    onForbidden,
    redirectToLogin,
    redirectToUnauthorized,
  ]);

  return {
    isAllowed: checkAccess().allowed,
    isLoading,
    user,
    checkAccess,
    redirectToLogin,
    redirectToUnauthorized,
  };
}

// Convenience hooks for common use cases
export function useRequireAuth(redirectTo?: string) {
  return useRouteGuard({
    requireAuth: true,
    redirectTo,
  });
}

export function useRequireRole(roles: UserRole[], redirectTo?: string) {
  return useRouteGuard({
    requireAuth: true,
    allowedRoles: roles,
    redirectTo,
  });
}

export function useRequireAdmin(redirectTo?: string) {
  return useRouteGuard({
    requireAuth: true,
    allowedRoles: [UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN],
    redirectTo,
  });
}

export function useRequireHealthcare(redirectTo?: string) {
  return useRouteGuard({
    requireAuth: true,
    allowedRoles: [
      UserRole.HEALTHCARE_PROVIDER,
      UserRole.ORG_ADMIN,
      UserRole.SUPER_ADMIN,
    ],
    redirectTo,
  });
}

export function useRequireSuperAdmin(redirectTo?: string) {
  return useRouteGuard({
    requireAuth: true,
    allowedRoles: [UserRole.SUPER_ADMIN],
    redirectTo,
  });
}

export default useRouteGuard;