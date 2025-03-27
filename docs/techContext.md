# Technical Context: ICD-11 Search Application

## Technology Stack

### Frontend
- **Framework**: Next.js
- **Language**: TypeScript
- **State Management**: React Context API / hooks
- **Styling**: CSS-in-JS (styled-components/emotion)
- **Testing**: Jest, React Testing Library
- **Build Tools**: Webpack (via Next.js)

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **API Style**: REST
- **Testing**: Jest, Supertest
- **Documentation**: Swagger (via NestJS OpenAPI)

### Caching Layer
- **Technology**: Redis
- **Pattern**: Key-value store with TTL

### Infrastructure
- **Containerization**: Docker
- **Deployment**: Container-based deployment
- **CI/CD**: Automated pipelines (TBD)

## Development Environment

### Requirements
- Node.js v18.x or higher
- npm or yarn
- Redis instance
- WHO API credentials

### Local Setup
1. Clone repository
2. Configure environment variables (.env files)
3. Install dependencies for frontend and backend
4. Start development servers

### Environment Variables

#### Frontend (.env.example)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Backend (.env.example)
```
WHO_API_CLIENT_ID=
WHO_API_CLIENT_SECRET=
REDIS_HOST=redis
REDIS_PORT=6379
```

## External Dependencies

### WHO ICD-11 API
- **Base URL**: https://id.who.int/icd/release/11/
- **Authentication**: OAuth2 client credentials
- **Rate Limiting**: Yes (limits TBD)
- **Documentation**: https://icd.who.int/icdapi

### Redis
- **Purpose**: Caching layer for WHO API responses
- **Configuration**: Single instance for development
- **Key Structure**: Prefix-based namespacing

## Security Requirements

### API Security
- **Authentication**: OAuth2 for WHO API
- **Rate Limiting**: Implement to prevent abuse
- **Input Validation**: Strict validation on all endpoints

### Frontend Security
- **Content Security Policy**: Restrict resource loading
- **HTTPS Only**: Enforce secure connections
- **Cross-Site Scripting (XSS) Prevention**: Output encoding, Content-Security-Policy

### Data Security
- **No PII Storage**: Application does not store personal data
- **Cache Security**: Implement secure Redis configuration
- **Secure Headers**: HTTP security headers on all responses

## Technical Constraints

### WHO API Limitations
- Rate limiting restrictions
- Authentication requirements
- Response format constraints

### Performance Requirements
- Search results under 500ms
- Page load time under 1.5s
- Efficient caching to minimize WHO API calls

### Browser Compatibility
- Support for modern browsers (last 2 versions)
- Graceful degradation for older browsers

## Technical Debt Management

### Initial Known Debt
- Boilerplate structure needs expansion
- Test coverage to be implemented
- Containerization to be completed
- CI/CD pipeline to be established

### Debt Management Strategy
- Regular technical debt review sessions
- Debt ceiling policies to limit accumulation
- Refactoring integrated into development cycle

## Monitoring and Observability

### Logging
- Structured logging format
- Error tracking integration (TBD)
- Log aggregation solution (TBD)

### Performance Monitoring
- API response time tracking
- Cache hit/miss ratio monitoring
- WHO API call volume tracking

### Alerting
- Critical error alerting
- Performance degradation alerts
- WHO API availability monitoring 