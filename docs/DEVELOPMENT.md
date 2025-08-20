# Development Guide

This comprehensive guide covers local development setup, contribution guidelines, and best practices for working with the ICD-11 Healthcare Boilerplate Platform. Whether you're a new contributor or an experienced developer, this guide will help you get up and running quickly.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Strategy](#testing-strategy)
6. [Debugging Guide](#debugging-guide)
7. [Contributing Guidelines](#contributing-guidelines)
8. [Release Process](#release-process)
9. [Troubleshooting](#troubleshooting)

## Development Environment Setup

### Prerequisites

#### System Requirements
- **Node.js**: 16.0.0 or higher (18.x recommended)
- **npm**: 8.0.0 or higher
- **Git**: Latest version
- **Docker**: 20.10+ (optional but recommended)
- **Redis**: 6.0+ (local installation or Docker)

#### Code Editor Recommendations
- **Visual Studio Code** with extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - Docker
  - GitLens
  - Thunder Client (for API testing)

#### WHO ICD-11 API Access
1. Register at [WHO ICD-11 API Portal](https://icd.who.int/icdapi)
2. Create a new application
3. Obtain Client ID and Client Secret
4. Review API documentation and rate limits

### Local Setup

#### 1. Clone the Repository
```bash
# Clone the main repository
git clone https://github.com/alirezarezvani/icd11-nextjs-nestjs-boilerplate.git
cd icd11-nextjs-nestjs-boilerplate

# Or clone your fork
git clone https://github.com/YOUR_USERNAME/icd11-nextjs-nestjs-boilerplate.git
cd icd11-nextjs-nestjs-boilerplate

# Add upstream remote (if cloned from fork)
git remote add upstream https://github.com/alirezarezvani/icd11-nextjs-nestjs-boilerplate.git
```

#### 2. Install Dependencies
```bash
# Install all dependencies for the monorepo
npm install

# Or install dependencies for specific packages
cd packages/frontend && npm install
cd packages/backend && npm install
cd packages/cli && npm install
```

#### 3. Environment Configuration

**Backend Environment Setup**
```bash
# Copy environment template
cp packages/backend/.env.example packages/backend/.env

# Edit environment variables
nano packages/backend/.env
```

**Backend .env Configuration**
```bash
# WHO ICD-11 API Configuration
ICD11_CLIENT_ID=your_client_id_here
ICD11_CLIENT_SECRET=your_client_secret_here
ICD11_API_BASE_URL=https://id.who.int/icd

# Application Configuration
NODE_ENV=development
PORT=3003
CORS_ORIGINS=http://localhost:3000

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Development Database (if using PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/healthcare_dev

# Security (generate secure values for production)
JWT_SECRET=your-development-jwt-secret
SESSION_SECRET=your-development-session-secret

# Logging
LOG_LEVEL=debug
ENABLE_METRICS=true

# Organization (for development)
ORG_NAME=Development Healthcare Org
ORG_WEBSITE=http://localhost:3000
SUPPORT_EMAIL=dev@localhost
```

**Frontend Environment Setup**
```bash
# Copy environment template
cp packages/frontend/.env.local.example packages/frontend/.env.local

# Edit environment variables
nano packages/frontend/.env.local
```

**Frontend .env.local Configuration**
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3003/api
NEXT_PUBLIC_API_VERSION=v1

# Application Configuration
NEXT_PUBLIC_APP_NAME=Healthcare Development App
NEXT_PUBLIC_PROJECT_NAME=healthcare-dev
NEXT_PUBLIC_APP_DESCRIPTION=ICD-11 Healthcare Application (Development)

# Theme Configuration
NEXT_PUBLIC_PRIMARY_COLOR=#1976d2
NEXT_PUBLIC_SECONDARY_COLOR=#dc004e
NEXT_PUBLIC_LOGO_URL=/assets/logo.png

# Development Features
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_PWA=false
NEXT_PUBLIC_ENABLE_OFFLINE=false
NEXT_PUBLIC_DEBUG_MODE=true
```

#### 4. Database Setup

**Option A: Docker Redis (Recommended)**
```bash
# Start Redis container
docker run -d \
  --name healthcare-redis \
  -p 6379:6379 \
  redis:7-alpine

# Verify Redis is running
docker logs healthcare-redis
redis-cli ping  # Should return PONG
```

**Option B: Local Redis Installation**
```bash
# Install Redis (Ubuntu/Debian)
sudo apt update
sudo apt install redis-server

# Install Redis (macOS with Homebrew)
brew install redis

# Start Redis service
sudo systemctl start redis-server  # Linux
brew services start redis          # macOS

# Test Redis connection
redis-cli ping
```

#### 5. Development Servers

**Start All Services (Recommended)**
```bash
# Start all services with Turbo
npm run dev

# This starts:
# - Frontend development server (http://localhost:3000)
# - Backend development server (http://localhost:3003)
# - TypeScript compilation in watch mode
```

**Start Services Individually**
```bash
# Terminal 1: Start backend
cd packages/backend
npm run start:dev

# Terminal 2: Start frontend
cd packages/frontend
npm run dev

# Terminal 3: Start CLI development (if contributing to CLI)
cd packages/cli
npm run dev
```

#### 6. Verify Setup
```bash
# Check frontend
curl http://localhost:3000

# Check backend health
curl http://localhost:3003/api/health

# Check backend API documentation
open http://localhost:3003/api/docs

# Test WHO API integration
curl -X GET "http://localhost:3003/api/icd11/search?q=diabetes&limit=5"
```

### Development with Docker

#### Full Stack Development
```bash
# Start development environment with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Individual Service Development
```bash
# Start only Redis for local development
docker-compose up -d redis

# Build development images
docker-compose build frontend
docker-compose build backend

# Start specific services
docker-compose up frontend backend redis
```

## Project Structure

### Monorepo Architecture
```
icd11-nextjs-nestjs-boilerplate/
├── packages/                    # Workspaces
│   ├── frontend/               # Next.js application
│   ├── backend/                # NestJS API server
│   ├── cli/                    # CLI tool
│   └── shared/                 # Shared types and utilities
├── docs/                       # Documentation
├── scripts/                    # Build and deployment scripts
├── docker-compose.yml          # Development environment
├── turbo.json                  # Turbo configuration
├── package.json                # Root package configuration
└── README.md                   # Main documentation
```

### Frontend Package Structure
```
packages/frontend/
├── components/                 # React components
│   ├── ui/                    # Base UI components
│   │   ├── button.tsx         # Button component
│   │   ├── input.tsx          # Input component
│   │   └── index.ts           # UI exports
│   ├── Layout.tsx             # Page layout
│   ├── SearchForm.tsx         # Search interface
│   ├── SearchResults.tsx      # Results display
│   ├── Breadcrumb/           # Navigation breadcrumbs
│   │   ├── Breadcrumb.tsx
│   │   └── index.ts
│   └── index.ts              # Component exports
├── pages/                     # Next.js pages
│   ├── _app.tsx              # App configuration
│   ├── index.tsx             # Homepage
│   ├── search.tsx            # Search page
│   ├── about.tsx             # About page
│   └── entity/               # Dynamic routes
│       └── [id].tsx          # Entity details page
├── context/                   # React Context
│   ├── ICD11Context.tsx      # ICD-11 state management
│   └── index.ts              # Context exports
├── hooks/                     # Custom hooks
│   ├── useICD11Search.ts     # Search functionality
│   ├── useSearch.ts          # Generic search
│   └── index.ts              # Hook exports
├── services/                  # API services
│   ├── api/                  # API client
│   │   ├── client.ts         # HTTP client
│   │   ├── icd11.service.ts  # ICD-11 endpoints
│   │   ├── types.ts          # API types
│   │   └── index.ts          # Service exports
│   └── apiClient.ts          # Legacy client
├── lib/                       # Utilities
│   ├── utils.ts              # Helper functions
│   └── react-query.ts        # React Query config
├── styles/                    # Styling
│   └── globals.css           # Global styles
├── config/                    # Configuration
│   ├── constants.ts          # App constants
│   └── index.ts              # Config exports
├── types/                     # TypeScript types
│   └── index.ts              # Type definitions
├── public/                    # Static assets
│   └── assets/               # Images, icons, etc.
├── tests/                     # Test files
│   ├── __mocks__/           # Test mocks
│   ├── components/          # Component tests
│   ├── pages/               # Page tests
│   └── utils/               # Utility tests
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Package configuration
```

### Backend Package Structure
```
packages/backend/
├── src/
│   ├── app.module.ts         # Root module
│   ├── main.ts               # Application entry point
│   ├── icd11/                # ICD-11 module
│   │   ├── icd11.module.ts
│   │   ├── icd11.controller.ts
│   │   ├── icd11.service.ts
│   │   ├── dto/              # Data Transfer Objects
│   │   │   └── search.dto.ts
│   │   ├── interfaces/       # TypeScript interfaces
│   │   │   └── icd11.interface.ts
│   │   └── who.interfaces.ts # WHO API types
│   ├── cache/                # Caching module
│   │   ├── cache.module.ts
│   │   ├── cache.service.ts
│   │   └── interfaces/
│   │       └── cache.interface.ts
│   ├── common/               # Shared utilities
│   │   ├── dto/              # Common DTOs
│   │   │   ├── pagination.dto.ts
│   │   │   └── index.ts
│   │   ├── exceptions/       # Custom exceptions
│   │   │   ├── who-api.exception.ts
│   │   │   └── index.ts
│   │   ├── filters/          # Exception filters
│   │   │   ├── all-exceptions.filter.ts
│   │   │   ├── http-exception.filter.ts
│   │   │   └── index.ts
│   │   ├── guards/           # Authentication guards
│   │   │   ├── auth.guard.ts
│   │   │   └── index.ts
│   │   ├── interceptors/     # Request interceptors
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── response-transform.interceptor.ts
│   │   │   └── index.ts
│   │   ├── middleware/       # Custom middleware
│   │   │   ├── logger.middleware.ts
│   │   │   └── index.ts
│   │   ├── decorators/       # Custom decorators
│   │   │   ├── user.decorator.ts
│   │   │   └── index.ts
│   │   └── utils/            # Utility functions
│   │       ├── error-handler.util.ts
│   │       ├── validation.util.ts
│   │       └── index.ts
│   ├── config/               # Configuration
│   │   ├── env.config.ts     # Environment validation
│   │   ├── database.config.ts # Database configuration
│   │   └── index.ts          # Config exports
│   ├── health/               # Health check module
│   │   ├── health.controller.ts
│   │   ├── health.service.ts
│   │   └── health.module.ts
│   └── metrics/              # Metrics module
│       ├── metrics.controller.ts
│       ├── metrics.service.ts
│       └── metrics.module.ts
├── test/                     # Test files
│   ├── app.e2e-spec.ts      # End-to-end tests
│   ├── jest-e2e.json        # E2E Jest config
│   └── mocks/               # Test mocks
├── logs/                     # Log files (development)
├── nest-cli.json            # Nest CLI configuration
├── tsconfig.json            # TypeScript configuration
├── tsconfig.build.json      # Build TypeScript config
└── package.json             # Package configuration
```

### CLI Package Structure
```
packages/cli/
├── src/
│   ├── cli.ts               # CLI entry point
│   ├── index.ts             # Package exports
│   ├── commands/            # CLI commands
│   │   ├── create.ts        # Create command
│   │   ├── update.ts        # Update command
│   │   ├── validate.ts      # Validate command
│   │   └── index.ts         # Command exports
│   ├── utils/               # Utility functions
│   │   ├── scaffolder.ts    # Project scaffolding
│   │   ├── template-processor.ts # Template processing
│   │   ├── validation.ts    # Input validation
│   │   ├── logger.ts        # Logging utilities
│   │   ├── environment.ts   # Environment helpers
│   │   └── index.ts         # Util exports
│   └── __tests__/           # Test files
│       ├── cli.integration.test.ts
│       ├── create.test.ts
│       └── template-processor.test.ts
├── templates/               # Project templates
│   ├── default/            # Full-stack template
│   ├── frontend-only/      # Frontend template
│   ├── api-only/           # Backend template
│   ├── minimal/            # Minimal template
│   ├── deployment/         # Deployment templates
│   │   ├── aws/           # AWS configurations
│   │   ├── azure/         # Azure configurations
│   │   ├── gcp/           # GCP configurations
│   │   └── docker/        # Docker configurations
│   ├── ci-cd/             # CI/CD templates
│   │   ├── github-actions.template.yml
│   │   └── gitlab-ci.template.yml
│   └── template-config.json # Template metadata
├── docs/                   # CLI documentation
├── scripts/               # Build scripts
├── dist/                  # Compiled output
├── jest.config.js         # Jest configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Package configuration
```

## Development Workflow

### Git Workflow

#### Branch Naming Convention
```bash
# Feature branches
git checkout -b feature/add-search-filters
git checkout -b feature/who-api-v2-support

# Bug fixes
git checkout -b fix/redis-connection-timeout
git checkout -b fix/search-pagination-issue

# Improvements
git checkout -b improve/error-handling
git checkout -b improve/performance-optimization

# Documentation
git checkout -b docs/api-documentation
git checkout -b docs/deployment-guide
```

#### Commit Message Format
Follow the Conventional Commits specification:

```bash
# Features
git commit -m "feat(frontend): add advanced search filters"
git commit -m "feat(backend): implement WHO API v2 support"

# Bug fixes
git commit -m "fix(cache): resolve Redis connection timeout"
git commit -m "fix(search): correct pagination offset calculation"

# Documentation
git commit -m "docs(api): add endpoint documentation"
git commit -m "docs(deployment): update Docker instructions"

# Tests
git commit -m "test(backend): add unit tests for search service"
git commit -m "test(e2e): add integration tests for WHO API"

# Chores
git commit -m "chore(deps): update dependencies to latest versions"
git commit -m "chore(build): optimize Docker build process"
```

#### Pull Request Process
1. **Create Feature Branch**
```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

2. **Make Changes and Test**
```bash
# Make your changes
npm run test
npm run lint
npm run type-check
```

3. **Commit and Push**
```bash
git add .
git commit -m "feat(scope): description of changes"
git push origin feature/your-feature-name
```

4. **Create Pull Request**
- Use the PR template
- Provide clear description
- Link related issues
- Request appropriate reviewers

### Development Scripts

#### Root Package Scripts
```bash
# Development
npm run dev                    # Start all services in development mode
npm run build                  # Build all packages
npm run test                   # Run all tests
npm run lint                   # Lint all packages
npm run type-check             # Type check all packages

# Package management
npm run install:all            # Install all dependencies
npm run clean                  # Clean all build artifacts
npm run reset                  # Reset all packages (clean + install)

# Release
npm run changeset              # Create changeset for release
npm run version                # Version packages
npm run release                # Publish packages
```

#### Frontend Scripts
```bash
cd packages/frontend

# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server
npm run export                 # Export static site

# Quality
npm run lint                   # ESLint
npm run lint:fix               # Fix ESLint issues
npm run type-check             # TypeScript checking
npm run format                 # Prettier formatting

# Testing
npm run test                   # Run Jest tests
npm run test:watch             # Jest in watch mode
npm run test:coverage          # Generate coverage report
npm run test:e2e               # End-to-end tests

# Analysis
npm run analyze                # Bundle analysis
npm run lighthouse             # Performance audit
```

#### Backend Scripts
```bash
cd packages/backend

# Development
npm run start:dev              # Development with watch mode
npm run start:debug            # Development with debugging
npm run build                  # Build for production
npm run start:prod             # Start production server

# Quality
npm run lint                   # ESLint
npm run lint:fix               # Fix ESLint issues
npm run format                 # Prettier formatting

# Testing
npm run test                   # Unit tests
npm run test:watch             # Tests in watch mode
npm run test:coverage          # Coverage report
npm run test:e2e               # End-to-end tests
npm run test:debug             # Debug tests

# Database
npm run migration:generate     # Generate migration
npm run migration:run          # Run migrations
npm run migration:revert       # Revert migration
npm run seed:run               # Run database seeds
```

#### CLI Scripts
```bash
cd packages/cli

# Development
npm run dev                    # TypeScript compilation in watch mode
npm run build                  # Build CLI
npm run start                  # Run CLI locally

# Testing
npm run test                   # Unit tests
npm run test:integration       # Integration tests
npm run test:watch             # Tests in watch mode

# Distribution
npm run pack:test              # Test package creation
npm run publish:beta           # Publish beta version
npm run publish:latest         # Publish latest version
```

### Hot Reloading and Development

#### Frontend Hot Reloading
```bash
# Next.js automatically provides hot reloading
# Changes to components, pages, and styles reload instantly
npm run dev

# For custom configurations, check next.config.js
module.exports = {
  experimental: {
    fastRefresh: true
  }
}
```

#### Backend Hot Reloading
```bash
# NestJS development mode with automatic restart
npm run start:dev

# Manual restart if needed
rs  # Type 'rs' and press Enter in the terminal
```

#### Environment Variable Changes
```bash
# Backend automatically restarts on .env changes
# Frontend requires manual restart for environment changes
npm run dev  # Restart frontend if .env.local changes
```

## Coding Standards

### TypeScript Configuration

#### Shared TypeScript Configuration
```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/services/*": ["./src/services/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

#### Frontend TypeScript Configuration
```json
// packages/frontend/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### Backend TypeScript Configuration
```json
// packages/backend/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

### ESLint Configuration

#### Root ESLint Configuration
```json
// .eslintrc.json
{
  "root": true,
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error"
  },
  "overrides": [
    {
      "files": ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "off"
      }
    }
  ]
}
```

#### Frontend ESLint Configuration
```json
// packages/frontend/.eslintrc.json
{
  "extends": [
    "../../.eslintrc.json",
    "next/core-web-vitals",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "plugins": ["react", "react-hooks"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/explicit-function-return-type": "off"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

#### Backend ESLint Configuration
```json
// packages/backend/.eslintrc.json
{
  "extends": [
    "../../.eslintrc.json",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### Code Style Guidelines

#### Naming Conventions
```typescript
// Constants - UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_TIMEOUT = 5000;

// Variables and functions - camelCase
const searchQuery = 'diabetes';
const handleSearchSubmit = () => {};

// Types and interfaces - PascalCase
interface SearchResult {
  id: string;
  title: string;
}

type ApiResponse<T> = {
  data: T;
  status: number;
};

// Classes - PascalCase
class SearchService {
  private apiClient: ApiClient;
}

// Enums - PascalCase
enum SearchStatus {
  Idle = 'idle',
  Loading = 'loading',
  Success = 'success',
  Error = 'error',
}

// Files and directories - kebab-case
// search-form.tsx
// search-results.tsx
// icd11-service.ts
```

#### Component Structure
```typescript
// components/SearchForm.tsx
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 1. Type definitions
interface SearchFormProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// 2. Component definition
export const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  placeholder = 'Search ICD-11 codes...',
  disabled = false,
}) => {
  // 3. State hooks
  const [query, setQuery] = useState('');

  // 4. Effect hooks
  // (none in this example)

  // 5. Event handlers
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        onSearch(query.trim());
      }
    },
    [query, onSearch]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    []
  );

  // 6. Render
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />
      <Button type="submit" disabled={disabled || !query.trim()}>
        Search
      </Button>
    </form>
  );
};

// 7. Default export
export default SearchForm;
```

#### Service Class Structure
```typescript
// services/icd11.service.ts
import { Injectable, HttpService } from '@nestjs/common';
import { CacheService } from '@/cache/cache.service';
import { LoggerService } from '@/common/logger.service';

// 1. Interfaces and types
interface SearchOptions {
  limit?: number;
  offset?: number;
  includeDefinitions?: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  code?: string;
  definition?: string;
}

// 2. Service class
@Injectable()
export class ICD11Service {
  // 3. Dependencies injection
  constructor(
    private readonly httpService: HttpService,
    private readonly cacheService: CacheService,
    private readonly logger: LoggerService
  ) {}

  // 4. Public methods
  async search(
    query: string, 
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    try {
      // Method implementation
      const cacheKey = this.buildCacheKey(query, options);
      
      // Check cache first
      const cached = await this.cacheService.get<SearchResult[]>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for search: ${query}`);
        return cached;
      }

      // Fetch from WHO API
      const results = await this.fetchFromWHO(query, options);
      
      // Cache results
      await this.cacheService.set(cacheKey, results, 1800); // 30 minutes
      
      this.logger.info(`Search completed: ${query}, results: ${results.length}`);
      return results;
    } catch (error) {
      this.logger.error(`Search failed: ${query}`, error);
      throw error;
    }
  }

  // 5. Private methods
  private buildCacheKey(query: string, options: SearchOptions): string {
    return `search:${query}:${JSON.stringify(options)}`;
  }

  private async fetchFromWHO(
    query: string, 
    options: SearchOptions
  ): Promise<SearchResult[]> {
    // Implementation details
  }
}
```

### Documentation Standards

#### JSDoc Comments
```typescript
/**
 * Searches ICD-11 entities using the WHO API
 * 
 * @param query - The search query string
 * @param options - Search options including pagination and filters
 * @returns Promise resolving to array of search results
 * 
 * @example
 * ```typescript
 * const results = await icd11Service.search('diabetes', {
 *   limit: 10,
 *   includeDefinitions: true
 * });
 * ```
 * 
 * @throws {WHOApiException} When WHO API request fails
 * @throws {ValidationException} When query parameters are invalid
 */
async search(
  query: string, 
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  // Implementation
}
```

#### README Structure for Packages
```markdown
# Package Name

Brief description of the package and its purpose.

## Installation

```bash
npm install package-name
```

## Usage

Basic usage example:

```typescript
import { ServiceName } from 'package-name';

const service = new ServiceName();
const result = await service.method();
```

## API Reference

### Class: ServiceName

#### Methods

##### method(param: Type): ReturnType

Description of the method.

**Parameters:**
- `param` (Type): Description of parameter

**Returns:**
- `ReturnType`: Description of return value

**Example:**
```typescript
const result = service.method(value);
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
```

## Testing Strategy

### Testing Philosophy
- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test interactions between modules
- **End-to-End Tests**: Test complete user workflows
- **Contract Tests**: Test API contracts with external services

### Frontend Testing

#### Jest Configuration
```javascript
// packages/frontend/jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'services/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

#### Component Testing Example
```typescript
// components/__tests__/SearchForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchForm } from '../SearchForm';

describe('SearchForm', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('renders search input and button', () => {
    render(<SearchForm onSearch={mockOnSearch} />);
    
    expect(screen.getByPlaceholderText('Search ICD-11 codes...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('calls onSearch with trimmed query when form is submitted', async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Search ICD-11 codes...');
    const button = screen.getByRole('button', { name: 'Search' });
    
    await user.type(input, '  diabetes  ');
    await user.click(button);
    
    expect(mockOnSearch).toHaveBeenCalledWith('diabetes');
  });

  it('does not call onSearch with empty query', async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} />);
    
    const button = screen.getByRole('button', { name: 'Search' });
    await user.click(button);
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('disables input and button when disabled prop is true', () => {
    render(<SearchForm onSearch={mockOnSearch} disabled />);
    
    expect(screen.getByPlaceholderText('Search ICD-11 codes...')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();
  });
});
```

#### Hook Testing Example
```typescript
// hooks/__tests__/useICD11Search.test.ts
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useICD11Search } from '../useICD11Search';
import * as icd11Service from '@/services/api/icd11.service';

// Mock the service
jest.mock('@/services/api/icd11.service');
const mockIcd11Service = icd11Service as jest.Mocked<typeof icd11Service>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useICD11Search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useICD11Search(), {
      wrapper: createWrapper(),
    });

    expect(result.current.query).toBe('');
    expect(result.current.results).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should update query when setQuery is called', () => {
    const { result } = renderHook(() => useICD11Search(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setQuery('diabetes');
    });

    expect(result.current.query).toBe('diabetes');
  });

  it('should fetch results when query is set', async () => {
    const mockResults = [
      { id: '1', title: 'Type 1 diabetes' },
      { id: '2', title: 'Type 2 diabetes' },
    ];
    
    mockIcd11Service.search.mockResolvedValue(mockResults);

    const { result } = renderHook(() => useICD11Search(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setQuery('diabetes');
    });

    await waitFor(() => {
      expect(result.current.results).toEqual(mockResults);
    });

    expect(mockIcd11Service.search).toHaveBeenCalledWith('diabetes', {});
  });
});
```

### Backend Testing

#### Jest Configuration
```javascript
// packages/backend/jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.interface.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

