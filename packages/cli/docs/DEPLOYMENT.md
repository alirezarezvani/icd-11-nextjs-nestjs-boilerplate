# Deployment Guide

This guide covers deploying ICD-11 healthcare applications created with `create-icd11-app` across different platforms and environments.

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker 20.10+ 
- Docker Compose 2.0+
- 4GB+ available RAM
- 10GB+ available disk space

### Quick Start
```bash
# Navigate to your project
cd my-healthcare-app

# Configure environment variables
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.local.example packages/frontend/.env.local

# Add your WHO ICD-11 API credentials to packages/backend/.env
# ICD11_CLIENT_ID=your_client_id_here
# ICD11_CLIENT_SECRET=your_client_secret_here

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Production Configuration

#### Environment Variables
```bash
# packages/backend/.env
NODE_ENV=production
PORT=3003
ICD11_CLIENT_ID=your_production_client_id
ICD11_CLIENT_SECRET=your_production_client_secret
REDIS_HOST=redis
REDIS_PORT=6379
ORG_NAME=Your Healthcare Organization
CORS_ORIGINS=https://yourdomain.com
```

#### SSL/TLS Configuration
Add an nginx proxy for SSL termination:

```yaml
# docker-compose.prod.yml (add this service)
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - frontend
      - backend
```

#### Backup Strategy
```bash
# Backup Redis data
docker exec -t redis redis-cli save
docker cp redis:/data/dump.rdb ./backup/redis-$(date +%Y%m%d).rdb

# Backup application logs
docker logs backend > ./logs/backend-$(date +%Y%m%d).log
docker logs frontend > ./logs/frontend-$(date +%Y%m%d).log
```

### Monitoring and Health Checks
```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Health check endpoints
curl http://localhost:3003/api/health  # Backend health
curl http://localhost:3000/api/health  # Frontend health

# Redis health
docker exec redis redis-cli ping
```

## ☁️ AWS Deployment

### Prerequisites
- AWS CLI configured
- ECS CLI installed
- Docker Hub or ECR access
- VPC and subnets configured

### Step 1: Build and Push Images
```bash
# Build images
docker build -t your-repo/healthcare-app-frontend ./packages/frontend
docker build -t your-repo/healthcare-app-backend ./packages/backend

# Push to registry
docker push your-repo/healthcare-app-frontend:latest
docker push your-repo/healthcare-app-backend:latest
```

### Step 2: Create ECS Task Definition
```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://aws/task-definition.json

# Create ECS cluster
aws ecs create-cluster --cluster-name healthcare-app-cluster
```

### Step 3: Deploy Services
```bash
# Create ECS service
aws ecs create-service \
  --cluster healthcare-app-cluster \
  --service-name healthcare-app-service \
  --task-definition healthcare-app-task \
  --desired-count 2 \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=frontend,containerPort=3000
```

### AWS Resources Created
- **ECS Cluster**: Container orchestration
- **Application Load Balancer**: Traffic distribution
- **Target Groups**: Health check and routing
- **ElastiCache Redis**: Managed Redis cluster
- **RDS (Optional)**: Database for application data
- **CloudWatch**: Logging and monitoring
- **IAM Roles**: Service permissions

### Cost Optimization
- Use Fargate Spot for non-critical workloads
- Configure auto-scaling based on CPU/memory
- Set up CloudWatch alarms for cost monitoring
- Use Reserved Instances for predictable workloads

## 🔷 Azure Deployment

### Prerequisites
- Azure CLI installed and logged in
- Azure Container Registry (ACR) or Docker Hub
- Resource group created

### Step 1: Container Registry Setup
```bash
# Create Azure Container Registry
az acr create --resource-group myResourceGroup \
  --name myregistry --sku Basic

# Login to ACR
az acr login --name myregistry

# Build and push images
az acr build --registry myregistry \
  --image healthcare-app-frontend:latest \
  ./packages/frontend

az acr build --registry myregistry \
  --image healthcare-app-backend:latest \
  ./packages/backend
