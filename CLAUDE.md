# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a full-stack ICD-11 medical code search application with enterprise-grade authentication:
- **Frontend**: Next.js 13 with TypeScript, Material UI, React Context for state management, next-i18next for internationalization
- **Backend**: NestJS with TypeScript, JWT authentication, TypeORM, Redis caching, Swagger documentation
- **Authentication**: Complete JWT-based auth system with role-based access control (RBAC)
- **External API**: WHO ICD-11 API integration with OAuth2 authentication
- **Caching**: Redis for WHO API response caching with TTL strategies
- **Database**: PostgreSQL with TypeORM for user management and audit trails
- **Internationalization**: Complete i18n support with RTL layout for Arabic language

### Key Modules
- `frontend/`: Next.js application with pages, components, hooks, and services
- `frontend/components/Auth/`: Complete authentication UI components and forms
- `frontend/contexts/`: Authentication context and state management
- `frontend/hooks/`: Authentication hooks and utilities
- `backend/src/auth/`: JWT authentication module with login, register, and token management
- `backend/src/users/`: User entity and management with TypeORM
- `backend/src/icd11/`: Core ICD-11 search functionality and WHO API integration
- `backend/src/cache/`: Redis caching service with cache interface
- `backend/src/common/`: Shared DTOs, interfaces, exceptions, and utilities

## Development Commands

### Root Project Commands
```bash
# Install all dependencies for both frontend and backend
npm run install:all

# Development (runs both frontend and backend concurrently)
npm run dev

# Build both applications
npm run build

# Production start
npm run start
```

### Frontend Commands (from /frontend)
```bash
# Development server (runs on port 3000)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint

# Type checking
npm run type-check

# Code formatting
npm run format
```

### Backend Commands (from /backend) 
```bash
# Development server with watch mode (runs on port 3003)
npm run start:dev

# Production build
npm run build

# Start production server
npm run start:prod

# Linting with auto-fix
npm run lint

# Run tests
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e
```

### Docker Commands
```bash
# Build and start with Docker Compose
npm run docker:up

# Build containers
npm run docker:build

# Stop containers
npm run docker:down
```

## Core Implementation Patterns

### Backend Architecture
- **Modular NestJS structure**: Each feature has its own module (AuthModule, UsersModule, ICD11Module, CacheModule)
- **JWT Authentication**: Access tokens (15 minutes) and refresh tokens (7 days) with automatic rotation
- **Role-Based Access Control**: Multi-tier permissions (USER, HEALTHCARE_PROVIDER, ORG_ADMIN, SUPER_ADMIN)
- **Database Integration**: TypeORM with PostgreSQL for user entities and audit logging
- **Security Features**: Account lockout (5 failed attempts = 30 min), bcrypt password hashing, HIPAA-compliant audit trails
- **Dependency injection**: Services are injected through NestJS DI container
- **DTO validation**: Use class-validator and class-transformer for request/response validation
- **Redis caching**: WHO API responses are cached with appropriate TTL
- **Global Middleware**: Authentication middleware with @Public() decorator for public endpoints
- **Error handling**: Global exception filters and logging interceptors

### Frontend Architecture  
- **Page-based routing**: Next.js file-system routing in `/pages` directory with protected routes
- **Authentication System**: Complete React Context-based auth state management with SSR-safe token storage
- **Component composition**: Reusable components in `/components` with index exports
- **Auth Components**: Login/Register forms with Material-UI and React Hook Form validation
- **Custom hooks**: Business logic encapsulated in `/hooks` (useAuth, useICD11Search, useSearch)
- **API services**: Centralized API client in `/services/api/` with automatic token management
- **Context for state**: React Context for global application state and authentication
- **Protected Routes**: Higher-order components and route guards for role-based access
- **Storage Utilities**: SSR-safe localStorage/sessionStorage with memory fallbacks
- **Internationalization**: next-i18next framework with 6 supported languages (en, es, fr, ar, zh, ru)
- **RTL Support**: Comprehensive right-to-left layout for Arabic with Material-UI theming
- **Translation Management**: Organized namespace structure (common, search, medical, errors, accessibility, auth)