#### Service Testing Example
```typescript
// src/icd11/__tests__/icd11.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ICD11Service } from '../icd11.service';
import { CacheService } from '@/cache/cache.service';
import { LoggerService } from '@/common/logger.service';
import { of } from 'rxjs';

describe('ICD11Service', () => {
  let service: ICD11Service;
  let httpService: jest.Mocked<HttpService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
      post: jest.fn(),
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const mockLoggerService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ICD11Service,
        { provide: HttpService, useValue: mockHttpService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<ICD11Service>(ICD11Service);
    httpService = module.get(HttpService);
    cacheService = module.get(CacheService);
  });

  describe('search', () => {
    it('should return cached results when available', async () => {
      const cachedResults = [
        { id: '1', title: 'Diabetes mellitus' }
      ];
      
      cacheService.get.mockResolvedValue(cachedResults);

      const result = await service.search('diabetes');

      expect(result).toEqual(cachedResults);
      expect(cacheService.get).toHaveBeenCalledWith('search:diabetes:{}');
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should fetch from WHO API when cache miss', async () => {
      const whoResponse = {
        data: {
          destinationEntities: [
            {
              id: 'http://id.who.int/icd/entity/142052508',
              title: 'Diabetes mellitus',
            }
          ]
        }
      };

      cacheService.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(of(whoResponse));

      const result = await service.search('diabetes');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Diabetes mellitus');
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should throw error when WHO API fails', async () => {
      cacheService.get.mockResolvedValue(null);
      httpService.get.mockImplementation(() => {
        throw new Error('API Error');
      });

      await expect(service.search('diabetes')).rejects.toThrow('API Error');
    });
  });

  describe('getEntity', () => {
    it('should return entity details', async () => {
      const entityResponse = {
        data: {
          '@id': 'http://id.who.int/icd/entity/142052508',
          title: { '@value': 'Diabetes mellitus' },
          definition: { '@value': 'A group of disorders...' }
        }
      };

      httpService.get.mockReturnValue(of(entityResponse));

      const result = await service.getEntity('142052508');

      expect(result.id).toBe('142052508');
      expect(result.title).toBe('Diabetes mellitus');
      expect(result.definition).toBe('A group of disorders...');
    });
  });
});
```

