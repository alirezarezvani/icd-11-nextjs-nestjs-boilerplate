/**
 * Authentication types and interfaces for the ICD-11 Healthcare Platform
 * Matches backend DTOs for type safety
 */

export enum UserRole {
  USER = 'user',
  HEALTHCARE_PROVIDER = 'healthcare_provider',
  ORG_ADMIN = 'org_admin',
  SUPER_ADMIN = 'super_admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  organizationId?: string;
  licenseNumber?: string;
  specialization?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  organizationId?: string;
  licenseNumber?: string;
  specialization?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  
  // Utilities
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isEmailVerified: () => boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}

// Form validation types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId?: string;
  licenseNumber?: string;
  specialization?: string;
  acceptTerms: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  statusCode: number;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  path: string;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
}

// Professional roles for healthcare
export const HEALTHCARE_ROLES = [
  { value: UserRole.USER, label: 'General User', icon: '👤' },
  { value: UserRole.HEALTHCARE_PROVIDER, label: 'Healthcare Provider', icon: '👨‍⚕️' },
  { value: 'physician', label: 'Physician', icon: '👨‍⚕️' },
  { value: 'nurse', label: 'Nurse', icon: '👩‍⚕️' },
  { value: 'researcher', label: 'Medical Researcher', icon: '🔬' },
  { value: 'medical_coder', label: 'Medical Coder', icon: '💻' },
  { value: 'administrator', label: 'Healthcare Administrator', icon: '📋' },
  { value: 'student', label: 'Medical Student', icon: '🎓' },
  { value: 'other', label: 'Other Healthcare Professional', icon: '🏥' },
] as const;

export type HealthcareRole = typeof HEALTHCARE_ROLES[number]['value'];