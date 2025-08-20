# Technical Architecture Guide

This document provides a comprehensive overview of the ICD-11 Healthcare Boilerplate Platform architecture, design decisions, and technical implementation details.

## System Overview

The ICD-11 Healthcare Platform is designed as a modern, cloud-native, microservices-oriented system that provides a robust foundation for building healthcare applications with WHO ICD-11 integration.

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                 Healthcare Platform                               │
├──────────────────────────────────────────────────────────────────────────────────┤
│                           Presentation Layer                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Web Client    │  │  Mobile Client  │  │   Admin Panel   │  │  Third-Party │ │
│  │   (Next.js)     │  │    (Future)     │  │    (Future)     │  │ Integrations │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────┤
│                              API Gateway                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Authentication  │  │ Rate Limiting   │  │ Request Routing │  │   Logging    │ │
│  │   & Security    │  │   & Throttling  │  │ & Load Balancing│  │  & Monitoring│ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────┤
│                            Business Logic Layer                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │    ICD-11       │  │     Cache       │  │    Search       │  │    Audit     │ │
│  │   Service       │  │    Service      │  │   Service       │  │   Service    │ │
│  │   (NestJS)      │  │   (Redis)       │  │   (Future)      │  │   (Future)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────┤
│                             Data Access Layer                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  WHO ICD-11     │  │   Redis Cache   │  │   PostgreSQL    │  │  File System │ │
│  │     API         │  │    Instance     │  │   (Future)      │  │   Storage    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────┤
│                          Infrastructure Layer                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │     Docker      │  │   Kubernetes    │  │  Cloud Services │  │    CI/CD     │ │
│  │  Containerization│  │  Orchestration  │  │ (AWS/Azure/GCP) │  │   Pipeline   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend Architecture (Next.js)

#### Technology Stack
- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript for type safety
- **UI Library**: shadcn/ui components built on Radix UI
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: React Context + React Query
- **Form Handling**: React Hook Form with Zod validation

#### Directory Structure
```
packages/frontend/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (buttons, inputs, etc.)
│   ├── Layout.tsx       # Page layout wrapper
│   ├── SearchForm.tsx   # ICD-11 search interface
│   ├── SearchResults.tsx # Search results display
│   ├── Breadcrumb/      # Navigation breadcrumbs
│   └── ChildrenBrowser/ # Hierarchical code browser
├── pages/               # Next.js pages (file-based routing)
│   ├── _app.tsx         # App configuration
│   ├── index.tsx        # Homepage
│   ├── search.tsx       # Search page
│   ├── about.tsx        # About page
│   └── entity/[id].tsx  # Dynamic entity details page
├── context/             # React Context providers
│   ├── ICD11Context.tsx # ICD-11 state management
│   └── index.ts         # Context exports
├── hooks/               # Custom React hooks
│   ├── useICD11Search.ts # ICD-11 search logic
│   ├── useSearch.ts     # Generic search functionality
│   └── index.ts         # Hook exports
├── services/            # API service layer
│   ├── api/             # API client implementation
│   │   ├── client.ts    # Base HTTP client
│   │   ├── icd11.service.ts # ICD-11 API endpoints
│   │   └── types.ts     # API type definitions
│   └── apiClient.ts     # Legacy API client
├── config/              # Configuration constants
├── lib/                 # Utility libraries
├── styles/              # Global styles
└── types/               # TypeScript type definitions
```

#### Key Design Patterns

**1. Component Composition**
```typescript
// Example: Composable search interface
<SearchForm onSearch={handleSearch}>
  <SearchInput placeholder="Search ICD-11 codes..." />
  <SearchFilters />
  <SearchButton />
</SearchForm>

<SearchResults results={searchResults}>
  <SearchResultItem />
  <Pagination />
</SearchResults>
```

**2. Custom Hooks for Business Logic**
```typescript
// useICD11Search.ts - Encapsulates search functionality
export const useICD11Search = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['icd11-search', query, filters],
    queryFn: () => icd11Service.search(query, filters),
    enabled: query.length > 2
  });

  return {
    query, setQuery,
    filters, setFilters,
    results: data,
    isLoading,
    error
  };
};
```

**3. Context-Based State Management**
```typescript
// ICD11Context.tsx - Global ICD-11 state
export const ICD11Context = createContext<ICD11ContextType>({
  currentEntity: null,
  breadcrumbs: [],
  searchHistory: [],
  // ... other state
});

export const useICD11 = () => {
  const context = useContext(ICD11Context);
  if (!context) {
    throw new Error('useICD11 must be used within ICD11Provider');
  }
  return context;
};
```

### 2. Backend Architecture (NestJS)

#### Technology Stack
- **Framework**: NestJS with Express
- **Language**: TypeScript
- **Validation**: Class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with Supertest
- **Caching**: Redis integration