### API Integration
- **WHO ICD-11 API**: OAuth2 authentication with client credentials flow
- **Rate limiting**: Respectful API usage with proper throttling
- **Circuit breaker pattern**: Graceful handling of API failures
- **Response normalization**: Consistent data structures across the application
- **Search Debouncing**: 500ms debounce delay prevents rapid API calls during typing
- **Timeout Handling**: 30-second timeouts on both frontend and backend for slow WHO API responses
- **Minimum Query Length**: Only searches with 2+ characters to reduce unnecessary API calls
- **Entity URL Encoding**: URL-safe base64 encoding for WHO ICD-11 entity IDs containing special characters

### Authentication System
- **JWT Architecture**: Dual-token system with access tokens (15 minutes) and refresh tokens (7 days)
- **Token Storage**: SSR-safe storage utilities with localStorage/sessionStorage based on "remember me" option
- **Automatic Refresh**: Tokens refresh automatically before expiry to maintain seamless user sessions
- **Role-Based Access Control**: Four-tier permission system (USER, HEALTHCARE_PROVIDER, ORG_ADMIN, SUPER_ADMIN)
- **Account Security**: Failed login tracking with progressive lockout (5 attempts = 30 minutes)
- **Password Security**: bcrypt hashing with configurable rounds for optimal security/performance balance
- **Session Management**: Support for single logout or logout from all devices
- **Public/Private Endpoints**: Flexible endpoint protection with @Public() decorator for mixed access patterns
- **Database Auditing**: Comprehensive audit trails for authentication events and user activities
- **SSR Compatibility**: Authentication state properly handled across server-side rendering and client hydration

#### Authentication API Endpoints
```typescript
POST /api/auth/register     // User registration with role assignment
POST /api/auth/login        // Login with email/password + optional "remember me"
POST /api/auth/refresh      // Refresh access token using refresh token
POST /api/auth/logout       // Logout from current device
POST /api/auth/logout-all   // Logout from all devices
GET  /api/auth/profile      // Get current user profile and permissions
POST /api/auth/validate     // Validate current access token
```

#### Frontend Authentication Features
```typescript
// Authentication Context Usage
const { user, isAuthenticated, login, logout } = useAuth();

// Protected Route Implementation  
<ProtectedRoute requiredRole="HEALTHCARE_PROVIDER">
  <AdminDashboard />
</ProtectedRoute>

// Authentication Modal
<AuthModal 
  open={showAuth} 
  onClose={() => setShowAuth(false)} 
  defaultMode="login" 
/>
```

## Environment Configuration

### Backend Environment (.env)
Required environment variables:

**WHO API Integration:**
- `ICD11_CLIENT_ID`: WHO API client ID
- `ICD11_CLIENT_SECRET`: WHO API client secret

**Database Configuration:**
- `DATABASE_HOST`: PostgreSQL host (default: localhost)
- `DATABASE_PORT`: PostgreSQL port (default: 5432)
- `DATABASE_USERNAME`: PostgreSQL username
- `DATABASE_PASSWORD`: PostgreSQL password
- `DATABASE_NAME`: PostgreSQL database name

**JWT Authentication:**
- `JWT_SECRET`: Secret key for JWT token signing (minimum 32 characters)
- `JWT_REFRESH_SECRET`: Secret key for refresh token signing
- `JWT_EXPIRATION`: Access token expiration (default: 15m)
- `JWT_REFRESH_EXPIRATION`: Refresh token expiration (default: 7d)

**Redis Configuration:**
- `REDIS_HOST`: Redis server host
- `REDIS_PORT`: Redis server port

### Frontend Environment (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:3003)

## Internationalization (i18n)

### Language Support
The application supports 6 languages with complete interface translation:
- **English (en)**: Primary language with full translations
- **Spanish (es)**: Complete medical and UI translations
- **French (fr)**: Basic translations (expandable)
- **Arabic (ar)**: Full translations with RTL support
- **Chinese (zh)**: Basic translations (expandable) 
- **Russian (ru)**: Basic translations (expandable)

