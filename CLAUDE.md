# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a full-stack ICD-11 medical code search application with:
- **Frontend**: Next.js 13 with TypeScript, Material UI, React Context for state management
- **Backend**: NestJS with TypeScript, Redis caching, Swagger documentation
- **External API**: WHO ICD-11 API integration with OAuth2 authentication
- **Caching**: Redis for WHO API response caching with TTL strategies

### Key Modules
- `frontend/`: Next.js application with pages, components, hooks, and services
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
- **Modular NestJS structure**: Each feature has its own module (ICD11Module, CacheModule)
- **Dependency injection**: Services are injected through NestJS DI container
- **DTO validation**: Use class-validator and class-transformer for request/response validation
- **Redis caching**: WHO API responses are cached with appropriate TTL
- **Error handling**: Global exception filters and logging interceptors

### Frontend Architecture  
- **Page-based routing**: Next.js file-system routing in `/pages` directory
- **Component composition**: Reusable components in `/components` with index exports
- **Custom hooks**: Business logic encapsulated in `/hooks` (useICD11Search, useSearch)
- **API services**: Centralized API client in `/services/api/`
- **Context for state**: React Context for global application state

### API Integration
- **WHO ICD-11 API**: OAuth2 authentication with client credentials flow
- **Rate limiting**: Respectful API usage with proper throttling
- **Circuit breaker pattern**: Graceful handling of API failures
- **Response normalization**: Consistent data structures across the application

## Environment Configuration

### Backend Environment (.env)
Required environment variables for WHO API integration:
- `ICD11_CLIENT_ID`: WHO API client ID
- `ICD11_CLIENT_SECRET`: WHO API client secret
- `REDIS_HOST`: Redis server host
- `REDIS_PORT`: Redis server port

### Frontend Environment (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:3003)

## Development Workflow

1. **Setup**: Run `npm run install:all` to install all dependencies
2. **Environment**: Configure `.env` files in both frontend and backend directories
3. **Development**: Use `npm run dev` from root to start both servers
4. **Testing**: Run tests from respective directories using npm scripts
5. **Linting**: Always run linters before committing changes

## API Documentation

When backend is running, Swagger documentation is available at:
`http://localhost:3003/api/docs`

## Important Notes

- **Port Configuration**: Backend runs on port 3003 (changed from default 3000)
- **Redis Required**: Redis must be running for caching functionality
- **WHO API Credentials**: Valid WHO ICD-11 API credentials required for functionality
- **TypeScript**: Full TypeScript coverage across frontend and backend
- **Docker Support**: Full Docker Compose setup available for development and production
- Add to memory. Never beautify the results of the coding tasks. Be honest on the progress on the tasks, subtasks and the project. Make sure, the documentation is always up to date.
- do not create new files, when there is an existing one there. Ensure you write in the correct file and update this file. If you have created a file make sure, it was necessary. If you create temporary files, ALWAYS DELETE THEM when they are not needed anymore.