#### Controller Testing Example
```typescript
// src/icd11/__tests__/icd11.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ICD11Controller } from '../icd11.controller';
import { ICD11Service } from '../icd11.service';

describe('ICD11Controller', () => {
  let controller: ICD11Controller;
  let service: jest.Mocked<ICD11Service>;

  beforeEach(async () => {
    const mockService = {
      search: jest.fn(),
      getEntity: jest.fn(),
      getChildren: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ICD11Controller],
      providers: [
        { provide: ICD11Service, useValue: mockService },
      ],
    }).compile();

    controller = module.get<ICD11Controller>(ICD11Controller);
    service = module.get(ICD11Service);
  });

  describe('search', () => {
    it('should return search results', async () => {
      const searchDto = { q: 'diabetes', limit: 10, offset: 0 };
      const expectedResults = [
        { id: '1', title: 'Type 1 diabetes' },
        { id: '2', title: 'Type 2 diabetes' },
      ];

      service.search.mockResolvedValue(expectedResults);

      const result = await controller.search(searchDto);

      expect(result).toEqual(expectedResults);
      expect(service.search).toHaveBeenCalledWith('diabetes', {
        limit: 10,
        offset: 0,
      });
    });

    it('should validate search parameters', async () => {
      const invalidDto = { q: '', limit: -1 };

      // This would be caught by validation pipes in real application
      await expect(controller.search(invalidDto as any))
        .rejects.toThrow();
    });
  });
});
```

