# Technical Context

## Current Technical Stack

### Backend (NestJS)
- NestJS framework with TypeScript
- WHO ICD-11 API integration with OAuth2
- Built-in caching using @nestjs/cache-manager
- Axios for HTTP requests with proper error handling
- Type-safe DTOs and interfaces
- Environment-based configuration
- Port: 3003 (changed from 3001)

### Frontend (Next.js)
- Next.js with TypeScript
- React hooks for state management
- Tailwind CSS for styling
- Type-safe API integration
- Environment-based configuration
- Port: 3000

### Infrastructure
- Docker containerization
- Redis for caching
- Environment-based configuration
- Port mapping and network configuration

## API Integration

### WHO ICD-11 API
- OAuth2 authentication
- Token management with caching
- API version: v2
- Endpoints:
  - /icdapi/release/11/2024-01/mms/search
  - /icdapi/entity/{id}
  - /icdapi/entity/{id}/children

### Internal API Structure
- RESTful endpoints
- Type-safe request/response handling
- Proper error handling and logging
- Caching layer for performance
- Rate limiting compliance

## Type System

### Backend Types
- DTOs for request validation
- Interfaces for WHO API responses
- Entity mappings for type safety
- Cache interfaces for type-safe caching
- Common interfaces for shared types

### Frontend Types
- Type-safe API client
- Component prop types
- Context types for state management
- Shared interfaces with backend

## Caching Strategy
- Redis cache for API responses
- In-memory caching for frequently accessed data
- Token caching for WHO API
- Cache invalidation strategy
- TTL-based cache management

## Error Handling
- Global error handling
- Type-safe error responses
- HTTP exception filters
- Frontend error boundaries
- Logging and monitoring

## Configuration Management
- Environment-based configuration
- Docker environment variables
- Type-safe configuration
- Secure credential management

## Development Workflow
- TypeScript for type safety
- ESLint for code quality
- Git for version control
- Docker for containerization
- Environment-based configuration

## Security Considerations
- OAuth2 token management
- Secure credential storage
- HTTPS enforcement
- Rate limiting
- Input validation
- CORS configuration

## Performance Optimization
- Redis caching
- Response compression
- Bundle optimization
- Code splitting
- Lazy loading

## Monitoring and Logging
- Request logging
- Error tracking
- Performance monitoring
- Cache hit/miss tracking
- API response time monitoring

## Future Technical Considerations
1. Implement GraphQL API
2. Add WebSocket support
3. Implement service worker
4. Add PWA capabilities
5. Implement automated testing
6. Add CI/CD pipeline
7. Implement monitoring dashboard 