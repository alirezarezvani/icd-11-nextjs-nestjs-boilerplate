# ICD-11 Healthcare Boilerplate Platform

A comprehensive, production-ready platform for building modern ICD-11 healthcare applications. This platform combines a powerful CLI tool (`create-icd11-app`) with a complete full-stack application template, enabling healthcare organizations to rapidly deploy WHO ICD-11 compliant applications with professional branding and enterprise-grade infrastructure.

## Quick Start

### Using the CLI Tool (Recommended)

Create a new ICD-11 healthcare application in minutes:

```bash
npx create-icd11-app my-healthcare-app
```

The interactive wizard will guide you through:
- **Template Selection**: Full-stack, frontend-only, API-only, or minimal
- **Healthcare Branding**: Custom colors, logos, and organization details
- **WHO API Configuration**: Secure credential setup with validation
- **Deployment Options**: Docker, AWS, Azure, GCP with CI/CD pipelines
- **Development Setup**: Redis, testing, and development environment

[📚 Complete CLI Documentation](./docs/CLI.md)

### Direct Repository Usage

For developers who want to customize the platform itself:

```bash
git clone https://github.com/alirezarezvani/icd11-nextjs-nestjs-boilerplate.git
cd icd11-nextjs-nestjs-boilerplate
npm run install:all
npm run dev
```

## Platform Overview

### What is ICD-11?

The International Classification of Diseases, 11th Revision (ICD-11) is the World Health Organization's global standard for diagnostic information in health records and death certificates. This platform provides seamless integration with the WHO ICD-11 API, enabling healthcare applications to:

- **Search Medical Codes**: Fast, accurate ICD-11 code lookup
- **Navigate Hierarchies**: Browse the complete ICD-11 classification structure
- **Access Definitions**: Detailed descriptions and clinical guidance
- **Ensure Compliance**: WHO-validated medical coding standards

### Platform Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ICD-11 Healthcare Platform                   │
├─────────────────────────────────────────────────────────────────┤
│  CLI Tool (create-icd11-app)           │  Boilerplate Repo      │
│  ├── Interactive Setup Wizard          │  ├── Next.js Frontend  │
│  ├── Template Engine                   │  ├── NestJS Backend    │
│  ├── Branding System                   │  ├── Redis Caching     │
│  ├── Deployment Generators             │  ├── WHO API Client    │
│  └── CI/CD Pipeline Creation           │  └── TypeScript Types  │
├─────────────────────────────────────────────────────────────────┤
│              Multi-Cloud Deployment Support                     │
│  ├── Docker Compose                    │  ├── AWS ECS/Fargate   │
│  ├── Azure Container Apps              │  └── Google Cloud Run  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Features

#### 🏥 Healthcare-Focused
- **WHO ICD-11 Integration**: Complete API client with OAuth2 authentication
- **Medical Code Search**: Fast, accurate search with advanced filtering
- **Hierarchical Navigation**: Full support for ICD-11 structure and relationships
- **Clinical Definitions**: Detailed descriptions and usage guidelines
- **Compliance Ready**: Meet healthcare data standards and regulations

#### 🛠️ Developer Experience
- **Interactive CLI**: Guided setup with intelligent defaults
- **Multiple Templates**: Choose the right architecture for your needs
- **Hot Reloading**: Fast development with live code updates
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Testing Suite**: Comprehensive unit, integration, and e2e tests
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation

#### 🎨 Healthcare Branding
- **Custom Colors**: Primary and secondary brand colors
- **Logo Integration**: Easy logo replacement and branding
- **Organization Info**: Customizable contact and support information
- **Responsive Design**: Mobile-first, accessible user interface
- **Professional UI**: Material Design principles for healthcare applications

#### 🚀 Production Ready
- **Multi-Cloud Support**: Deploy to AWS, Azure, GCP, or Docker
- **CI/CD Pipelines**: GitHub Actions and GitLab CI integration
- **Security First**: HTTPS, secure credential management, input validation
- **Performance Optimized**: Redis caching, CDN support, optimized builds
- **Monitoring**: Health checks, logging, error tracking
- **Scalability**: Auto-scaling and load balancing configurations

## Templates

### 🏢 Full Stack (Default)
**Perfect for healthcare organizations needing a complete solution**

- **Frontend**: Next.js with shadcn/ui components
- **Backend**: NestJS with WHO ICD-11 API integration
- **Caching**: Redis for optimal performance
- **Database**: Optional database integration ready
- **Deployment**: Full Docker containerization
- **CI/CD**: Complete pipeline setup

```bash
npx create-icd11-app my-healthcare-platform
```

### 🎨 Frontend Only
**Ideal for client-side applications or static deployments**

