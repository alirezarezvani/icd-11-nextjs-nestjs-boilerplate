# CLI Documentation - create-icd11-app

The `create-icd11-app` CLI tool is a powerful, interactive command-line interface for generating production-ready ICD-11 healthcare applications. This tool streamlines the process of creating healthcare applications with WHO ICD-11 integration, custom branding, and deployment configurations.

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Command Reference](#command-reference)
4. [Interactive Setup Wizard](#interactive-setup-wizard)
5. [Templates](#templates)
6. [Configuration Options](#configuration-options)
7. [Deployment Options](#deployment-options)
8. [CLI Options](#cli-options)
9. [Advanced Usage](#advanced-usage)
10. [Troubleshooting](#troubleshooting)
11. [Development](#development)

## Installation

### Global Installation (Recommended)
```bash
npm install -g create-icd11-app
```

### Direct Usage (No Installation Required)
```bash
npx create-icd11-app my-healthcare-app
```

### System Requirements
- **Node.js**: 16.0.0 or higher
- **npm**: 8.0.0 or higher
- **Git**: Latest version (for repository initialization)
- **Docker**: 20.10+ (optional, for containerized development)

## Quick Start

### Create a New Application
```bash
# Interactive setup with full customization
npx create-icd11-app my-healthcare-app

# Quick setup with defaults
npx create-icd11-app my-healthcare-app --yes

# Specific template
npx create-icd11-app my-healthcare-app --template frontend-only

# Custom directory
npx create-icd11-app my-healthcare-app --directory ./custom-path
```

### First Steps After Creation
```bash
cd my-healthcare-app

# Configure environment variables
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.local.example packages/frontend/.env.local

# Add your WHO ICD-11 API credentials
# Edit packages/backend/.env and add:
# ICD11_CLIENT_ID=your_client_id
# ICD11_CLIENT_SECRET=your_client_secret

# Start development servers
npm run dev
```

## Command Reference

### Basic Commands

#### `create <project-name>`
Creates a new ICD-11 healthcare application.

```bash
create-icd11-app create my-healthcare-app [options]

# Short form (default command)
create-icd11-app my-healthcare-app [options]
```

**Options:**
- `--template, -t <template>`: Specify template (default, frontend-only, api-only, minimal)
- `--directory, -d <path>`: Custom installation directory
- `--yes, -y`: Skip prompts and use defaults
- `--no-git`: Skip Git repository initialization
- `--no-install`: Skip npm package installation
- `--verbose, -v`: Enable verbose logging
- `--config <file>`: Use configuration file

#### `--help, -h`
Display help information.

```bash
create-icd11-app --help
create-icd11-app create --help
```

#### `--version, -V`
Display CLI version.

```bash
create-icd11-app --version
```

### Advanced Commands

#### `validate <project-name>`
Validate an existing project configuration.

```bash
create-icd11-app validate my-healthcare-app
```

#### `update <project-name>`
Update an existing project with new templates or configurations.

```bash
create-icd11-app update my-healthcare-app --template api-only
```

## Interactive Setup Wizard

The CLI provides an interactive setup wizard that guides you through configuration options:

### 1. Project Configuration
```
? What is your project name? (my-healthcare-app)
? What is your project description? (ICD-11 Healthcare Application)
? What is your project version? (1.0.0)
? Author name? (Your Name)
? Author email? (your.email@example.com)
```

### 2. Template Selection
```
? Which template would you like to use?
❯ Full Stack Healthcare Application
  Frontend Only Interface
  API Only Service
  Minimal Setup
```

### 3. Healthcare Organization Branding
```
? Organization name? (Regional Medical Center)
? Organization website URL? (https://example.com)
? Support email? (support@example.com)
? Primary brand color (hex)? (#2e7d32)
? Secondary brand color (hex)? (#ff9800)
```

### 4. WHO ICD-11 API Configuration
```
? Do you have WHO ICD-11 API credentials? (Y/n)
? WHO ICD-11 Client ID? (your_client_id)
? WHO ICD-11 Client Secret? (your_client_secret)
? Test API connection now? (Y/n)
```

### 5. Development Environment Setup
```
? Do you want to set up Redis caching? (Y/n)
? Redis setup method?
❯ Docker container (recommended)
  Local Redis installation
  Remote Redis instance
  
? Redis host? (localhost)
? Redis port? (6379)
? Redis password? (optional)
```

### 6. Deployment Configuration
```
? Which deployment platforms do you want to configure?
◉ Docker Compose
◯ AWS (ECS/Fargate)
◯ Azure (Container Apps)
◯ Google Cloud (Cloud Run)
◯ None
```

### 7. CI/CD Pipeline Setup
```
? Do you want to set up CI/CD pipelines? (Y/n)
? Which CI/CD platforms?
◉ GitHub Actions
◯ GitLab CI
◯ Azure Pipelines
◯ None
```

### 8. Additional Features
```
? Additional features to include:
◉ Testing setup (Jest)
◉ Code linting (ESLint)
◉ Code formatting (Prettier)
◯ Monitoring setup
◯ Analytics integration
```

## Templates

### Full Stack Template (default)
**Perfect for complete healthcare applications**

```bash
npx create-icd11-app my-app --template default
```

**Includes:**
- Next.js frontend with shadcn/ui components
- NestJS backend with WHO ICD-11 integration
- Redis caching layer
- Docker containerization
- Full testing suite
- CI/CD pipeline configurations
- Health monitoring endpoints

**Generated Structure:**
```
my-app/
├── packages/
│   ├── frontend/          # Next.js application
│   ├── backend/           # NestJS API server
│   ├── shared/            # Shared types and utilities
│   └── cli/               # CLI development tools
├── docker-compose.yml     # Development environment
├── docker-compose.prod.yml # Production environment
├── .github/workflows/     # GitHub Actions
├── scripts/               # Deployment scripts
└── docs/                  # Project documentation
```

### Frontend Only Template
**Ideal for client-side applications or static sites**

```bash
npx create-icd11-app my-app --template frontend-only
```

**Includes:**
- Next.js application with ICD-11 search interface
- Mock API responses for development
- Static site generation configuration
- CDN-optimized build
- Standalone deployment options

**Generated Structure:**
```
my-app/
├── components/            # React components
├── pages/                 # Next.js pages
├── services/              # API services with mocks
├── public/                # Static assets
├── styles/                # CSS and styling
├── mocks/                 # Mock API data
└── deployment/            # Static deployment configs
```

### API Only Template
**Perfect for microservices and backend-focused deployments**

```bash
npx create-icd11-app my-app --template api-only
```

**Includes:**
- NestJS backend with WHO ICD-11 integration
- Redis caching
- OpenAPI/Swagger documentation
- Docker containerization
- Database integration ready
- Microservice architecture

**Generated Structure:**
```
my-app/
├── src/
│   ├── icd11/             # ICD-11 module
│   ├── cache/             # Redis caching
│   ├── auth/              # Authentication module
│   ├── health/            # Health check endpoints
│   └── docs/              # API documentation
├── docker/                # Container configurations
├── k8s/                   # Kubernetes manifests
└── tests/                 # Test suites
```

### Minimal Template
**Quick development setup with essential features**

```bash
npx create-icd11-app my-app --template minimal
```

**Includes:**
- Basic Next.js + NestJS setup
- Essential ICD-11 functionality
- Minimal dependencies
- Development-focused configuration
- Easy customization and extension

**Generated Structure:**
```
my-app/
├── frontend/              # Basic Next.js app
├── backend/               # Basic NestJS API
├── shared/                # Shared types
└── package.json           # Root package configuration
```

## Configuration Options

### Environment Configuration

The CLI generates comprehensive environment configurations:

#### Backend Environment (.env)
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

# Organization Branding
ORG_NAME=Your Healthcare Organization
ORG_WEBSITE=https://your-website.com
SUPPORT_EMAIL=support@your-website.com

# Security Configuration
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
```

#### Frontend Environment (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3003/api
NEXT_PUBLIC_API_VERSION=v1

# Application Branding
NEXT_PUBLIC_APP_NAME=Your Healthcare App
NEXT_PUBLIC_PROJECT_NAME=your-app-name
NEXT_PUBLIC_APP_DESCRIPTION=ICD-11 Healthcare Application

# Theme Configuration
NEXT_PUBLIC_PRIMARY_COLOR=#1976d2
NEXT_PUBLIC_SECONDARY_COLOR=#dc004e
NEXT_PUBLIC_LOGO_URL=/assets/logo.png

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_PWA=false
NEXT_PUBLIC_ENABLE_OFFLINE=false
```

### Configuration File Support

Create a `create-icd11-app.config.json` file for reusable configurations:

```json
{
  "template": "default",
  "organization": {
    "name": "Regional Medical Center",
    "website": "https://regional-medical.org",
    "supportEmail": "support@regional-medical.org",
    "primaryColor": "#2e7d32",
    "secondaryColor": "#ff9800"
  },
  "features": {
    "redis": true,
    "docker": true,
    "testing": true,
    "monitoring": false
  },
  "deployment": {
    "platforms": ["docker", "aws"],
    "cicd": ["github-actions"]
  }
}
```

Use the configuration file:
```bash
create-icd11-app my-app --config create-icd11-app.config.json
```

## Deployment Options

### Docker Deployment

The CLI generates optimized Docker configurations:

#### Development Environment
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./packages/frontend
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3003
    volumes:
      - ./packages/frontend:/app
      - /app/node_modules

  backend:
    build: ./packages/backend
    ports: ["3003:3003"]
    environment:
      - REDIS_HOST=redis
      - NODE_ENV=development
    volumes:
      - ./packages/backend:/app
      - /app/node_modules
    depends_on: [redis]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: [redis-data:/data]

volumes:
  redis-data:
```

#### Production Environment
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  frontend:
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  backend:
    build:
      context: ./packages/backend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
    restart: unless-stopped
    depends_on: [redis]

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes: [redis-data:/data]
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on: [frontend, backend]
    restart: unless-stopped

volumes:
  redis-data:
```

### Cloud Deployment

#### AWS Deployment
Generated AWS configurations include:

**ECS Task Definition** (`aws/task-definition.json`):
```json
{
  "family": "healthcare-app-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "your-repo/healthcare-frontend:latest",
      "portMappings": [{"containerPort": 3000}],
      "environment": [
        {"name": "NODE_ENV", "value": "production"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/healthcare-app",
          "awslogs-region": "us-east-1"
        }
      }
    }
  ]
}
```

**CloudFormation Template** (`aws/cloudformation.yml`):
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Parameters:
  VpcId:
    Type: AWS::EC2::VPC::Id
  SubnetIds:
    Type: List<AWS::EC2::Subnet::Id>

Resources:
  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: healthcare-app-cluster

  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Type: application
      Scheme: internet-facing
      Subnets: !Ref SubnetIds

  ECSService:
    Type: AWS::ECS::Service
    Properties:
      Cluster: !Ref ECSCluster
      TaskDefinition: !Ref TaskDefinition
      DesiredCount: 2
      LaunchType: FARGATE
```

#### Azure Deployment
Generated Azure configurations include:

**Container App Template** (`azure/container-app.json`):
```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "containerAppName": {
      "type": "string",
      "defaultValue": "healthcare-app"
    }
  },
  "resources": [
    {
      "type": "Microsoft.App/containerApps",
      "apiVersion": "2022-03-01",
      "name": "[parameters('containerAppName')]",
      "properties": {
        "configuration": {
          "ingress": {
            "external": true,
            "targetPort": 3000
          }
        },
        "template": {
          "containers": [
            {
              "name": "healthcare-frontend",
              "image": "your-registry.azurecr.io/healthcare-frontend:latest",
              "resources": {
                "cpu": 0.5,
                "memory": "1Gi"
              }
            }
          ]
        }
      }
    }
  ]
}
```

#### Google Cloud Deployment
Generated GCP configurations include:

**Cloud Run Service** (`gcp/cloud-run.yaml`):
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: healthcare-app
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu-throttling: "false"
    spec:
      containerConcurrency: 80
      containers:
      - image: gcr.io/PROJECT_ID/healthcare-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        resources:
          limits:
            cpu: 1000m
            memory: 512Mi
```

## CLI Options

### Global Options

#### `--template, -t <template>`
Specify the template to use.

```bash
create-icd11-app my-app --template frontend-only
```

**Available templates:**
- `default` (full-stack)
- `frontend-only`
- `api-only`
- `minimal`

#### `--directory, -d <path>`
Specify custom installation directory.

```bash
create-icd11-app my-app --directory ./custom-location
```

#### `--yes, -y`
Skip interactive prompts and use defaults.

```bash
create-icd11-app my-app --yes
```

#### `--no-git`
Skip Git repository initialization.

```bash
create-icd11-app my-app --no-git
```

#### `--no-install`
Skip automatic npm package installation.

```bash
create-icd11-app my-app --no-install
```

#### `--verbose, -v`
Enable verbose logging for debugging.

```bash
create-icd11-app my-app --verbose
```

#### `--config <file>`
Use configuration file for setup options.

```bash
create-icd11-app my-app --config ./my-config.json
```

### Template-Specific Options

#### `--features <features>`
Specify comma-separated list of features to include.

```bash
create-icd11-app my-app --features redis,docker,testing
```

**Available features:**
- `redis`: Redis caching
- `docker`: Docker containerization
- `testing`: Jest testing suite
- `monitoring`: Health checks and metrics
- `analytics`: Usage analytics
- `pwa`: Progressive Web App features

#### `--deployment <platforms>`
Specify deployment platforms to configure.

```bash
create-icd11-app my-app --deployment aws,docker
```

**Available platforms:**
- `docker`: Docker Compose
- `aws`: Amazon Web Services
- `azure`: Microsoft Azure
- `gcp`: Google Cloud Platform

#### `--cicd <platforms>`
Specify CI/CD platforms to configure.

```bash
create-icd11-app my-app --cicd github-actions,gitlab-ci
```

**Available platforms:**
- `github-actions`: GitHub Actions
- `gitlab-ci`: GitLab CI
- `azure-pipelines`: Azure DevOps

## Advanced Usage

### Batch Project Creation

Create multiple projects with different configurations:

```bash
# Create batch configuration
cat > batch-config.json << EOF
{
  "projects": [
    {
      "name": "frontend-app",
      "template": "frontend-only",
      "organization": {
        "name": "Hospital A",
        "primaryColor": "#2e7d32"
      }
    },
    {
      "name": "api-service",
      "template": "api-only",
      "features": ["redis", "monitoring"]
    }
  ]
}
EOF

# Process batch configuration
for project in $(jq -r '.projects[].name' batch-config.json); do
  config=$(jq -r ".projects[] | select(.name == \"$project\")" batch-config.json)
  echo "$config" > "$project-config.json"
  create-icd11-app "$project" --config "$project-config.json"
done
```

### Custom Template Development

Create custom templates for your organization:

```bash
# Clone the CLI repository
git clone https://github.com/your-org/create-icd11-app.git
cd create-icd11-app

# Create custom template directory
mkdir -p templates/custom-hospital

# Add template configuration
cat > templates/custom-hospital/template.json << EOF
{
  "name": "Custom Hospital Template",
  "description": "Specialized template for hospital systems",
  "includes": ["frontend", "backend", "shared", "hospital-modules"],
  "features": {
    "redis": true,
    "monitoring": true,
    "hl7": true,
    "hipaa": true
  }
}
EOF

# Build and test
npm run build
npm run test:template custom-hospital
```

### Environment-Specific Configurations

Create configurations for different environments:

```bash
# Development configuration
cat > .env.development << EOF
NODE_ENV=development
API_URL=http://localhost:3003
REDIS_HOST=localhost
LOG_LEVEL=debug
EOF

# Staging configuration
cat > .env.staging << EOF
NODE_ENV=staging
API_URL=https://staging-api.healthcare.com
REDIS_HOST=staging-redis.healthcare.com
LOG_LEVEL=info
EOF

# Production configuration
cat > .env.production << EOF
NODE_ENV=production
API_URL=https://api.healthcare.com
REDIS_HOST=prod-redis.healthcare.com
LOG_LEVEL=warn
EOF
```

### Integration with Existing Projects

Integrate CLI-generated components into existing projects:

```bash
# Generate specific components only
create-icd11-app --component icd11-search ./components/
create-icd11-app --component who-api-client ./services/
create-icd11-app --component redis-cache ./utils/

# Update existing project with new templates
create-icd11-app update existing-project --template api-only
```

## Troubleshooting

### Common Issues

#### Installation Problems

**Issue**: `npm install -g create-icd11-app` fails with permission errors
```bash
# Solution: Use npx instead
npx create-icd11-app my-app

# Or fix npm permissions
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

**Issue**: Node.js version compatibility
```bash
# Check Node.js version
node --version

# Update Node.js using nvm
nvm install 18
nvm use 18
```

#### Project Creation Issues

**Issue**: WHO API credential validation fails
```bash
# Test credentials manually
curl -X POST "https://icdaccessmanagement.who.int/connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=YOUR_ID&client_secret=YOUR_SECRET&scope=icdapi_access&grant_type=client_credentials"
```

**Issue**: Redis connection fails
```bash
# Check Redis status
redis-cli ping

# Start Redis with Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Check Redis logs
docker logs redis
```

**Issue**: Template download fails
```bash
# Clear npm cache
npm cache clean --force

# Use verbose mode for debugging
create-icd11-app my-app --verbose

# Check network connectivity
curl -I https://registry.npmjs.org/create-icd11-app
```

#### Development Issues

**Issue**: Frontend/Backend connectivity problems
```bash
# Check if services are running
curl http://localhost:3000  # Frontend
curl http://localhost:3003/api/health  # Backend

# Check environment variables
grep API_URL packages/frontend/.env.local
grep PORT packages/backend/.env
```

**Issue**: Docker build failures
```bash
# Build with verbose output
docker-compose build --no-cache --progress=plain

# Check Docker daemon
docker info

# Free up space
docker system prune -a
```

### Debug Mode

Enable debug mode for detailed troubleshooting:

```bash
# Set debug environment variable
DEBUG=create-icd11-app:* create-icd11-app my-app

# Or use verbose flag
create-icd11-app my-app --verbose --debug
```

### Log Analysis

Check CLI logs for issues:

```bash
# View CLI logs (macOS/Linux)
tail -f ~/.create-icd11-app/logs/cli.log

# View project logs
cd my-healthcare-app
npm run logs
```

### Getting Help

If you encounter issues:

1. **Check Documentation**: Review this guide and the main README
2. **Search Issues**: Look for similar problems in GitHub issues
3. **Create Issue**: Report bugs with detailed reproduction steps
4. **Join Community**: Connect with other developers in discussions

```bash
# Report an issue with system information
create-icd11-app --report-issue my-app
```

## Development

### Contributing to the CLI

#### Setup Development Environment
```bash
# Clone repository
git clone https://github.com/your-org/create-icd11-app.git
cd create-icd11-app

# Install dependencies
npm install

# Build CLI
npm run build

# Link for local testing
npm link

# Test locally
create-icd11-app test-app
```

#### Project Structure
```
create-icd11-app/
├── src/
│   ├── cli.ts               # Main CLI entry point
│   ├── commands/            # CLI commands
│   │   ├── create.ts        # Create command
│   │   └── index.ts         # Command exports
│   ├── utils/               # Utility functions
│   │   ├── scaffolder.ts    # Project scaffolding
│   │   ├── template-processor.ts # Template processing
│   │   ├── validation.ts    # Input validation
│   │   └── logger.ts        # Logging utilities
│   └── __tests__/           # Test files
├── templates/               # Project templates
│   ├── default/             # Full-stack template
│   ├── frontend-only/       # Frontend template
│   ├── api-only/            # Backend template
│   └── minimal/             # Minimal template
├── scripts/                 # Build and deployment scripts
└── docs/                    # Documentation
```

#### Testing
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Test specific template
npm run test:template default

# Test CLI commands
npm run test:cli
```

#### Building and Publishing
```bash
# Build for production
npm run build

# Test build
npm run pack:test

# Publish to npm
npm publish

# Publish beta version
npm publish --tag beta
```

This comprehensive CLI documentation provides healthcare organizations and developers with everything needed to effectively use the `create-icd11-app` tool for building modern ICD-11 healthcare applications.