#### Directory Structure
```
packages/backend/
├── src/
│   ├── app.module.ts        # Root application module
│   ├── main.ts              # Application entry point
│   ├── icd11/               # ICD-11 business logic
│   │   ├── icd11.module.ts
│   │   ├── icd11.controller.ts
│   │   ├── icd11.service.ts
│   │   ├── dto/             # Data Transfer Objects
│   │   │   └── search.dto.ts
│   │   ├── interfaces/      # TypeScript interfaces
│   │   │   └── icd11.interface.ts
│   │   └── who.interfaces.ts # WHO API types
│   ├── cache/               # Caching module
│   │   ├── cache.module.ts
│   │   ├── cache.service.ts
│   │   └── interfaces/
│   │       └── cache.interface.ts
│   ├── common/              # Shared utilities
│   │   ├── dto/             # Common DTOs
│   │   ├── exceptions/      # Custom exceptions
│   │   ├── filters/         # Exception filters
│   │   ├── guards/          # Authentication guards
│   │   ├── interceptors/    # Request/response interceptors
│   │   ├── middleware/      # Custom middleware
│   │   └── utils/           # Utility functions
│   ├── config/              # Configuration management
│   │   ├── env.config.ts    # Environment variables
│   │   └── index.ts
│   └── test/                # Test files
└── package.json
```

#### Key Design Patterns

**1. Modular Architecture**
```typescript
// icd11.module.ts - Feature module
@Module({
  imports: [CacheModule],
  controllers: [ICD11Controller],
  providers: [ICD11Service],
  exports: [ICD11Service]
})
export class ICD11Module {}
```

**2. Dependency Injection**
```typescript
// icd11.service.ts - Business logic service
@Injectable()
export class ICD11Service {
  constructor(
    private readonly cacheService: CacheService,
    private readonly httpService: HttpService
  ) {}

  async search(query: string, options: SearchOptions): Promise<SearchResult[]> {
    const cacheKey = `search:${query}:${JSON.stringify(options)}`;
    
    // Try cache first
    const cached = await this.cacheService.get<SearchResult[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from WHO API
    const results = await this.fetchFromWHO(query, options);
    
    // Cache results
    await this.cacheService.set(cacheKey, results, 1800); // 30 minutes
    
    return results;
  }
}
```

**3. DTO Validation**
```typescript
// search.dto.ts - Input validation
export class SearchDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({ description: 'Search query', example: 'diabetes' })
  q: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: 'Result limit', example: 10 })
  limit?: number = 10;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: 'Result offset', example: 0 })
  offset?: number = 0;
}
```

**4. Exception Handling**
```typescript
// all-exceptions.filter.ts - Global exception handler
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: exception.stack })
    };

    response.status(status).json(errorResponse);
  }
}
```

### 3. Caching Layer (Redis)

#### Caching Strategy
```typescript
// cache.service.ts - Redis abstraction
@Injectable()
export class CacheService implements CacheInterface {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis
  ) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null; // Graceful degradation
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

#### Cache Patterns
- **Search Results**: TTL 30 minutes
- **Entity Details**: TTL 1 hour
- **WHO Authentication Tokens**: TTL based on token expiration
- **Application Configuration**: TTL 24 hours

### 4. WHO ICD-11 API Integration

#### Authentication Flow
```typescript
// WHO OAuth2 implementation
class WHOAuthService {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  async getAccessToken(): Promise<string> {
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    const response = await this.httpService.post(
      'https://icdaccessmanagement.who.int/connect/token',
      new URLSearchParams({
        client_id: this.configService.get('ICD11_CLIENT_ID'),
        client_secret: this.configService.get('ICD11_CLIENT_SECRET'),
        scope: 'icdapi_access',
        grant_type: 'client_credentials'
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    this.token = response.data.access_token;
    this.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);

    return this.token;
  }
}
```

#### Rate Limiting and Circuit Breaker
```typescript
// Resilient WHO API client
class WHOApiClient {
  private readonly circuitBreaker = new CircuitBreaker(this.makeRequest.bind(this), {
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
  });

  async search(query: string): Promise<any> {
    return this.circuitBreaker.fire({
      method: 'GET',
      url: `https://id.who.int/icd/entity/search?q=${encodeURIComponent(query)}`,
      headers: {
        'Authorization': `Bearer ${await this.getAccessToken()}`,
        'Accept': 'application/json',
        'API-Version': 'v2'
      }
    });
  }

