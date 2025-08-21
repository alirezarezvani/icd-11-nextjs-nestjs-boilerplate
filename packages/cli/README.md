# create-icd11-app

A powerful CLI tool for creating production-ready ICD-11 healthcare applications with customizable branding, deployment options, and comprehensive development setup.

## 🚀 Quick Start

```bash
# Create a new ICD-11 healthcare application
npx create-icd11-app my-healthcare-app

# Or use with specific template
npx create-icd11-app my-app --template frontend-only

# Skip prompts and use defaults
npx create-icd11-app my-app --yes
```

## 🏥 What You Get

- **Full-Stack Application**: Next.js frontend + NestJS backend
- **WHO ICD-11 Integration**: Complete API integration with OAuth2
- **Healthcare Provider Branding**: Custom colors, logos, organization info
- **Production-Ready Deployment**: Docker, AWS, Azure, GCP templates
- **CI/CD Pipelines**: GitHub Actions and GitLab CI configurations
- **Redis Caching**: Optimized WHO API response caching
- **Type-Safe Development**: Full TypeScript coverage
- **Testing Setup**: Jest unit and integration tests
- **API Documentation**: Auto-generated Swagger/OpenAPI docs

## 📋 Templates

### 🏢 Full Stack (Default)
Perfect for healthcare organizations needing a complete solution:
- Next.js frontend with shadcn/ui components
- NestJS backend with WHO ICD-11 API integration
- Redis caching for optimal performance
- Docker containerization
- Full healthcare provider branding
- Production deployment configurations

```bash
npx create-icd11-app my-healthcare-platform
```

### 🎨 Frontend Only
Ideal for client-side applications or static deployments:
- Next.js application with ICD-11 search interface
- Mock API responses for development
- Healthcare provider branding
- Static deployment ready
- No backend dependencies

```bash
npx create-icd11-app my-frontend-app --template frontend-only
```

### 🔌 API Only
Perfect for microservices or backend-focused deployments:
- NestJS backend with WHO API integration
- Redis caching
- OpenAPI/Swagger documentation
- Docker containerization
- No frontend dependencies

```bash
npx create-icd11-app my-api-service --template api-only
```

### ⚡ Minimal
Quick development setup with essential features:
- Basic Next.js + NestJS setup
- Essential ICD-11 functionality
- Minimal dependencies
- Fast development start

```bash
npx create-icd11-app my-minimal-app --template minimal
```

## 🎨 Healthcare Provider Branding

The CLI provides comprehensive branding customization:

### Organization Settings
- **Organization Name**: Your healthcare provider name
- **Website URL**: Official organization website
- **Support Email**: Customer support contact

### Visual Branding
- **Primary Color**: Main brand color (hex format)
- **Secondary Color**: Accent brand color (hex format)
- **Logo Support**: Integration points for custom logos

### Example Configuration
```typescript
{
  organizationName: "Regional Medical Center",
  primaryColor: "#2e7d32",
  secondaryColor: "#ff9800",
  websiteUrl: "https://regional-medical.org",
  supportEmail: "support@regional-medical.org"
}
```

## 🔐 WHO ICD-11 API Setup