- **Technology**: Next.js application with ICD-11 interface
- **API**: Mock responses for development
- **Deployment**: Static site generation ready
- **Performance**: Optimized for CDN delivery
- **Customization**: Full branding support

```bash
npx create-icd11-app my-frontend-app --template frontend-only
```

### 🔌 API Only
**Perfect for microservices or backend-focused deployments**

- **Technology**: NestJS backend service
- **Integration**: Complete WHO API integration
- **Caching**: Redis performance optimization
- **Documentation**: OpenAPI/Swagger specification
- **Containerization**: Docker-ready deployment

```bash
npx create-icd11-app my-api-service --template api-only
```

### ⚡ Minimal
**Quick development setup with essential features**

- **Technology**: Basic Next.js + NestJS
- **Features**: Core ICD-11 functionality
- **Dependencies**: Minimal for fast startup
- **Customization**: Easy to extend and modify

```bash
npx create-icd11-app my-minimal-app --template minimal
```

## Technology Stack

### Frontend
- **[Next.js 13+](https://nextjs.org/)**: React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development
- **[shadcn/ui](https://ui.shadcn.com/)**: Modern component library
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first styling
- **[React Hook Form](https://react-hook-form.com/)**: Form management
- **[React Query](https://tanstack.com/query)**: Server state management

### Backend
- **[NestJS](https://nestjs.com/)**: Progressive Node.js framework
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development
- **[Redis](https://redis.io/)**: High-performance caching
- **[Swagger](https://swagger.io/)**: API documentation
- **[Jest](https://jestjs.io/)**: Testing framework
- **[Class Validator](https://github.com/typestack/class-validator)**: Input validation

### Infrastructure
- **[Docker](https://www.docker.com/)**: Containerization
- **[Docker Compose](https://docs.docker.com/compose/)**: Multi-container orchestration
- **[GitHub Actions](https://github.com/features/actions)**: CI/CD automation
- **[AWS](https://aws.amazon.com/)**: Cloud infrastructure
- **[Azure](https://azure.microsoft.com/)**: Cloud platform
- **[Google Cloud](https://cloud.google.com/)**: Cloud services

## Prerequisites

### System Requirements
- **Node.js**: 16.0.0 or higher
- **npm**: 8.0.0 or higher
- **Git**: Latest version
- **Docker**: 20.10+ (optional, for containerized deployment)

### WHO ICD-11 API Access
1. Visit the [WHO ICD-11 API Portal](https://icd.who.int/icdapi)
2. Register for a developer account
3. Create a new application
4. Obtain your Client ID and Client Secret
5. Review the [API Terms of Service](https://icd.who.int/icdapi/docs2/API-Terms-of-Use/)

### Redis Requirements
- **Local Redis**: Version 6.0+ for development
- **Docker Redis**: Automatically configured by CLI
- **Cloud Redis**: Managed Redis for production deployments

## Quick Setup Guide

### 1. Create Your Application
```bash
# Interactive setup with full customization
npx create-icd11-app my-healthcare-app

# Quick setup with defaults
npx create-icd11-app my-healthcare-app --yes

# Specific template
npx create-icd11-app my-healthcare-app --template api-only
```

### 2. Configure Environment
```bash
cd my-healthcare-app

# Add WHO API credentials to backend/.env
ICD11_CLIENT_ID=your_client_id_here
ICD11_CLIENT_SECRET=your_client_secret_here

# Customize frontend branding in frontend/.env.local
NEXT_PUBLIC_PRIMARY_COLOR=#2e7d32
NEXT_PUBLIC_SECONDARY_COLOR=#ff9800
```

### 3. Start Development
```bash
# Start all services
npm run dev

# Or start individually
npm run dev:frontend  # Frontend at http://localhost:3000
npm run dev:backend   # Backend at http://localhost:3003
npm run dev:redis     # Redis at localhost:6379
```

### 4. Deploy to Production
```bash
# Docker deployment
docker-compose -f docker-compose.prod.yml up -d

# Cloud deployment (AWS example)
./scripts/deploy-aws.sh

# CI/CD deployment
git push origin main  # Triggers automated deployment
```

## API Documentation

### Interactive Documentation
When the backend is running, access comprehensive API documentation:
- **Development**: http://localhost:3003/api/docs
- **Production**: https://your-domain.com/api/docs

### Core Endpoints
```typescript
// Search ICD-11 codes
GET /api/icd11/search?q=diabetes&limit=10

// Get specific entity details
GET /api/icd11/entity/{entityId}

// Browse hierarchical structure
GET /api/icd11/entity/{entityId}/children

// Health check endpoint
GET /api/health
```

## Documentation

### Complete Documentation Set
- **[CLI Documentation](./docs/CLI.md)**: Complete guide to the create-icd11-app CLI tool
- **[Architecture Guide](./docs/ARCHITECTURE.md)**: Technical architecture and design decisions
- **[Deployment Guide](./docs/DEPLOYMENT.md)**: Multi-cloud deployment strategies
- **[Development Guide](./docs/DEVELOPMENT.md)**: Local development setup and contribution guidelines
- **[API Reference](./docs/API.md)**: Complete API documentation and examples

### Additional Resources
- **[WHO ICD-11 API Documentation](https://icd.who.int/icdapi/docs2/)**: Official WHO API documentation
- **[Healthcare Compliance Guide](./docs/COMPLIANCE.md)**: Healthcare data standards and regulations
- **[Security Best Practices](./docs/SECURITY.md)**: Security guidelines for healthcare applications

## Healthcare Use Cases

### Primary Care
- **Diagnostic Coding**: Accurate ICD-11 code lookup for patient records
- **Clinical Documentation**: Standardized medical terminology
- **Insurance Claims**: Proper coding for claim processing
- **Quality Metrics**: Standardized reporting and analytics

### Hospital Systems
- **Electronic Health Records**: Integrated ICD-11 coding workflows
- **Clinical Decision Support**: Code-based clinical recommendations
- **Research Data**: Standardized data for medical research
- **Population Health**: Epidemiological analysis and reporting

### Healthcare Software Vendors
- **EHR Integration**: Add ICD-11 functionality to existing systems
- **Practice Management**: Streamlined coding workflows
- **Billing Systems**: Accurate diagnostic code management
- **Telehealth Platforms**: Remote diagnosis coding support

## Community and Support

### Getting Help
- **GitHub Issues**: [Technical support and bug reports](https://github.com/alirezarezvani/icd11-nextjs-nestjs-boilerplate/issues)
- **Discussions**: [Community discussions and questions](https://github.com/alirezarezvani/icd11-nextjs-nestjs-boilerplate/discussions)
- **Documentation**: [Complete platform documentation](./docs/)

### Contributing
We welcome contributions from the healthcare development community:
- **Bug Reports**: Help us improve the platform
- **Feature Requests**: Suggest new healthcare-focused features
- **Code Contributions**: Submit pull requests for improvements
- **Documentation**: Help improve and expand documentation

See our [Contributing Guide](./docs/DEVELOPMENT.md#contributing) for details.

### Security
For security-related issues or vulnerabilities:
- **Security Policy**: [Security guidelines and reporting](./SECURITY.md)
- **Private Reporting**: security@your-domain.com
- **Response Time**: We aim to respond to security issues within 24 hours

## Roadmap

### Current Version (1.0.0)
- ✅ Complete WHO ICD-11 API integration
- ✅ Multi-template CLI tool
- ✅ Docker and multi-cloud deployment
- ✅ Healthcare branding system
- ✅ Comprehensive documentation

### Upcoming Features (1.1.0)
- 🔄 FHIR integration support
- 🔄 Multi-language support (ES, FR, DE)
- 🔄 Advanced search filters
- 🔄 Bulk code import/export
- 🔄 Analytics dashboard

### Future Enhancements (1.2.0+)
- 📋 HL7 FHIR CodeSystem integration
- 📋 Machine learning-based code suggestions
- 📋 Audit trail and compliance reporting
- 📋 Mobile application templates
- 📋 Integration with major EHR systems

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses
- **WHO ICD-11 API**: Subject to WHO Terms of Service
- **Open Source Components**: Various MIT and Apache 2.0 licenses
- **Template Assets**: CC0 and MIT licensed resources

## Creator

This platform was created by **Alireza Rezvani**, CTO @ LINDERA, a Senior Solution Architect and Senior Fullstack Software Engineer. With extensive experience in modern web & mobile technologies, SecDevOps, and healthcare systems integration, Alireza developed this platform to provide a robust foundation for WHO ICD-11 compliant healthcare applications.

### Professional Background
- **Healthcare Integration**: Extensive experience with healthcare data standards
- **Full-Stack Development**: Modern web technologies and cloud architecture
- **Enterprise Systems**: Large-scale healthcare application deployment
- **Open Source**: Committed to advancing healthcare technology through open source

---

## Getting Started

Ready to build your ICD-11 healthcare application? Choose your path:

### 🚀 For Healthcare Organizations
Use the CLI tool for rapid deployment with custom branding:
```bash
npx create-icd11-app my-healthcare-platform
```

### 🔧 For Developers
Fork the repository and customize the platform:
```bash
git clone https://github.com/alirezarezvani/icd11-nextjs-nestjs-boilerplate.git
```

### 📚 For Technical Teams
Start with the comprehensive documentation:
- [CLI Documentation](./docs/CLI.md)
- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

**Build modern, compliant, and scalable ICD-11 healthcare applications with confidence.**