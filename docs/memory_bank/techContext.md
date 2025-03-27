# Technical Context

## System Architecture

### Frontend (Next.js)
- **Framework**: Next.js with TypeScript
- **UI Library**: Material UI
- **State Management**: React Context
- **Port**: 3000
- **Environment**: 
  - Development: .env.local
  - Production: .env.production
  - Docker: Environment variables in docker-compose.yml

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Port**: 3003
- **Features**:
  - WHO ICD-11 API integration
  - Redis caching
  - Rate limiting
  - Error handling
  - Swagger documentation
- **Environment**:
  - Development: .env
  - Production: .env.production
  - Docker: Environment variables in docker-compose.yml

### Caching Layer (Redis)
- **Version**: Redis 7
- **Port**: 6379
- **Features**:
  - Persistent storage
  - Configurable TTL
  - Error resilience
  - Docker volume support

## Development Environment

### Required Tools
- Node.js 18+
- npm or yarn
- Docker and Docker Compose
- Redis (local or containerized)
- Git

### IDE Configuration
- TypeScript support
- ESLint integration
- Prettier integration

### Development Workflow
1. Local Development
   ```bash
   # Backend
   cd backend && npm run start:dev
   
   # Frontend
   cd frontend && npm run dev
   ```

2. Docker Development
   ```bash
   docker-compose up -d
   ```

## API Integration

### WHO ICD-11 API
- Base URL: https://id.who.int/icd/release/11
- Authentication: OAuth2
- Rate Limits: Configured in backend
- Caching Strategy: Redis with TTL

### Internal API
- Base URL: http://localhost:3003/api
- Documentation: Swagger UI at /api/docs
- Rate Limiting: Implemented
- Error Handling: Standardized responses

## Security Measures

### Authentication
- WHO API credentials in .env
- No user authentication required currently

### Data Protection
- CORS configuration
- Rate limiting
- Input validation
- Error sanitization

## Performance Optimization

### Caching Strategy
- Redis for WHO API responses
- Configurable TTL
- Cache invalidation on updates

### Frontend Optimization
- Server-side rendering where beneficial
- Client-side caching
- Bundle optimization

### Backend Optimization
- Response compression
- Efficient database queries
- Rate limiting
- Load balancing ready

## Monitoring and Logging

### Planned Implementation
- Error tracking
- Performance monitoring
- API usage metrics
- Cache hit/miss rates

## Deployment

### Docker Configuration
- Multi-container setup
- Volume persistence
- Environment isolation
- Network configuration

### Scaling Considerations
- Horizontal scaling ready
- Cache sharing
- Load balancing ready
- Health checks

## Testing Strategy

### Planned Implementation
- Unit tests
- Integration tests
- End-to-end tests
- Performance tests

## Documentation

### API Documentation
- Swagger UI
- OpenAPI specification
- Postman collection (planned)

### Code Documentation
- TypeScript types
- JSDoc comments
- README files
- Architecture diagrams (planned) 