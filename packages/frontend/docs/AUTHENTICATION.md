# Authentication System Documentation

## Overview

The ICD-11 Healthcare Platform includes a comprehensive authentication system that provides secure user registration, login, and session management for healthcare professionals. The system integrates seamlessly with the existing Material-UI design system and supports multiple languages with RTL layout support.

## Architecture

### Frontend Components

```
frontend/
├── context/AuthContext.tsx          # Authentication state management
├── services/auth/
│   ├── auth.service.ts              # API service layer
│   ├── auth.types.ts                # TypeScript interfaces
│   └── index.ts                     # Module exports
├── components/Auth/
│   ├── AuthModal.tsx                # Modal container for login/register
│   ├── LoginForm.tsx                # Login form component
│   ├── RegisterForm.tsx             # Registration form component
│   ├── UserMenu.tsx                 # Authenticated user menu
│   ├── AuthButtons.tsx              # Sign in/up buttons
│   ├── validation.ts                # Form validation schemas
│   └── index.ts                     # Component exports
├── guards/AuthGuard.tsx             # Route protection component
├── hooks/useAuth.ts                 # Authentication hook
└── public/locales/*/auth.json       # Internationalization files
```

### Backend Integration

The authentication system integrates with the backend APIs located at `/api/auth`:

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - Single session logout
- `POST /auth/logout-all` - All sessions logout
- `POST /auth/refresh` - Token refresh
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

## Key Features

### 1. User Registration
- Healthcare role selection (User, Healthcare Provider, Organization Admin)
- Professional information collection
- Password strength validation
- Terms and conditions acceptance
- Organization ID support for healthcare providers

### 2. User Login
- Email/password authentication
- "Remember me" functionality
- Account lockout protection
- Error handling and validation

### 3. Session Management
- JWT token-based authentication
- Automatic token refresh
- HttpOnly cookie support
- Secure token storage

### 4. User Interface
- Glass-morphism design consistent with application theme
- Responsive modal system (desktop) and full-screen (mobile)
- Real-time form validation
- Password strength indicators
- Loading states and error handling

### 5. Internationalization
- Support for 6 languages (en, es, fr, ar, zh, ru)
- Complete Arabic RTL support
- Professional healthcare terminology
- Contextual error messages

### 6. Security Features
- Client-side form validation
- Password complexity requirements
- Secure token handling
- Request/response interceptors
- CSRF protection ready

## Implementation Guide

### 1. Adding Authentication Context

The authentication context is already configured in `_app.tsx`:

```tsx
import { AuthProvider } from '../context/AuthContext';

function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <OrganizationProvider organizationSlug={organizationSlug} domain={domain}>
        <LanguageProvider>
          <CustomThemeProvider>
            <AccessibilityProvider>
              <AuthProvider>
                <ICD11Provider>
                  <Component {...pageProps} />
                </ICD11Provider>
              </AuthProvider>
            </AccessibilityProvider>
          </CustomThemeProvider>
        </LanguageProvider>
      </OrganizationProvider>
    </QueryClientProvider>
  );
}
```

### 2. Using Authentication in Components

```tsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.fullName}!</h1>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

### 3. Route Protection

Use the `AuthGuard` component to protect routes:

```tsx
import { AuthGuard } from '../guards/AuthGuard';
import { UserRole } from '../services/auth/auth.types';

function ProtectedPage() {
  return (
    <AuthGuard requireAuth={true} allowedRoles={[UserRole.HEALTHCARE_PROVIDER]}>
      <div>This content is only available to healthcare providers</div>
    </AuthGuard>
  );
}
```

### 4. Navigation Integration

Authentication buttons are automatically integrated into the navigation:

```tsx
// Desktop and mobile navigation automatically shows:
// - Sign In / Sign Up buttons (when not authenticated)
// - User menu with profile options (when authenticated)
```

## API Integration

### Authentication Service

The `authService` provides methods for all authentication operations:

```tsx
import { authService } from '../services/auth';

// Login
await authService.login({ email, password, rememberMe });