#### End-to-End Testing
```typescript
// test/icd11.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('ICD11Controller (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/icd11/search (GET)', () => {
    it('should return search results', () => {
      return request(app.getHttpServer())
        .get('/icd11/search?q=diabetes&limit=5')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeLessThanOrEqual(5);
        });
    });

    it('should return 400 for invalid query', () => {
      return request(app.getHttpServer())
        .get('/icd11/search?q=&limit=5')
        .expect(400);
    });

    it('should return 400 for invalid limit', () => {
      return request(app.getHttpServer())
        .get('/icd11/search?q=diabetes&limit=1001')
        .expect(400);
    });
  });

  describe('/icd11/entity/:id (GET)', () => {
    it('should return entity details', () => {
      return request(app.getHttpServer())
        .get('/icd11/entity/142052508')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('title');
        });
    });

    it('should return 404 for non-existent entity', () => {
      return request(app.getHttpServer())
        .get('/icd11/entity/nonexistent')
        .expect(404);
    });
  });
});
```

### Test Data Management

#### Test Fixtures
```typescript
// test/fixtures/icd11.fixtures.ts
export const mockSearchResults = [
  {
    id: '142052508',
    title: 'Diabetes mellitus',
    code: 'E10-E14',
    definition: 'A group of metabolic disorders...',
  },
  {
    id: '826510848',
    title: 'Type 1 diabetes mellitus',
    code: 'E10',
    definition: 'A form of diabetes...',
  },
];

export const mockEntityDetails = {
  id: '142052508',
  title: 'Diabetes mellitus',
  code: 'E10-E14',
  definition: 'A group of metabolic disorders characterized by hyperglycemia.',
  parents: [],
  children: [
    { id: '826510848', title: 'Type 1 diabetes mellitus' },
    { id: '481951975', title: 'Type 2 diabetes mellitus' },
  ],
};

export const mockWHOApiResponse = {
  destinationEntities: [
    {
      '@id': 'http://id.who.int/icd/entity/142052508',
      title: { '@value': 'Diabetes mellitus' },
      code: { '@value': 'E10-E14' },
    }
  ]
};
```

