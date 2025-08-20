# ICD-11 Healthcare Application Templates

This directory contains template files and configurations for different deployment scenarios and customizations.

## Template Types

### 1. Full Stack (default)
- Next.js frontend with shadcn/ui
- NestJS backend with WHO API integration
- Redis caching
- Docker containerization
- Complete healthcare provider branding

### 2. Frontend Only
- Next.js application with ICD-11 search interface
- Mock API responses for development
- Healthcare provider branding
- Static deployment ready

### 3. API Only
- NestJS backend with WHO API integration
- Redis caching
- OpenAPI/Swagger documentation
- Docker containerization

### 4. Minimal
- Basic Next.js + NestJS setup
- Essential ICD-11 functionality
- Minimal dependencies
- Quick development start

## Template Files

Templates are generated dynamically based on user configuration during CLI setup. This approach allows for:

- Dynamic branding customization
- Environment-specific configuration
- Deployment provider selection
- CI/CD pipeline generation

## Usage

Templates are applied automatically during `create-icd11-app` execution based on user choices in the interactive setup wizard.