### Getting Credentials
1. Visit [WHO ICD-11 API Portal](https://icd.who.int/icdapi)
2. Register for an account
3. Create a new application
4. Get your Client ID and Client Secret

### Configuration Options
- **During CLI Setup**: Configure credentials interactively
- **After Project Creation**: Add to `.env` files manually
- **Environment Variables**: Set via deployment configuration

### API Features
- **OAuth2 Authentication**: Automatic token management
- **Rate Limiting**: Respectful API usage
- **Response Caching**: Redis-based caching with TTL
- **Error Handling**: Comprehensive error management
- **Circuit Breaker**: Graceful API failure handling

## 🗄️ Redis Configuration

### Docker Setup (Recommended)
The CLI automatically configures Redis with Docker:
```bash
# Automatic setup during CLI execution
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### Local Redis
Configure for existing Redis installations:
- **Host**: Redis server hostname
- **Port**: Redis server port (default: 6379)
- **Password**: Optional authentication

### Cache Strategy
- **Entity Caching**: WHO API responses cached for 1 hour
- **Search Results**: Cached for 30 minutes
- **Authentication Tokens**: Cached until expiration

## 🚀 Deployment Options

### Docker (Recommended)
Complete containerization with Docker Compose:
```bash
cd my-healthcare-app
docker-compose -f docker-compose.prod.yml up -d
```

Features:
- Multi-stage builds for optimization
- Health checks for all services
- Volume persistence for Redis
- Production-ready configuration

### AWS Deployment
Deploy to Amazon Web Services:
- **ECS**: Container orchestration
- **Fargate**: Serverless containers
- **Application Load Balancer**: Traffic distribution
- **RDS**: Managed database options

Generated files:
- `aws/task-definition.json`
- `aws/cloudformation.json`
- `aws/deploy-aws.sh`

### Azure Deployment
Deploy to Microsoft Azure:
- **Container Apps**: Modern container platform
- **Azure Redis Cache**: Managed Redis
- **Application Gateway**: Load balancing

Generated files:
- `azure/container-app-template.json`
- `azure/deploy-azure.sh`

### Google Cloud Platform
Deploy to Google Cloud:
- **Cloud Run**: Serverless containers
- **Cloud Build**: CI/CD integration
- **Memorystore**: Managed Redis

Generated files:
- `gcp/cloud-run.yaml`
- `gcp/deploy-gcp.sh`

## 🔄 CI/CD Integration

### GitHub Actions
Comprehensive CI/CD pipeline with:
- **Testing**: Unit, integration, and e2e tests
- **Security**: Code analysis and vulnerability scanning
- **Building**: Docker image creation
- **Deployment**: Automatic deployment on merge

Pipeline features:
- Multi-environment support (dev, staging, production)
- Secrets management for credentials
- Slack notifications for deployment status
- Rollback capabilities

### GitLab CI
GitLab CI/CD integration with:
- Pipeline stages: test, build, deploy
- Docker registry integration
- Environment-specific deployments
- Monitoring and alerting

## 📊 Project Structure

```
my-healthcare-app/
├── packages/
│   ├── frontend/               # Next.js application
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Next.js pages
│   │   ├── services/          # API service layer
│   │   ├── config/            # Configuration files
│   │   └── styles/            # CSS and styling
│   ├── backend/               # NestJS API server
│   │   ├── src/
│   │   │   ├── icd11/         # ICD-11 module
│   │   │   ├── cache/         # Redis caching
│   │   │   └── common/        # Shared utilities
│   │   └── test/              # Test files
│   └── shared/                # Shared TypeScript types
├── docker/                    # Docker deployment files
├── aws/                       # AWS deployment files
├── .github/workflows/         # GitHub Actions
├── docker-compose.yml         # Development setup
└── docker-compose.prod.yml    # Production setup
```

## 🔧 Development Commands

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Type check
npm run type-check
```

## 🌐 Environment Variables

### Backend (.env)
```bash
# WHO ICD-11 API
ICD11_CLIENT_ID=your_client_id
ICD11_CLIENT_SECRET=your_client_secret

# API Configuration
PORT=3003
CORS_ORIGINS=http://localhost:3000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Organization
ORG_NAME=Your Healthcare Organization
ORG_WEBSITE=https://your-website.com
SUPPORT_EMAIL=support@your-website.com
```

### Frontend (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3003/api

# Application
NEXT_PUBLIC_APP_NAME=Your Healthcare App
NEXT_PUBLIC_PROJECT_NAME=your-app-name

# Branding
NEXT_PUBLIC_PRIMARY_COLOR=#1976d2
NEXT_PUBLIC_SECONDARY_COLOR=#dc004e
```

## 🧪 Testing

### Backend Testing
```bash
cd packages/backend
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Coverage report
```

### Frontend Testing
```bash
cd packages/frontend
npm run test          # Jest tests
npm run test:watch    # Watch mode
```

## 📚 API Documentation

Access comprehensive API documentation:
- **Development**: http://localhost:3003/api/docs
- **Production**: https://your-domain.com/api/docs

Features:
- Interactive Swagger UI
- OpenAPI 3.0 specification
- Request/response examples
- Authentication documentation

## 🔍 Troubleshooting

### Common Issues

#### WHO API Connection
```bash
# Check credentials
curl -X POST "https://icdaccessmanagement.who.int/connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&scope=icdapi_access&grant_type=client_credentials"
```

#### Redis Connection
```bash
# Test Redis connection
redis-cli ping
# Should return: PONG

# Check Redis logs
docker logs redis
```

#### Docker Issues
```bash
# Restart Docker services
docker-compose down && docker-compose up -d

# Check service logs
docker-compose logs -f [service-name]

# Check service health
docker-compose ps
```

### Support

- **GitHub Issues**: [Create an issue](https://github.com/your-repo/create-icd11-app/issues)
- **Documentation**: [Full documentation](https://create-icd11-app.docs.com)
- **Community**: [Discord server](https://discord.gg/icd11-healthcare)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Clone the repository
git clone https://github.com/your-repo/create-icd11-app.git

# Install dependencies
npm install

# Build the CLI
npm run build

# Test locally
node dist/cli.js test-app
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **WHO ICD-11**: World Health Organization for the ICD-11 API
- **Healthcare Community**: Healthcare providers and developers who provided feedback
- **Open Source Libraries**: All the amazing open source projects that make this possible

---

**Create modern, production-ready ICD-11 healthcare applications with confidence.**

Made with ❤️ for the healthcare community.