### Technical Implementation

#### next-i18next Framework
- **Configuration**: `next-i18next.config.js` with SSR/SSG support
- **Fallback Strategy**: English as fallback language for missing translations
- **Namespace Organization**: 5 translation namespaces for modular content management
- **Performance**: Bundle splitting and lazy loading for optimal performance

#### Translation Structure
```
public/locales/
├── en/ (English - Complete)
├── es/ (Spanish - Complete) 
├── fr/ (French - Partial)
├── ar/ (Arabic - Complete with RTL)
├── zh/ (Chinese - Partial)
└── ru/ (Russian - Partial)
    ├── common.json      # Navigation, buttons, general UI
    ├── search.json      # Search interface and results
    ├── medical.json     # Medical terminology and categories
    ├── errors.json      # Error messages and validation
    ├── accessibility.json # Screen reader and accessibility content
    └── auth.json        # Authentication forms, messages, and validation
```

#### RTL Language Support (Arabic)
- **Document Direction**: Automatic `dir="rtl"` attribute setting
- **Material-UI Theming**: RTL-aware component styling with emotion cache
- **Typography**: Noto Sans Arabic font with optimized line-height
- **Layout Mirroring**: Complete interface mirroring for Arabic reading patterns
- **CSS Utilities**: Logical properties and RTL-specific utility classes
- **Performance**: Arabic font preloading and FOUC prevention

#### Language Switching
- **Context Management**: Enhanced LanguageContext with i18n hooks integration
- **Storage Persistence**: localStorage preference saving with fallback
- **URL Integration**: Locale detection from browser preferences
- **Real-time Updates**: Immediate interface language switching (300ms transition)
- **Component Integration**: useTranslation hook in all translated components

## Development Workflow

1. **Setup**: Run `npm run install:all` to install all dependencies
2. **Database**: Ensure PostgreSQL is running and database is created
3. **Environment**: Configure `.env` files in both frontend and backend directories (see Environment Configuration)
4. **Development**: Use `npm run dev` from root to start both servers
5. **Authentication Testing**: Test login/register flows with different user roles
6. **Testing**: Run tests from respective directories using npm scripts
7. **Linting**: Always run linters before committing changes

### Authentication Development Notes
- **Database Migrations**: TypeORM migrations run automatically in development
- **Default Admin User**: Create via backend admin endpoints or directly in database
- **Token Testing**: Use browser dev tools to inspect JWT tokens and storage
- **Protected Routes**: Test unauthorized access and role-based restrictions
- **SSR Testing**: Verify authentication state persists across page refreshes

## API Documentation

When backend is running, Swagger documentation is available at:
`http://localhost:3003/api/docs`

## Recent Updates

### Sprint 2 Phase 2 Completion (August 2025)
- ✅ **Phase 2A**: Enhanced hierarchical navigation with 6-language support (en, es, fr, ar, zh, ru)
- ✅ **Phase 2B**: Healthcare provider customization system with branding capabilities
- ✅ **Search Performance**: Fixed timeout issues with debouncing and increased timeout limits
- ✅ **UI/UX Enhancement**: Complete redesign with improved search interface and responsive layout
- ✅ **Entity Routing**: Fixed 404 issues with URL-safe base64 encoding for entity IDs
- ✅ **Integration Testing**: All pages loading correctly with proper error handling
- ✅ **Complete Internationalization**: Full i18n implementation with next-i18next framework
- ✅ **RTL Language Support**: Comprehensive Arabic RTL layout with proper typography and theming
- ✅ **Professional Navigation**: Glass-morphism design with flag-based language selector