```

### Step 2: Deploy Container Apps
```bash
# Create Container Apps environment
az containerapp env create \
  --name myenvironment \
  --resource-group myResourceGroup \
  --location eastus

# Deploy frontend
az containerapp create \
  --name healthcare-frontend \
  --resource-group myResourceGroup \
  --environment myenvironment \
  --image myregistry.azurecr.io/healthcare-app-frontend:latest \
  --target-port 3000 \
  --ingress external

# Deploy backend
az containerapp create \
  --name healthcare-backend \
  --resource-group myResourceGroup \
  --environment myenvironment \
  --image myregistry.azurecr.io/healthcare-app-backend:latest \
  --target-port 3003 \
  --ingress internal
```

### Azure Services Used
- **Container Apps**: Serverless container platform
- **Azure Cache for Redis**: Managed Redis service
- **Application Gateway**: Web application firewall and load balancer
- **Azure Monitor**: Logging and metrics
- **Key Vault**: Secure credential storage

### Scaling Configuration
```bash
# Configure auto-scaling
az containerapp revision set-mode \
  --name healthcare-frontend \
  --resource-group myResourceGroup \
  --mode multiple

# Set scaling rules
az containerapp create \
  --name healthcare-frontend \
  --scale-rule-name cpu-scale \
  --scale-rule-type cpu \
  --scale-rule-metadata concurrency=10
```

## 🟦 Google Cloud Platform Deployment

### Prerequisites
- Google Cloud SDK installed
- Project created and billing enabled
- Container Registry or Artifact Registry enabled

### Step 1: Build and Deploy to Cloud Run
```bash
# Set project
gcloud config set project your-project-id

# Build and push images
gcloud builds submit --tag gcr.io/your-project-id/healthcare-frontend ./packages/frontend
gcloud builds submit --tag gcr.io/your-project-id/healthcare-backend ./packages/backend

# Deploy to Cloud Run
gcloud run deploy healthcare-frontend \
  --image gcr.io/your-project-id/healthcare-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy healthcare-backend \
  --image gcr.io/your-project-id/healthcare-backend \
  --platform managed \
  --region us-central1 \
  --no-allow-unauthenticated
```

### Step 2: Configure Services
```bash
# Create Redis instance
gcloud redis instances create healthcare-redis \
  --size=1 \
  --region=us-central1

# Set up load balancer
gcloud compute url-maps create healthcare-lb \
  --default-backend-service healthcare-frontend-backend

# Configure SSL certificate
gcloud compute ssl-certificates create healthcare-ssl \
  --domains yourdomain.com
```

### GCP Services Used
- **Cloud Run**: Serverless container platform
- **Memorystore**: Managed Redis service
- **Cloud Load Balancing**: Global load balancer
- **Cloud CDN**: Content delivery network
- **Cloud Monitoring**: Observability platform
- **Secret Manager**: Credential management

## 🚀 CI/CD Deployment

### GitHub Actions
The generated `.github/workflows/deploy.yml` provides:
- **Multi-stage pipeline**: test → build → deploy
- **Environment-specific deployments**: dev, staging, production
- **Security scanning**: CodeQL analysis and dependency audit
- **Rollback capabilities**: Easy rollback on deployment failure
- **Notifications**: Slack integration for deployment status

#### Secrets Configuration
```bash
# Required GitHub Secrets
DOCKER_USERNAME           # Docker registry username
DOCKER_PASSWORD          # Docker registry password
AWS_ACCESS_KEY_ID        # AWS deployment credentials
AWS_SECRET_ACCESS_KEY    # AWS deployment credentials
AZURE_CREDENTIALS        # Azure service principal
GCP_SERVICE_ACCOUNT_KEY  # GCP service account key
SLACK_WEBHOOK_URL        # Slack notifications
```

### GitLab CI
The generated `.gitlab-ci.yml` provides:
- **Pipeline stages**: test, build, deploy
- **Docker registry integration**: Built-in registry support
- **Environment deployments**: Review apps and production
- **Monitoring integration**: Built-in monitoring dashboards

## 🔒 Security Best Practices

### Environment Security
- **Never commit credentials**: Use environment variables
- **Rotate API keys**: Regular WHO API credential rotation
- **Use secrets management**: Azure Key Vault, AWS Secrets Manager, GCP Secret Manager
- **Enable HTTPS**: SSL/TLS termination at load balancer level
- **Network isolation**: Private subnets for backend services

### Container Security
```bash
# Scan images for vulnerabilities
docker scout cves your-repo/healthcare-app-frontend
docker scout cves your-repo/healthcare-app-backend