#### Mock Services
```typescript
// test/mocks/icd11.service.mock.ts
import { mockSearchResults, mockEntityDetails } from '../fixtures/icd11.fixtures';

export const mockICD11Service = {
  search: jest.fn().mockResolvedValue(mockSearchResults),
  getEntity: jest.fn().mockResolvedValue(mockEntityDetails),
  getChildren: jest.fn().mockResolvedValue([]),
};
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- search.spec.ts

# Run tests matching pattern
npm run test -- --testNamePattern="search"

# Run end-to-end tests
npm run test:e2e

# Run tests in CI mode (no watch)
npm run test:ci
```

## Debugging Guide

### Frontend Debugging

#### Browser DevTools
```typescript
// Add debugging breakpoints in code
const handleSearch = (query: string) => {
  debugger; // Browser will pause here
  console.log('Search query:', query);
  onSearch(query);
};

// Use console methods for debugging
console.log('Component rendered with props:', props);
console.group('Search Results');
results.forEach(result => console.log(result));
console.groupEnd();

// Debug React renders
console.log('Component re-rendered:', { query, results, isLoading });
```

#### React Developer Tools
```bash
# Install React DevTools browser extension
# Navigate to Components tab to inspect component tree
# Use Profiler tab to identify performance issues
```

#### Next.js Debugging
```javascript
// next.config.js - Enable source maps
module.exports = {
  productionBrowserSourceMaps: true,
  experimental: {
    instrumentationHook: true,
  },
};
```