### Phase 3A: JWT Authentication Backend (August 2025)
- ✅ **Healthcare-Grade Security**: Implemented enterprise-level authentication with HIPAA compliance
- ✅ **Cross-Platform Compatibility**: Resolved ARM64 bcrypt issues with native Node.js scrypt implementation
- ✅ **TypeScript Zero Errors**: Complete compilation success with proper type safety
- ✅ **Database Integration**: PostgreSQL with TypeORM, User entities, and refresh token management
- ✅ **JWT Token System**: Access tokens (15min) + Refresh tokens (7 days) with secure rotation
- ✅ **Account Security**: Failed login tracking, account locking (5 attempts = 30min lockout)
- ✅ **Audit Logging**: Comprehensive HIPAA-compliant audit trail for all authentication events
- ✅ **Role-Based Access Control**: Multi-role system (SUPER_ADMIN, ORG_ADMIN, HEALTHCARE_PROVIDER, USER)
- ✅ **Public/Private Endpoints**: Seamless integration with existing ICD-11 public search functionality
- ✅ **Authentication Middleware**: Global middleware with @Public() decorator support
- ✅ **API Security Hardening**: Rate limiting, secure headers, and attack prevention mechanisms

### Phase 3B: Frontend Authentication Integration (August 2025)
- ✅ **React Context Authentication**: Complete auth state management with SSR-safe token storage
- ✅ **Login/Register Forms**: Material-UI forms with React Hook Form validation and error handling
- ✅ **Token Management**: Automatic token refresh, storage utilities, and session handling
- ✅ **Protected Routes**: HOCs and route guards for role-based access control
- ✅ **Authentication Modal System**: Seamless login/register modal integration
- ✅ **User Menu & Profile**: Complete user dashboard, profile management, and logout functionality
- ✅ **Internationalization**: Authentication translations for all 6 supported languages
- ✅ **Critical Bug Fixes**: Modal transparency, form validation, hydration errors, and storage utilities

### Critical Bug Fixes Applied (Phase 3)
- ✅ **Storage Utility Fix**: Resolved infinite recursion bug in token storage utilities (variable name collision)
- ✅ **Hydration Error Fix**: Fixed Next.js SSR/client rendering mismatch with isMounted state checks
- ✅ **Form Validation Fix**: Aligned frontend/backend DTOs to prevent registration validation errors
- ✅ **Modal Visibility Fix**: Fixed AuthModal transparent background making forms invisible
- ✅ **Authentication Flow**: Complete login, register, logout, and logout-all-devices functionality

### Performance Optimizations
- **Search Debouncing**: Implemented 500ms debounce in `useICD11Search` hook
- **Timeout Configuration**: Increased from 10s to 30s for WHO API responses
- **React Query Optimization**: Added proper retry limits and disabled unnecessary refetches
- **WHO API Integration**: Stable OAuth2 authentication with proper error handling

### URL Routing Improvements
- **Entity ID Encoding**: Implemented URL-safe base64 encoding for WHO ICD-11 entity IDs
- **Navigation Consistency**: All navigation components use consistent encoding (SearchResultItem, Breadcrumb, ChildrenBrowser)
- **Backward Compatibility**: Fallback URL decoding for legacy entity URLs
- **Special Character Handling**: Proper handling of entity IDs containing slashes, colons, and other URL-unsafe characters

## Important Notes

- **Port Configuration**: Backend runs on port 3003 (changed from default 3000)
- **Database Required**: PostgreSQL must be running for user authentication and management
- **Redis Required**: Redis must be running for caching functionality
- **WHO API Credentials**: Valid WHO ICD-11 API credentials required for functionality
- **JWT Secrets**: Strong JWT secrets required for authentication security (minimum 32 characters)
- **TypeScript**: Full TypeScript coverage across frontend and backend
- **Docker Support**: Full Docker Compose setup available for development and production
- **Search Performance**: Core ICD-11 search fully functional with WHO API integration
- **Authentication**: Complete JWT-based authentication with role-based access control
- **Public/Private Access**: ICD-11 search remains publicly accessible, admin features require authentication
- Add to memory. Never beautify the results of the coding tasks. Be honest on the progress on the tasks, subtasks and the project. Make sure, the documentation is always up to date.
- do not create new files, when there is an existing one there. Ensure you write in the correct file and update this file. If you have created a file make sure, it was necessary. If you create temporary files, ALWAYS DELETE THEM when they are not needed anymore.