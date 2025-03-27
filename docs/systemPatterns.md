# System Patterns: ICD-11 Search Application

## System Architecture

### Overall Architecture
The ICD-11 Search Application follows a modern full-stack architecture with clear separation of concerns:

```
[Client Browser] <--> [Next.js Frontend] <--> [NestJS Backend API] <--> [WHO ICD-11 API]
                                                      |
                                                      v
                                                [Redis Cache]
```

### Key Components

#### Frontend (Next.js)
- **Client-Side Rendering**: For dynamic search interfaces
- **Server-Side Rendering**: For initial page load and SEO optimization
- **Static Generation**: For static content and documentation
- **API Routes**: For lightweight backend functionality when needed

#### Backend (NestJS)
- **Controller Layer**: Handles HTTP requests and responses
- **Service Layer**: Contains business logic and external API interactions
- **Cache Layer**: Manages interaction with Redis
- **DTO Layer**: Defines data transfer objects for type safety

#### Caching (Redis)
- **Request Caching**: Stores WHO API responses
- **Search Result Caching**: Improves performance for common searches
- **TTL Strategy**: Implements appropriate time-to-live for different data types

### Data Flow

1. **Search Request Flow**:
   ```
   User Search → Next.js Frontend → NestJS API → Check Redis Cache
                                                   ↙           ↘
                                       Return Cached Data    Call WHO API
                                                               ↓
                                                         Store in Cache
                                                               ↓
                                                        Return Results
   ```

2. **Entity Detail Flow**:
   ```
   Request Details → Next.js Frontend → NestJS API → Check Redis Cache
                                                      ↙           ↘
                                          Return Cached Data    Call WHO API
                                                                  ↓
                                                            Store in Cache
                                                                  ↓
                                                           Return Results
   ```

## Design Patterns

### Frontend Patterns
- **Container/Presentation Pattern**: Separate data fetching from UI rendering
- **Custom Hooks**: Encapsulate reusable logic
- **Context API**: Manage global state when needed
- **Static Typing**: Use TypeScript interfaces for all data structures
- **Responsive Design**: Mobile-first approach with flexible layouts

### Backend Patterns
- **Dependency Injection**: NestJS built-in DI for services and components
- **Repository Pattern**: Abstract data access operations
- **Decorator Pattern**: Use NestJS decorators for route handling, validation, etc.
- **Strategy Pattern**: For different caching strategies
- **Interceptors**: For cross-cutting concerns like logging, error handling

### API Integration Patterns
- **Circuit Breaker**: Handle WHO API failures gracefully
- **Retry Strategy**: Implement exponential backoff for failed requests
- **Rate Limiting**: Respect WHO API limits
- **Adapter Pattern**: Abstract WHO API specifics

### Caching Patterns
- **LRU Cache**: Least Recently Used eviction policy
- **Time-Based Expiration**: Different TTLs based on data volatility
- **Write-Through**: Update cache when data is fetched
- **Background Refresh**: Preemptively refresh cache for popular items

## Architectural Principles

1. **Separation of Concerns**: Clear boundaries between frontend, backend, and caching layers
2. **TypeScript Throughout**: Maintain type safety across the entire stack
3. **API-First Development**: Well-defined API contracts between all components
4. **Progressive Enhancement**: Core functionality works without JavaScript
5. **Performance by Default**: Optimize for speed at all layers
6. **Resilience**: System remains operational during partial outages
7. **Stateless Design**: Facilitate horizontal scaling where needed
8. **Observability**: Comprehensive logging, monitoring, and error tracking

## Technical Decisions

1. **Next.js for Frontend**: Chosen for its SSR/SSG capabilities, routing, and TypeScript support
2. **NestJS for Backend**: Selected for its structured architecture, TypeScript integration, and module system
3. **Redis for Caching**: Optimal for high-performance, in-memory data caching with TTL support
4. **REST API Design**: Clean, resource-oriented API endpoints
5. **Container Deployment**: Docker-based deployment for consistency across environments 