#### VS Code Debugging Configuration
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Frontend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/packages/frontend/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/packages/frontend",
      "env": {
        "NODE_OPTIONS": "--inspect"
      }
    }
  ]
}
```

### Backend Debugging

#### Node.js Debugging
```bash
# Start with debugging enabled
npm run start:debug

# Or with specific debug port
node --inspect=0.0.0.0:9229 dist/main.js
```

#### NestJS Debugging
```typescript
// Add debugging to services
import { Logger } from '@nestjs/common';

@Injectable()
export class ICD11Service {
  private readonly logger = new Logger(ICD11Service.name);

  async search(query: string): Promise<SearchResult[]> {
    this.logger.debug(`Starting search for: ${query}`);
    
    try {
      const results = await this.performSearch(query);
      this.logger.debug(`Search completed: ${results.length} results`);
      return results;
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

#### VS Code Backend Debugging
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/packages/backend/src/main.ts",
      "outFiles": ["${workspaceFolder}/packages/backend/dist/**/*.js"],
      "cwd": "${workspaceFolder}/packages/backend",
      "env": {
        "NODE_ENV": "development"
      },
      "runtimeArgs": ["-r", "ts-node/register"],
      "sourceMaps": true
    }
  ]
}
```

### Database Debugging

#### Redis Debugging
```bash
# Connect to Redis CLI
redis-cli