  private async makeRequest(config: any): Promise<any> {
    // Add retry logic, exponential backoff
    return await this.httpService.request(config).toPromise();
  }
}
```

## Data Flow Architecture

### Search Request Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───▶│  Frontend   │───▶│   Backend   │───▶│    Redis    │
│  (Browser)  │    │  (Next.js)  │    │  (NestJS)   │    │   (Cache)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                              │                   │
                                              │         Cache Miss│
                                              ▼                   │
                                     ┌─────────────┐              │
                                     │  WHO ICD-11 │              │
                                     │     API     │              │
                                     └─────────────┘              │
                                              │                   │
                                              │         Cache Set │
                                              ▼                   ▼
                                     ┌─────────────┐    ┌─────────────┐
                                     │   Response  │───▶│  Response   │
                                     │ Processing  │    │   Client    │
                                     └─────────────┘    └─────────────┘
```

### Entity Retrieval Flow
```
1. Client requests entity details
2. Frontend validates entity ID format
3. Backend checks Redis cache for entity data
4. If cache miss:
   a. Authenticate with WHO API
   b. Fetch entity details from WHO
   c. Transform response data
   d. Cache result with TTL
5. Return formatted entity data to client
6. Frontend updates UI with entity details
```

## Security Architecture

### Authentication & Authorization
```typescript
// JWT-based authentication (future implementation)
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
```

### Input Validation & Sanitization
```typescript
// Comprehensive input validation
@Controller('icd11')
@UseGuards(ThrottlerGuard) // Rate limiting
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ICD11Controller {
  @Get('search')
  @ApiOperation({ summary: 'Search ICD-11 entities' })
  async search(@Query() searchDto: SearchDto): Promise<SearchResultDto[]> {
    // Input is automatically validated by class-validator
    return this.icd11Service.search(searchDto.q, searchDto);
  }
}
```

### Security Headers & CORS
```typescript
// Security configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://id.who.int"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

## Performance Optimization

### Frontend Optimization
1. **Code Splitting**: Next.js automatic code splitting
2. **Image Optimization**: Next.js Image component
3. **Static Generation**: ISR for static content
4. **Bundle Analysis**: Webpack bundle analyzer
5. **CDN Integration**: Static asset delivery

### Backend Optimization
1. **Redis Caching**: Multi-level caching strategy
2. **Connection Pooling**: HTTP agent keep-alive
3. **Compression**: gzip/deflate response compression
4. **Query Optimization**: Efficient WHO API queries
5. **Memory Management**: Proper garbage collection

### Database Optimization (Future)
1. **Connection Pooling**: PostgreSQL connection management
2. **Query Optimization**: Indexed search queries
3. **Read Replicas**: Distributed read operations
4. **Caching Layer**: Application-level caching

## Monitoring & Observability

### Logging Strategy
```typescript
// Structured logging with Winston
@Injectable()
export class LoggerService {
  private readonly logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' })
    ]
  });

  log(level: string, message: string, meta?: any) {
    this.logger.log(level, message, { ...meta, service: 'icd11-backend' });
  }
}
```

### Health Check Implementation
```typescript
// Health check endpoints
@Controller('health')
export class HealthController {
  constructor(
    private readonly cacheService: CacheService,
    private readonly httpService: HttpService
  ) {}

  @Get()
  async check(): Promise<HealthCheckResult> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        redis: await this.checkRedis(),
        whoApi: await this.checkWHOAPI(),
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
  }

  private async checkRedis(): Promise<ServiceHealth> {
    try {
      await this.cacheService.get('health-check');
      return { status: 'healthy', responseTime: Date.now() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}
```

### Metrics Collection
- **Application Metrics**: Response times, error rates, throughput
- **Infrastructure Metrics**: CPU, memory, disk, network
- **Business Metrics**: Search volume, popular codes, user patterns
- **WHO API Metrics**: Rate limits, response times, error rates

## Deployment Architecture

### Container Strategy
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3003
CMD ["npm", "run", "start:prod"]
```

### Kubernetes Deployment
```yaml
# k8s deployment configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: icd11-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: icd11-backend
  template:
    metadata:
      labels:
        app: icd11-backend
    spec:
      containers:
      - name: backend
        image: icd11-backend:latest
        ports:
        - containerPort: 3003
        env:
        - name: NODE_ENV
          value: "production"
        - name: REDIS_HOST
          value: "redis-service"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3003
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3003
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Scalability Considerations

### Horizontal Scaling
1. **Stateless Services**: All services designed to be stateless
2. **Load Balancing**: Distribute traffic across multiple instances
3. **Session Management**: Redis-based session storage
4. **Database Scaling**: Read replicas and sharding strategies

### Vertical Scaling
1. **Resource Optimization**: Efficient memory and CPU usage
2. **Connection Pooling**: Manage database connections
3. **Caching Layers**: Reduce database load
4. **Code Optimization**: Performance-critical code paths

### Auto-scaling Configuration
```yaml
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: icd11-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: icd11-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Future Architecture Enhancements

### Planned Improvements
1. **Microservices Migration**: Split into focused microservices
2. **Event-Driven Architecture**: Implement message queues and event streaming
3. **API Gateway**: Centralized API management and security
4. **Service Mesh**: Inter-service communication and observability
5. **FHIR Integration**: HL7 FHIR standard compliance
6. **Machine Learning**: AI-powered code suggestions and validation

### Technology Roadmap
- **Database**: PostgreSQL for persistent data
- **Message Queue**: Redis Streams or Apache Kafka
- **API Gateway**: Kong or AWS API Gateway
- **Service Mesh**: Istio for microservices communication
- **Monitoring**: Prometheus + Grafana stack
- **Tracing**: Jaeger for distributed tracing

This architecture provides a solid foundation for building scalable, maintainable, and performant ICD-11 healthcare applications while maintaining flexibility for future enhancements and healthcare industry requirements.