// Register
await authService.register({ 
  email, 
  password, 
  firstName, 
  lastName, 
  role, 
  organizationId 
});

// Logout
await authService.logout(); // Single session
await authService.logoutAll(); // All sessions

// Get profile
const user = await authService.getProfile();

// Check authentication status
const isAuth = authService.isAuthenticated();
```

### Automatic Token Management

The API client automatically handles:
- Attaching JWT tokens to requests
- Token refresh on expiration
- Logout on refresh failure
- Error handling for authentication failures

## User Roles

The system supports the following user roles:

- `USER` - General users with basic access
- `HEALTHCARE_PROVIDER` - Medical professionals with enhanced features
- `ORG_ADMIN` - Organization administrators
- `SUPER_ADMIN` - System administrators

## Form Validation

### Login Form
- Email format validation
- Required field validation
- Error handling for invalid credentials

### Registration Form
- Email format validation
- Password strength requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Name validation (letters, spaces, hyphens, apostrophes only)
- Password confirmation matching
- Terms acceptance validation

## Error Handling

The authentication system includes comprehensive error handling:

### Client-Side Errors
- Form validation errors
- Network connectivity issues
- Session expiration
- Invalid credentials

### Server-Side Errors
- Account lockout
- Email already exists
- Invalid refresh tokens
- Server unavailability

## Accessibility

The authentication system is fully accessible:
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- High contrast support
- Focus management
- ARIA labels and descriptions

## Security Considerations

### Token Storage
- Access tokens stored in both cookies and localStorage
- Preference for httpOnly cookies when supported
- Automatic token cleanup on logout

### Password Security
- Client-side password strength validation
- Server-side password hashing (handled by backend)
- Protection against common password attacks

### Session Security
- Automatic token refresh
- Session timeout handling
- Protection against CSRF attacks
- Secure cookie attributes in production

## Troubleshooting

### Common Issues

1. **Authentication context not available**
   - Ensure `AuthProvider` is properly configured in `_app.tsx`
   - Check that the component is within the provider tree

2. **Token refresh failures**
   - Verify backend refresh endpoint is working
   - Check cookie settings and CORS configuration
   - Ensure proper error handling in API interceptors

3. **Form validation not working**
   - Check form validation rules are properly configured
   - Verify translation keys exist for error messages
   - Ensure form state is properly managed

4. **Navigation not updating after authentication**
   - Check if authentication state is properly propagated
   - Verify navigation components are using `useAuth` hook
   - Ensure proper re-rendering on state changes

## Testing

### Authentication Flow Testing

1. **Registration Flow**
   - Valid registration with all required fields
   - Invalid email format handling
   - Password strength validation
   - Terms acceptance requirement
   - Role selection functionality

2. **Login Flow**
   - Valid credentials login
   - Invalid credentials handling
   - Remember me functionality
   - Account lockout protection

3. **Session Management**
   - Token refresh functionality
   - Logout single session
   - Logout all sessions
   - Session persistence

4. **Route Protection**
   - Protected routes redirect correctly
   - Role-based access control
   - Authentication status checking

## Future Enhancements

### Planned Features
- Password reset functionality
- Email verification system
- Two-factor authentication
- Social login integration
- Advanced session management
- Audit logging for authentication events

### Performance Optimizations
- Token caching strategies
- Background token refresh
- Authentication state persistence
- Optimistic UI updates

## Integration with Existing Features

The authentication system seamlessly integrates with:

### ICD-11 Search
- Enhanced search history for authenticated users
- Personalized search preferences
- Saved searches and bookmarks

### Internationalization
- Complete translation support
- RTL layout compatibility
- Cultural-specific authentication flows

### Theme System
- Glass-morphism design integration
- Dark/light mode support
- Responsive design patterns

### Accessibility Framework
- Screen reader announcements
- Keyboard navigation support
- Focus management
- High contrast mode compatibility

This authentication system provides a solid foundation for secure, scalable, and user-friendly authentication in the ICD-11 Healthcare Platform while maintaining consistency with the existing design system and architectural patterns.