# Run containers as non-root
USER node
WORKDIR /app
```

### API Security
- **Rate limiting**: Implement rate limiting for public endpoints
- **CORS configuration**: Restrict origins to trusted domains
- **Input validation**: Validate all API inputs
- **Authentication**: Secure WHO API token management

## 📊 Monitoring and Observability

### Application Metrics
- **Response times**: API endpoint performance
- **Error rates**: Application error tracking
- **Cache hit rates**: Redis performance metrics
- **User activity**: Healthcare provider usage patterns

### Infrastructure Metrics
- **Container health**: Resource utilization and health checks
- **Database performance**: Redis connection and query metrics
- **Network performance**: Load balancer and CDN metrics

### Alerting Setup
```yaml
# Example CloudWatch alarm
Type: AWS::CloudWatch::Alarm
Properties:
  AlarmName: HighErrorRate
  MetricName: ErrorCount
  ComparisonOperator: GreaterThanThreshold
  Threshold: 10
  EvaluationPeriods: 2
  AlarmActions:
    - !Ref SNSNotificationTopic
```

## 🔄 Backup and Disaster Recovery

### Data Backup
- **Redis snapshots**: Automated daily backups
- **Configuration backup**: Environment variables and secrets
- **Code backup**: Git repository with tags for releases
- **Log retention**: Centralized logging with retention policies

### Disaster Recovery Plan
1. **RTO (Recovery Time Objective)**: 15 minutes
2. **RPO (Recovery Point Objective)**: 1 hour
3. **Backup verification**: Weekly restore testing
4. **Failover procedures**: Documented step-by-step recovery

### Multi-Region Setup
```bash
# AWS multi-region deployment
aws ecs create-cluster --cluster-name healthcare-app-west --region us-west-2
aws ecs create-cluster --cluster-name healthcare-app-east --region us-east-1

# Cross-region Redis replication
aws elasticache create-replication-group \
  --replication-group-id healthcare-redis-global \
  --global-replication-group-id healthcare-global
```

## 🎯 Performance Optimization

### Caching Strategy
- **Redis caching**: WHO API responses cached for 1 hour
- **CDN caching**: Static assets cached at edge locations
- **Browser caching**: Appropriate cache headers for client-side caching

### Database Optimization
- **Connection pooling**: Efficient database connection management
- **Query optimization**: Optimized Redis queries and patterns
- **Index strategy**: Proper indexing for search functionality

### Resource Optimization
```yaml
# Kubernetes resource limits
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
```

## 🛠️ Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Verify environment variables
docker exec backend printenv | grep ICD11

# Test WHO API connection
curl -X POST "https://icdaccessmanagement.who.int/connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=YOUR_ID&client_secret=YOUR_SECRET&scope=icdapi_access&grant_type=client_credentials"
```

#### Redis Connection Issues
```bash
# Check Redis health
docker exec redis redis-cli ping

# Monitor Redis connections
docker exec redis redis-cli monitor

# Check Redis logs
docker logs redis
```

#### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3003/api/health

# Redis performance metrics
docker exec redis redis-cli --latency-history
```

### Support Resources
- **GitHub Issues**: Technical support
- **Documentation**: Comprehensive deployment guides
- **Community**: Healthcare developer community
- **Professional Support**: Enterprise support options

---

**Deploy your ICD-11 healthcare application with confidence across any platform.**

Need help? Create an issue on our [GitHub repository](https://github.com/your-repo/create-icd11-app/issues) for technical support.