/**
 * Authentication Context for ICD-11 Healthcare Platform
 * Provides authentication state and methods throughout the application
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../services/auth';
import { userStorage } from '../utils/storage';
import {
  User,
  UserRole,
  LoginDto,
  RegisterDto,
  AuthContextType,
  AuthState,
} from '../services/auth/auth.types';

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * Manages authentication state and provides auth methods to children
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize authentication state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication state
   * Check if user is already authenticated and load user data
   */
  const initializeAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check if we have a valid token
      if (authService.isAuthenticated()) {
        // Try to load user from storage first for faster initial load
        const storedUser = userStorage.getUser();
        
        if (storedUser) {
          setAuthState({
            user: storedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        }

        // Validate token and get fresh user data
        try {
          const user = await authService.getProfile();
          userStorage.setUser(user); // Update stored user data
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Token might be invalid, try to refresh
          try {
            await authService.refreshToken();
            const user = await authService.getProfile();
            userStorage.setUser(user);
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (refreshError) {
            // Refresh failed, clear storage and require login
            userStorage.clearUser();
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        }
      } else {
        // No valid tokens, clear any stale user data
        userStorage.clearUser();
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      userStorage.clearUser();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication error',
      });
    }
  };

  /**
   * Login user
   */
  const login = async (credentials: LoginDto): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const authResponse = await authService.login(credentials);
      
      setAuthState({
        user: authResponse.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  /**
   * Register new user
   */
  const register = async (data: RegisterDto): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const authResponse = await authService.register(data);
      
      setAuthState({
        user: authResponse.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  /**
   * Logout user (current session)
   */
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      userStorage.clearUser();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  /**
   * Logout all sessions
   */
  const logoutAll = async (): Promise<void> => {
    try {
      await authService.logoutAll();
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      userStorage.clearUser();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  /**
   * Refresh access token
   */
  const refreshToken = async (): Promise<void> => {
    try {
      await authService.refreshToken();
      // Optionally reload user data after refresh
      if (authState.isAuthenticated) {
        const user = await authService.getProfile();
        setAuthState(prev => ({ ...prev, user }));
      }
    } catch (error) {
      // Refresh failed, logout user
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expired',
      });
      throw error;
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      const updatedUser = await authService.updateProfile(data);
      userStorage.setUser(updatedUser);
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      throw error;
    }
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (role: UserRole): boolean => {
    return authState.user?.role === role;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return authState.user ? roles.includes(authState.user.role) : false;
  };

  /**
   * Check if user's email is verified
   */
  const isEmailVerified = (): boolean => {
    return authState.user?.isEmailVerified ?? false;
  };

  // Context value
  const contextValue: AuthContextType = {
    // State
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    
    // Actions
    login,
    register,
    logout,
    logoutAll,
    refreshToken,
    updateProfile,
    
    // Utilities
    hasRole,
    hasAnyRole,
    isEmailVerified,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use authentication context
 * Must be used within an AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * HOC to provide authentication context
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => (
    <AuthProvider>
      <Component {...props} />
    </AuthProvider>
  );
};

export default AuthContext;