# Monitor Redis commands
redis-cli monitor

# Check Redis info
redis-cli info

# List all keys
redis-cli keys "*"

# Get specific key
redis-cli get "search:diabetes:{}"

# Debug Redis connection in code
docker exec healthcare_redis_1 redis-cli ping
```

### API Debugging

#### WHO API Debugging
```bash
# Test WHO API directly
curl -X POST "https://icdaccessmanagement.who.int/connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&scope=icdapi_access&grant_type=client_credentials"

# Test search endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://id.who.int/icd/entity/search?q=diabetes&flatResults=true"

# Debug with verbose output
curl -v -H "Authorization: Bearer YOUR_TOKEN" \
  "https://id.who.int/icd/entity/search?q=diabetes"
```

#### HTTP Request Debugging
```typescript
// Add request/response interceptors
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { tap } from 'rxjs/operators';

@Injectable()
export class DebugHttpService {
  constructor(private readonly httpService: HttpService) {}

  get(url: string, config?: any) {
    console.log(`HTTP GET: ${url}`, config);
    
    return this.httpService.get(url, config).pipe(
      tap({
        next: (response) => {
          console.log(`HTTP Response [${response.status}]:`, {
            url,
            data: response.data,
            headers: response.headers,
          });
        },
        error: (error) => {
          console.error(`HTTP Error:`, {
            url,
            status: error.response?.status,
            data: error.response?.data,
          });
        },
      })
    );
  }
}
```

### Performance Debugging

#### Frontend Performance
```typescript
// Performance profiling
const ProfiledComponent = React.memo(() => {
  const renderStart = performance.now();
  
  useEffect(() => {
    const renderEnd = performance.now();
    console.log(`Component render time: ${renderEnd - renderStart}ms`);
  });

  return <div>Component content</div>;
});

// Bundle analysis
npm run analyze  // In frontend package
```

#### Backend Performance
```typescript
// Add timing middleware
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TimingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} - ${duration}ms`);
    });
    
    next();
  }
}
```

## Contributing Guidelines

### Getting Started

#### Fork and Clone
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/icd11-nextjs-nestjs-boilerplate.git
cd icd11-nextjs-nestjs-boilerplate

# Add upstream remote
git remote add upstream https://github.com/alirezarezvani/icd11-nextjs-nestjs-boilerplate.git

# Verify remotes
git remote -v
```

#### Development Setup
```bash
# Install dependencies
npm install

# Copy environment files
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.local.example packages/frontend/.env.local

# Configure environment variables
# Edit .env files with your WHO API credentials

# Start development servers
npm run dev
```

### Contribution Process

#### 1. Find or Create an Issue
- Check existing issues for bugs or feature requests
- Create new issue if needed with clear description
- Get issue assigned to you before starting work

#### 2. Create Feature Branch
```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

#### 3. Make Changes
- Follow coding standards and conventions
- Write tests for new functionality
- Update documentation as needed
- Ensure all tests pass

#### 4. Commit Changes
```bash
# Stage changes
git add .

# Commit with conventional commit format
git commit -m "feat(scope): add new search filters

- Add date range filter
- Add category filter
- Update search UI components

Closes #123"
```

#### 5. Submit Pull Request
```bash
# Push feature branch
git push origin feature/your-feature-name

# Create pull request on GitHub
# Fill out PR template
# Request review from maintainers
```

### Pull Request Guidelines

#### PR Template
```markdown
## Description
Brief description of the changes and their purpose.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing
- [ ] End-to-end tests

## Checklist
- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing tests pass locally with my changes

## Screenshots (if applicable)
Add screenshots to show UI changes.

## Related Issues
Closes #issue_number
```

#### Code Review Process
1. **Self Review**: Review your own code before submitting
2. **Automated Checks**: Ensure CI/CD pipeline passes
3. **Peer Review**: Address feedback from reviewers
4. **Maintainer Review**: Final review by project maintainers
5. **Merge**: Squash and merge after approval

### Code Quality Standards

#### Pre-commit Hooks
```bash
# Install pre-commit hooks
npm install -g husky
npm run prepare

# Hooks will run automatically on commit
# - ESLint
# - Prettier
# - TypeScript compilation
# - Unit tests
```

#### Quality Checks
```bash
# Run all quality checks
npm run lint          # ESLint
npm run type-check     # TypeScript
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npm run format         # Prettier
```

### Documentation Contributions

#### Documentation Standards
- Use clear, concise language
- Include code examples
- Keep documentation up-to-date with code changes
- Follow existing documentation structure

#### Documentation Types
- **API Documentation**: JSDoc comments in code
- **User Guides**: Markdown files in `docs/` directory
- **README Files**: Package-specific documentation
- **Code Comments**: Inline explanations for complex logic

### Issue Reporting

#### Bug Reports
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. iOS]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]
 - Node.js version
 - npm version

**Additional context**
Add any other context about the problem here.
```

#### Feature Requests
```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### Community Guidelines

#### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help newcomers learn and contribute
- Follow project guidelines and conventions

#### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community discussions
- **Pull Requests**: Code review and collaboration

## Release Process

### Versioning Strategy

We follow [Semantic Versioning (SemVer)](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

#### Version Examples
```bash
1.0.0 → 1.0.1  # Patch release (bug fix)
1.0.1 → 1.1.0  # Minor release (new feature)
1.1.0 → 2.0.0  # Major release (breaking change)
```

### Release Workflow

#### 1. Prepare Release
```bash
# Update main branch
git checkout main
git pull upstream main

# Create release branch
git checkout -b release/v1.2.0

# Update version numbers
npm version minor  # or major/patch

# Update changelog
npm run changelog

# Commit changes
git commit -m "chore: prepare release v1.2.0"
```

#### 2. Create Release PR
```bash
# Push release branch
git push origin release/v1.2.0

# Create PR to main
# Title: "Release v1.2.0"
# Description: Include changelog and breaking changes
```

#### 3. Merge and Tag
```bash
# After PR approval, merge to main
git checkout main
git pull upstream main

# Create and push tag
git tag v1.2.0
git push upstream v1.2.0
```

#### 4. Publish Packages
```bash
# Publish CLI package
cd packages/cli
npm publish

# Create GitHub release
gh release create v1.2.0 \
  --title "Release v1.2.0" \
  --notes-file CHANGELOG.md
```

### Changelog Management

#### Conventional Commits to Changelog
```bash
# Generate changelog from commits
npx conventional-changelog -p angular -i CHANGELOG.md -s

# Or use automatic changelog generation in CI
```

#### Changelog Format
```markdown
# Changelog

## [1.2.0] - 2024-01-15

### Added
- New search filters for ICD-11 entities
- Support for WHO API v2
- Docker Compose development environment

### Changed
- Updated dependency versions
- Improved error handling in search service

### Fixed
- Fixed Redis connection timeout issue
- Corrected pagination in search results

### Deprecated
- Legacy API endpoints (will be removed in v2.0.0)

### Security
- Updated vulnerable dependencies
```

## Troubleshooting

### Common Development Issues

#### Node.js Version Issues
```bash
# Check Node.js version
node --version

# Install specific version with nvm
nvm install 18
nvm use 18

# Or with n
n 18
```

#### Package Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use specific npm version
npm install -g npm@8
```

#### TypeScript Compilation Issues
```bash
# Clear TypeScript cache
npx tsc --build --clean

# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Check TypeScript version
npx tsc --version
```

#### Redis Connection Issues
```bash
# Check Redis status
redis-cli ping

# Start Redis server
redis-server

# Check Redis logs
redis-cli monitor

# Docker Redis
docker logs healthcare-redis
```

#### WHO API Issues
```bash
# Test API credentials
curl -X POST "https://icdaccessmanagement.who.int/connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=$ICD11_CLIENT_ID&client_secret=$ICD11_CLIENT_SECRET&scope=icdapi_access&grant_type=client_credentials"

# Check rate limits
curl -I "https://id.who.int/icd/entity/search?q=test"
```

### Development Environment Issues

#### Port Conflicts
```bash
# Check what's using port 3000
lsof -i :3000

# Kill process using port
kill -9 $(lsof -t -i:3000)

# Use different port
PORT=3001 npm run dev
```

#### Docker Issues
```bash
# Check Docker status
docker info

# Restart Docker
sudo systemctl restart docker  # Linux
# Or restart Docker Desktop

# Clean Docker system
docker system prune -a
```

#### Environment Variable Issues
```bash
# Check environment variables
printenv | grep ICD11

# Verify .env file loading
console.log(process.env.ICD11_CLIENT_ID);

# Use dotenv for debugging
require('dotenv').config({ debug: true });
```

### Performance Issues

#### Slow Development Server
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# Disable source maps temporarily
GENERATE_SOURCEMAP=false npm run dev

# Clear Next.js cache
rm -rf .next
```

#### Slow Tests
```bash
# Run tests in parallel
npm run test -- --maxWorkers=4

# Run specific test file
npm run test -- search.test.ts

# Skip slow tests
npm run test -- --testNamePattern="^(?!.*slow)"
```

### Getting Help

#### Documentation Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [WHO ICD-11 API Documentation](https://icd.who.int/icdapi/docs2/)

#### Community Support
- **GitHub Discussions**: Ask questions and get help from the community
- **GitHub Issues**: Report bugs and request features
- **Stack Overflow**: Tag questions with `icd11` and `healthcare`

#### Contributing Back
- Report bugs you encounter
- Suggest improvements
- Contribute documentation fixes
- Help answer questions from other developers

This development guide provides comprehensive information for contributing to the ICD-11 Healthcare Boilerplate Platform. By following these guidelines, you'll be able to effectively develop, test, and contribute to the project while maintaining high code quality and consistency.