# Multi-Cloud Deployment Guide

This comprehensive guide covers deploying ICD-11 healthcare applications across different cloud platforms and environments. Whether you're deploying to AWS, Azure, Google Cloud, or using Docker, this guide provides step-by-step instructions and best practices for production deployments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Docker Deployment](#docker-deployment)
3. [AWS Deployment](#aws-deployment)
4. [Azure Deployment](#azure-deployment)
5. [Google Cloud Platform Deployment](#google-cloud-platform-deployment)
6. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
7. [Security Best Practices](#security-best-practices)
8. [Monitoring and Observability](#monitoring-and-observability)
9. [Backup and Disaster Recovery](#backup-and-disaster-recovery)
10. [Performance Optimization](#performance-optimization)
11. [Cost Optimization](#cost-optimization)
12. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Docker**: 20.10+ with Docker Compose 2.0+
- **Node.js**: 16.0.0+ for local development
- **Git**: Latest version for repository management
- **Cloud CLI Tools**: AWS CLI, Azure CLI, or Google Cloud SDK

### WHO ICD-11 API Access
- Valid WHO ICD-11 Client ID and Client Secret
- API access verified and tested
- Understanding of WHO API rate limits and terms of service

### SSL/TLS Certificates
- Domain name for your healthcare application
- SSL certificate (Let's Encrypt, commercial CA, or cloud provider)
- DNS configuration access

### Healthcare Compliance
- Understanding of healthcare data regulations (HIPAA, GDPR, etc.)
- Data residency requirements
- Audit and logging requirements

## Docker Deployment

Docker deployment is the recommended approach for both development and production environments due to its consistency, portability, and ease of management.

### Development Environment

#### Quick Start
```bash
# Clone your generated project
cd my-healthcare-app

# Configure environment variables
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.local.example packages/frontend/.env.local

# Add your WHO ICD-11 credentials to packages/backend/.env
echo "ICD11_CLIENT_ID=your_client_id" >> packages/backend/.env
echo "ICD11_CLIENT_SECRET=your_client_secret" >> packages/backend/.env

# Start development environment
docker-compose up -d
```

#### Development Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3003/api
      - NODE_ENV=development
    volumes:
      - ./packages/frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build:
      context: ./packages/backend
      dockerfile: Dockerfile.dev
    ports:
      - "3003:3003"
    env_file:
      - ./packages/backend/.env
    environment:
      - NODE_ENV=development
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    volumes:
      - ./packages/backend:/app
      - /app/node_modules
      - /app/dist
    depends_on:
      redis:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3003/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-}
    volumes:
      - redis-data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  redis-data:
    driver: local
```

### Production Environment

#### Production Configuration
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
      - NEXT_PUBLIC_APP_NAME=${APP_NAME}
      - NEXT_PUBLIC_PRIMARY_COLOR=${PRIMARY_COLOR}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"

  backend:
    build:
      context: ./packages/backend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
      - PORT=3003
    env_file:
      - ./packages/backend/.env.prod
    depends_on:
      redis:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3003/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    environment:
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "3"

  redis-exporter:
    image: oliver006/redis_exporter
    environment:
      - REDIS_ADDR=redis://redis:6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    ports:
      - "9121:9121"
    depends_on:
      - redis
    restart: unless-stopped

volumes:
  redis-data:
    driver: local

networks:
  default:
    driver: bridge
```

#### Production Environment Variables
```bash
# packages/backend/.env.prod
NODE_ENV=production
PORT=3003

# WHO ICD-11 API
ICD11_CLIENT_ID=your_production_client_id
ICD11_CLIENT_SECRET=your_production_client_secret

# Database
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password
REDIS_DB=0

# Security
JWT_SECRET=your_super_secure_jwt_secret_here
SESSION_SECRET=your_super_secure_session_secret_here
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Organization
ORG_NAME=Your Healthcare Organization
ORG_WEBSITE=https://yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com

# Monitoring
LOG_LEVEL=warn
ENABLE_METRICS=true
PROMETHEUS_PORT=9090

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Nginx Configuration
```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:3003;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=5r/s;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # HTTPS redirect
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # Frontend
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

        location / {
            limit_req zone=general burst=20 nodelay;
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api {
            limit_req zone=api burst=50 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

#### Deployment Commands
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Update application
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --force-recreate

# Backup data
docker-compose -f docker-compose.prod.yml exec redis redis-cli save
docker cp $(docker-compose -f docker-compose.prod.yml ps -q redis):/data/dump.rdb ./backup/

# Health check
curl -f https://yourdomain.com/health
curl -f https://yourdomain.com/api/health
```

## AWS Deployment

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Infrastructure                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Application     │  │   ElastiCache   │  │   CloudWatch    │ │
│  │ Load Balancer   │  │     Redis       │  │   Monitoring    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│           │                       │                       │    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   ECS Fargate   │  │      VPC        │  │   Route 53      │ │
│  │   Services      │  │   Networking    │  │      DNS        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Prerequisites
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region name: us-east-1
# Default output format: json

# Install ECS CLI
sudo curl -Lo /usr/local/bin/ecs-cli https://amazon-ecs-cli.s3.amazonaws.com/ecs-cli-linux-amd64-latest
sudo chmod +x /usr/local/bin/ecs-cli
```

### Infrastructure Setup

#### 1. VPC and Networking
```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=healthcare-vpc}]'

# Create subnets
aws ec2 create-subnet --vpc-id vpc-xxxxxxxxx --cidr-block 10.0.1.0/24 --availability-zone us-east-1a
aws ec2 create-subnet --vpc-id vpc-xxxxxxxxx --cidr-block 10.0.2.0/24 --availability-zone us-east-1b

# Create internet gateway
aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=healthcare-igw}]'
aws ec2 attach-internet-gateway --vpc-id vpc-xxxxxxxxx --internet-gateway-id igw-xxxxxxxxx

# Create route table
aws ec2 create-route-table --vpc-id vpc-xxxxxxxxx
aws ec2 create-route --route-table-id rtb-xxxxxxxxx --destination-cidr-block 0.0.0.0/0 --gateway-id igw-xxxxxxxxx
```

#### 2. ECS Cluster Creation
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name healthcare-app-cluster --capacity-providers FARGATE --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1
```

#### 3. Task Definition
```json
{
  "family": "healthcare-app-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/healthcare-frontend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "NEXT_PUBLIC_API_URL",
          "value": "https://api.yourdomain.com/api"
        }
      ],
      "secrets": [
        {
          "name": "NEXT_PUBLIC_PRIMARY_COLOR",
          "valueFrom": "arn:aws:ssm:us-east-1:ACCOUNT:parameter/healthcare/frontend/primary-color"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/healthcare-frontend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3000/api/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    },
    {
      "name": "backend",
      "image": "YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/healthcare-backend:latest",
      "portMappings": [
        {
          "containerPort": 3003,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "REDIS_HOST",
          "value": "healthcare-redis.abcdef.cache.amazonaws.com"
        }
      ],
      "secrets": [
        {
          "name": "ICD11_CLIENT_ID",
          "valueFrom": "arn:aws:ssm:us-east-1:ACCOUNT:parameter/healthcare/icd11/client-id"
        },
        {
          "name": "ICD11_CLIENT_SECRET",
          "valueFrom": "arn:aws:ssm:us-east-1:ACCOUNT:parameter/healthcare/icd11/client-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/healthcare-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### 4. Container Image Build and Push
```bash
# Create ECR repositories
aws ecr create-repository --repository-name healthcare-frontend
aws ecr create-repository --repository-name healthcare-backend

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Build and push frontend
docker build -t healthcare-frontend ./packages/frontend
docker tag healthcare-frontend:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/healthcare-frontend:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/healthcare-frontend:latest

# Build and push backend
docker build -t healthcare-backend ./packages/backend
docker tag healthcare-backend:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/healthcare-backend:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/healthcare-backend:latest
```

#### 5. ElastiCache Redis Setup
```bash
# Create Redis subnet group
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name healthcare-redis-subnet-group \
  --cache-subnet-group-description "Healthcare app Redis subnet group" \
  --subnet-ids subnet-xxxxxxxxx subnet-yyyyyyyyy

# Create Redis cluster
aws elasticache create-replication-group \
  --replication-group-id healthcare-redis \
  --replication-group-description "Healthcare app Redis cluster" \
  --node-type cache.t3.micro \
  --engine redis \
  --num-cache-clusters 2 \
  --cache-subnet-group-name healthcare-redis-subnet-group \
  --security-group-ids sg-xxxxxxxxx \
  --port 6379 \
  --parameter-group-name default.redis6.x \
  --engine-version 6.2
```

#### 6. Application Load Balancer
```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name healthcare-app-alb \
  --subnets subnet-xxxxxxxxx subnet-yyyyyyyyy \
  --security-groups sg-xxxxxxxxx \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4

# Create target groups
aws elbv2 create-target-group \
  --name healthcare-frontend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxxxxxxxx \
  --target-type ip \
  --health-check-path /api/health

aws elbv2 create-target-group \
  --name healthcare-backend-tg \
  --protocol HTTP \
  --port 3003 \
  --vpc-id vpc-xxxxxxxxx \
  --target-type ip \
  --health-check-path /api/health

# Create listeners
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:ACCOUNT:loadbalancer/app/healthcare-app-alb/1234567890abcdef \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:us-east-1:ACCOUNT:certificate/12345678-1234-1234-1234-123456789012 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:ACCOUNT:targetgroup/healthcare-frontend-tg/1234567890abcdef
```

#### 7. ECS Service Creation
```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create ECS service
aws ecs create-service \
  --cluster healthcare-app-cluster \
  --service-name healthcare-app-service \
  --task-definition healthcare-app-task:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxxxxxx,subnet-yyyyyyyyy],securityGroups=[sg-xxxxxxxxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:ACCOUNT:targetgroup/healthcare-frontend-tg/1234567890abcdef,containerName=frontend,containerPort=3000
```

### CloudFormation Template

For Infrastructure as Code, use this CloudFormation template:

```yaml
# aws/cloudformation.yml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'ICD-11 Healthcare Application Infrastructure'

Parameters:
  Environment:
    Type: String
    Default: production
    AllowedValues: [development, staging, production]
  
  DomainName:
    Type: String
    Description: Domain name for the application
    Default: yourdomain.com

Resources:
  # VPC
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub ${AWS::StackName}-vpc

  # Internet Gateway
  InternetGateway:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: !Sub ${AWS::StackName}-igw

  InternetGatewayAttachment:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      InternetGatewayId: !Ref InternetGateway
      VpcId: !Ref VPC

  # Subnets
  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.0.1.0/24
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub ${AWS::StackName}-public-subnet-1

  PublicSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [1, !GetAZs '']
      CidrBlock: 10.0.2.0/24
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub ${AWS::StackName}-public-subnet-2

  # Route Table
  PublicRouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub ${AWS::StackName}-public-routes

  DefaultPublicRoute:
    Type: AWS::EC2::Route
    DependsOn: InternetGatewayAttachment
    Properties:
      RouteTableId: !Ref PublicRouteTable
      DestinationCidrBlock: 0.0.0.0/0
      GatewayId: !Ref InternetGateway

  # ECS Cluster
  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: !Sub ${AWS::StackName}-cluster
      CapacityProviders:
        - FARGATE
      DefaultCapacityProviderStrategy:
        - CapacityProvider: FARGATE
          Weight: 1

  # ElastiCache Redis
  RedisSubnetGroup:
    Type: AWS::ElastiCache::SubnetGroup
    Properties:
      Description: Subnet group for Redis
      SubnetIds:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

  RedisCluster:
    Type: AWS::ElastiCache::ReplicationGroup
    Properties:
      ReplicationGroupDescription: Healthcare app Redis cluster
      ReplicationGroupId: !Sub ${AWS::StackName}-redis
      NodeType: cache.t3.micro
      Engine: redis
      NumCacheClusters: 2
      CacheSubnetGroupName: !Ref RedisSubnetGroup
      SecurityGroupIds:
        - !Ref RedisSecurityGroup
      Port: 6379

  # Security Groups
  ALBSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for ALB
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: 0.0.0.0/0

  ECSSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for ECS tasks
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 3000
          ToPort: 3003
          SourceSecurityGroupId: !Ref ALBSecurityGroup

  RedisSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for Redis
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 6379
          ToPort: 6379
          SourceSecurityGroupId: !Ref ECSSecurityGroup

  # Application Load Balancer
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: !Sub ${AWS::StackName}-alb
      Type: application
      Scheme: internet-facing
      SecurityGroups:
        - !Ref ALBSecurityGroup
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

Outputs:
  LoadBalancerDNS:
    Description: DNS name of the load balancer
    Value: !GetAtt ApplicationLoadBalancer.DNSName
    Export:
      Name: !Sub ${AWS::StackName}-LoadBalancerDNS

  RedisEndpoint:
    Description: Redis primary endpoint
    Value: !GetAtt RedisCluster.PrimaryEndPoint.Address
    Export:
      Name: !Sub ${AWS::StackName}-RedisEndpoint
```

Deploy with CloudFormation:
```bash
aws cloudformation create-stack \
  --stack-name healthcare-app-infra \
  --template-body file://aws/cloudformation.yml \
  --parameters ParameterKey=DomainName,ParameterValue=yourdomain.com \
  --capabilities CAPABILITY_IAM
```

### Auto Scaling Configuration
```bash
# Create auto scaling target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/healthcare-app-cluster/healthcare-app-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/healthcare-app-cluster/healthcare-app-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name healthcare-app-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

```json
{
  "TargetValue": 70.0,
  "PredefinedMetricSpecification": {
    "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
  },
  "ScaleOutCooldown": 300,
  "ScaleInCooldown": 300
}
```

## Azure Deployment

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                      Azure Infrastructure                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Application     │  │  Azure Cache    │  │  Application    │ │
│  │   Gateway       │  │   for Redis     │  │    Insights     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│           │                       │                       │    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Container Apps  │  │   Virtual       │  │    DNS Zone     │ │
│  │   Environment   │  │   Network       │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Prerequisites
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Set subscription
az account set --subscription "Your Subscription Name"

# Install Container Apps extension
az extension add --name containerapp --upgrade
```

### Resource Group and Network Setup
```bash
# Create resource group
az group create --name healthcare-app-rg --location eastus

# Create virtual network
az network vnet create \
  --resource-group healthcare-app-rg \
  --name healthcare-vnet \
  --address-prefix 10.0.0.0/16 \
  --subnet-name healthcare-subnet \
  --subnet-prefixes 10.0.1.0/24

# Create network security group
az network nsg create \
  --resource-group healthcare-app-rg \
  --name healthcare-nsg

# Add security rules
az network nsg rule create \
  --resource-group healthcare-app-rg \
  --nsg-name healthcare-nsg \
  --name AllowHTTPS \
  --protocol tcp \
  --priority 1000 \
  --destination-port-range 443 \
  --access allow
```

### Container Registry Setup
```bash
# Create Azure Container Registry
az acr create \
  --resource-group healthcare-app-rg \
  --name healthcareacr \
  --sku Basic \
  --admin-enabled true

# Login to registry
az acr login --name healthcareacr

# Build and push images
az acr build --registry healthcareacr --image healthcare-frontend:latest ./packages/frontend
az acr build --registry healthcareacr --image healthcare-backend:latest ./packages/backend
```

### Azure Cache for Redis
```bash
# Create Redis cache
az redis create \
  --resource-group healthcare-app-rg \
  --name healthcare-redis \
  --location eastus \
  --sku Standard \
  --vm-size c1 \
  --enable-non-ssl-port

# Get Redis connection details
az redis show-access-keys --resource-group healthcare-app-rg --name healthcare-redis
```

### Container Apps Environment
```bash
# Create Container Apps environment
az containerapp env create \
  --name healthcare-env \
  --resource-group healthcare-app-rg \
  --location eastus

# Get environment details
az containerapp env show --name healthcare-env --resource-group healthcare-app-rg
```

### Container App Deployment
```bash
# Deploy backend service
az containerapp create \
  --name healthcare-backend \
  --resource-group healthcare-app-rg \
  --environment healthcare-env \
  --image healthcareacr.azurecr.io/healthcare-backend:latest \
  --target-port 3003 \
  --ingress internal \
  --registry-server healthcareacr.azurecr.io \
  --registry-username healthcareacr \
  --registry-password $(az acr credential show --name healthcareacr --query passwords[0].value -o tsv) \
  --env-vars NODE_ENV=production REDIS_HOST=healthcare-redis.redis.cache.windows.net \
  --secrets icd11-client-id=$ICD11_CLIENT_ID icd11-client-secret=$ICD11_CLIENT_SECRET \
  --cpu 1.0 \
  --memory 2Gi \
  --min-replicas 2 \
  --max-replicas 10

# Deploy frontend service
az containerapp create \
  --name healthcare-frontend \
  --resource-group healthcare-app-rg \
  --environment healthcare-env \
  --image healthcareacr.azurecr.io/healthcare-frontend:latest \
  --target-port 3000 \
  --ingress external \
  --registry-server healthcareacr.azurecr.io \
  --registry-username healthcareacr \
  --registry-password $(az acr credential show --name healthcareacr --query passwords[0].value -o tsv) \
  --env-vars NODE_ENV=production NEXT_PUBLIC_API_URL=https://healthcare-backend.internal.azurecontainerapps.io/api \
  --cpu 0.5 \
  --memory 1Gi \
  --min-replicas 1 \
  --max-replicas 5
```

### ARM Template Deployment

Create a comprehensive ARM template:

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "location": {
      "type": "string",
      "defaultValue": "[resourceGroup().location]"
    },
    "environmentName": {
      "type": "string",
      "defaultValue": "healthcare-env"
    },
    "registryName": {
      "type": "string",
      "defaultValue": "healthcareacr"
    }
  },
  "variables": {
    "frontendAppName": "healthcare-frontend",
    "backendAppName": "healthcare-backend",
    "redisName": "healthcare-redis"
  },
  "resources": [
    {
      "type": "Microsoft.ContainerRegistry/registries",
      "apiVersion": "2021-09-01",
      "name": "[parameters('registryName')]",
      "location": "[parameters('location')]",
      "sku": {
        "name": "Standard"
      },
      "properties": {
        "adminUserEnabled": true
      }
    },
    {
      "type": "Microsoft.Cache/Redis",
      "apiVersion": "2020-12-01",
      "name": "[variables('redisName')]",
      "location": "[parameters('location')]",
      "properties": {
        "sku": {
          "name": "Standard",
          "family": "C",
          "capacity": 1
        },
        "enableNonSslPort": false,
        "minimumTlsVersion": "1.2"
      }
    },
    {
      "type": "Microsoft.App/managedEnvironments",
      "apiVersion": "2022-03-01",
      "name": "[parameters('environmentName')]",
      "location": "[parameters('location')]",
      "properties": {
        "appLogsConfiguration": {
          "destination": "log-analytics"
        }
      }
    },
    {
      "type": "Microsoft.App/containerApps",
      "apiVersion": "2022-03-01",
      "name": "[variables('backendAppName')]",
      "location": "[parameters('location')]",
      "dependsOn": [
        "[resourceId('Microsoft.App/managedEnvironments', parameters('environmentName'))]",
        "[resourceId('Microsoft.Cache/Redis', variables('redisName'))]"
      ],
      "properties": {
        "managedEnvironmentId": "[resourceId('Microsoft.App/managedEnvironments', parameters('environmentName'))]",
        "configuration": {
          "ingress": {
            "external": false,
            "targetPort": 3003
          },
          "registries": [
            {
              "server": "[concat(parameters('registryName'), '.azurecr.io')]",
              "username": "[parameters('registryName')]",
              "passwordSecretRef": "registry-password"
            }
          ],
          "secrets": [
            {
              "name": "registry-password",
              "value": "[listCredentials(resourceId('Microsoft.ContainerRegistry/registries', parameters('registryName')), '2021-09-01').passwords[0].value]"
            }
          ]
        },
        "template": {
          "containers": [
            {
              "name": "backend",
              "image": "[concat(parameters('registryName'), '.azurecr.io/healthcare-backend:latest')]",
              "env": [
                {
                  "name": "NODE_ENV",
                  "value": "production"
                },
                {
                  "name": "REDIS_HOST",
                  "value": "[concat(variables('redisName'), '.redis.cache.windows.net')]"
                }
              ],
              "resources": {
                "cpu": 1.0,
                "memory": "2Gi"
              }
            }
          ],
          "scale": {
            "minReplicas": 2,
            "maxReplicas": 10
          }
        }
      }
    }
  ],
  "outputs": {
    "frontendUrl": {
      "type": "string",
      "value": "[concat('https://', variables('frontendAppName'), '.', reference(resourceId('Microsoft.App/managedEnvironments', parameters('environmentName'))).defaultDomain)]"
    }
  }
}
```

Deploy the ARM template:
```bash
az deployment group create \
  --resource-group healthcare-app-rg \
  --template-file azure/arm-template.json \
  --parameters environmentName=healthcare-env registryName=healthcareacr
```

### Application Gateway for Custom Domain
```bash
# Create public IP
az network public-ip create \
  --resource-group healthcare-app-rg \
  --name healthcare-app-ip \
  --allocation-method Static \
  --sku Standard

# Create Application Gateway
az network application-gateway create \
  --name healthcare-app-gateway \
  --location eastus \
  --resource-group healthcare-app-rg \
  --vnet-name healthcare-vnet \
  --subnet healthcare-subnet \
  --capacity 2 \
  --sku Standard_v2 \
  --http-settings-cookie-based-affinity Disabled \
  --frontend-port 80 \
  --http-settings-port 80 \
  --http-settings-protocol Http \
  --public-ip-address healthcare-app-ip
```

## Google Cloud Platform Deployment

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                        GCP Infrastructure                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Cloud Load    │  │   Memorystore   │  │   Cloud         │ │
│  │   Balancing     │  │     Redis       │  │   Monitoring    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│           │                       │                       │    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Cloud Run     │  │      VPC        │  │   Cloud DNS     │ │
│  │   Services      │  │   Networking    │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Prerequisites
```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize gcloud
gcloud init

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable compute.googleapis.com
```

### Project Setup
```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Set default region
gcloud config set compute/region us-central1
gcloud config set compute/zone us-central1-a
```

### Container Registry and Build
```bash
# Configure Docker for Google Cloud
gcloud auth configure-docker

# Build and push images using Cloud Build
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/healthcare-frontend ./packages/frontend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/healthcare-backend ./packages/backend

# Or use local Docker
docker build -t gcr.io/YOUR_PROJECT_ID/healthcare-frontend ./packages/frontend
docker push gcr.io/YOUR_PROJECT_ID/healthcare-frontend

docker build -t gcr.io/YOUR_PROJECT_ID/healthcare-backend ./packages/backend
docker push gcr.io/YOUR_PROJECT_ID/healthcare-backend
```

### Memorystore Redis Setup
```bash
# Create Redis instance
gcloud redis instances create healthcare-redis \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_6_x \
  --network=default
```

### Secret Manager Configuration
```bash
# Create secrets
echo -n "your_client_id" | gcloud secrets create icd11-client-id --data-file=-
echo -n "your_client_secret" | gcloud secrets create icd11-client-secret --data-file=-

# Grant access to secrets
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Cloud Run Deployment
```bash
# Deploy backend service
gcloud run deploy healthcare-backend \
  --image gcr.io/YOUR_PROJECT_ID/healthcare-backend \
  --platform managed \
  --region us-central1 \
  --no-allow-unauthenticated \
  --set-env-vars NODE_ENV=production,REDIS_HOST=10.x.x.x \
  --set-secrets ICD11_CLIENT_ID=icd11-client-id:latest,ICD11_CLIENT_SECRET=icd11-client-secret:latest \
  --memory 2Gi \
  --cpu 2 \
  --concurrency 1000 \
  --max-instances 10 \
  --min-instances 1 \
  --port 3003

# Deploy frontend service
gcloud run deploy healthcare-frontend \
  --image gcr.io/YOUR_PROJECT_ID/healthcare-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,NEXT_PUBLIC_API_URL=https://healthcare-backend-xxxxxxxxxx-uc.a.run.app/api \
  --memory 1Gi \
  --cpu 1 \
  --concurrency 1000 \
  --max-instances 5 \
  --min-instances 0 \
  --port 3000
```

### Cloud Build Configuration

Create `cloudbuild.yaml` for automated deployments:

```yaml
# cloudbuild.yaml
steps:
  # Build frontend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/healthcare-frontend', './packages/frontend']
    
  # Build backend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/healthcare-backend', './packages/backend']
    
  # Push frontend image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/healthcare-frontend']
    
  # Push backend image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/healthcare-backend']
    
  # Deploy backend to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'healthcare-backend'
      - '--image'
      - 'gcr.io/$PROJECT_ID/healthcare-backend'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--no-allow-unauthenticated'
      - '--set-env-vars'
      - 'NODE_ENV=production'
      
  # Deploy frontend to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'healthcare-frontend'
      - '--image'
      - 'gcr.io/$PROJECT_ID/healthcare-frontend'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'

options:
  logging: CLOUD_LOGGING_ONLY

substitutions:
  _DEPLOY_REGION: us-central1
```

Trigger the build:
```bash
gcloud builds submit --config cloudbuild.yaml .
```

### Load Balancer Setup for Custom Domain
```bash
# Create global IP address
gcloud compute addresses create healthcare-app-ip --global

# Create backend service
gcloud compute backend-services create healthcare-frontend-backend \
  --protocol=HTTP \
  --port-name=http \
  --health-checks=healthcare-health-check \
  --global

# Create URL map
gcloud compute url-maps create healthcare-url-map \
  --default-service healthcare-frontend-backend

# Create HTTP(S) load balancer
gcloud compute target-https-proxies create healthcare-https-proxy \
  --url-map healthcare-url-map \
  --ssl-certificates healthcare-ssl-cert

# Create forwarding rule
gcloud compute forwarding-rules create healthcare-https-rule \
  --address healthcare-app-ip \
  --global \
  --target-https-proxy healthcare-https-proxy \
  --ports 443
```

### Deployment Script

Create a deployment script for GCP:

```bash
#!/bin/bash
# deploy-gcp.sh

set -e

PROJECT_ID=$1
REGION=${2:-us-central1}

if [ -z "$PROJECT_ID" ]; then
  echo "Usage: $0 <PROJECT_ID> [REGION]"
  exit 1
fi

echo "Deploying to GCP project: $PROJECT_ID"
echo "Region: $REGION"

# Set project
gcloud config set project $PROJECT_ID

# Build and deploy
gcloud builds submit --config cloudbuild.yaml .

# Get service URLs
BACKEND_URL=$(gcloud run services describe healthcare-backend --platform managed --region $REGION --format 'value(status.url)')
FRONTEND_URL=$(gcloud run services describe healthcare-frontend --platform managed --region $REGION --format 'value(status.url)')

echo "Deployment complete!"
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL: $BACKEND_URL"
```

Make it executable and run:
```bash
chmod +x deploy-gcp.sh
./deploy-gcp.sh YOUR_PROJECT_ID us-central1
```

## CI/CD Pipeline Setup

### GitHub Actions

Create comprehensive GitHub Actions workflows for automated deployment:

#### Main Deployment Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: [frontend, backend]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: packages/${{ matrix.package }}/package-lock.json
      
      - name: Install dependencies
        run: |
          cd packages/${{ matrix.package }}
          npm ci
      
      - name: Run tests
        run: |
          cd packages/${{ matrix.package }}
          npm test
      
      - name: Run linting
        run: |
          cd packages/${{ matrix.package }}
          npm run lint
      
      - name: Type check
        run: |
          cd packages/${{ matrix.package }}
          npm run type-check
        if: matrix.package == 'frontend'

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run security audit
        run: |
          cd packages/frontend && npm audit --audit-level moderate
          cd packages/backend && npm audit --audit-level moderate
      
      - name: Run CodeQL Analysis
        uses: github/codeql-action/analyze@v2
        with:
          languages: javascript

  build-and-deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push frontend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: healthcare-frontend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG ./packages/frontend
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
      
      - name: Build and push backend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: healthcare-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG ./packages/backend
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster healthcare-app-cluster \
            --service healthcare-app-service \
            --force-new-deployment
      
      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster healthcare-app-cluster \
            --services healthcare-app-service
      
      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Healthcare app deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  health-check:
    needs: build-and-deploy
    runs-on: ubuntu-latest
    steps:
      - name: Health check
        run: |
          # Wait for services to be ready
          sleep 60
          
          # Check frontend health
          curl -f https://yourdomain.com/health || exit 1
          
          # Check backend health
          curl -f https://yourdomain.com/api/health || exit 1
          
          echo "All health checks passed!"
```

#### Multi-Environment Deployment
```yaml
# .github/workflows/deploy-environments.yml
name: Deploy to Environments

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        type: choice
        options:
          - development
          - staging
          - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set environment variables
        run: |
          case "${{ github.event.inputs.environment }}" in
            development)
              echo "CLUSTER_NAME=healthcare-dev-cluster" >> $GITHUB_ENV
              echo "SERVICE_NAME=healthcare-dev-service" >> $GITHUB_ENV
              echo "DOMAIN=dev.yourdomain.com" >> $GITHUB_ENV
              ;;
            staging)
              echo "CLUSTER_NAME=healthcare-staging-cluster" >> $GITHUB_ENV
              echo "SERVICE_NAME=healthcare-staging-service" >> $GITHUB_ENV
              echo "DOMAIN=staging.yourdomain.com" >> $GITHUB_ENV
              ;;
            production)
              echo "CLUSTER_NAME=healthcare-prod-cluster" >> $GITHUB_ENV
              echo "SERVICE_NAME=healthcare-prod-service" >> $GITHUB_ENV
              echo "DOMAIN=yourdomain.com" >> $GITHUB_ENV
              ;;
          esac
      
      - name: Deploy to ${{ github.event.inputs.environment }}
        run: |
          echo "Deploying to ${{ github.event.inputs.environment }}"
          # Add deployment logic here
```

### GitLab CI/CD

Create a comprehensive GitLab CI configuration:

```yaml
# .gitlab-ci.yml
stages:
  - test
  - security
  - build
  - deploy
  - verify

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

# Test Stage
test:frontend:
  stage: test
  image: node:18-alpine
  before_script:
    - cd packages/frontend
    - npm ci
  script:
    - npm test
    - npm run lint
    - npm run type-check
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: packages/frontend/coverage/cobertura-coverage.xml

test:backend:
  stage: test
  image: node:18-alpine
  services:
    - redis:7-alpine
  variables:
    REDIS_HOST: redis
  before_script:
    - cd packages/backend
    - npm ci
  script:
    - npm test
    - npm run test:e2e
    - npm run lint
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'

# Security Stage
security:audit:
  stage: security
  image: node:18-alpine
  script:
    - cd packages/frontend && npm audit --audit-level moderate
    - cd packages/backend && npm audit --audit-level moderate
  allow_failure: true

security:sast:
  stage: security
  include:
    - template: Security/SAST.gitlab-ci.yml

# Build Stage
build:frontend:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  variables:
    IMAGE_TAG: $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $IMAGE_TAG ./packages/frontend
    - docker push $IMAGE_TAG
    - docker tag $IMAGE_TAG $CI_REGISTRY_IMAGE/frontend:latest
    - docker push $CI_REGISTRY_IMAGE/frontend:latest
  only:
    - main
    - develop

build:backend:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  variables:
    IMAGE_TAG: $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $IMAGE_TAG ./packages/backend
    - docker push $IMAGE_TAG
    - docker tag $IMAGE_TAG $CI_REGISTRY_IMAGE/backend:latest
    - docker push $CI_REGISTRY_IMAGE/backend:latest
  only:
    - main
    - develop

# Deploy Stages
deploy:development:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl jq
  script:
    - echo "Deploying to development environment"
    - curl -X POST "$DEV_WEBHOOK_URL" -H "Content-Type: application/json" -d '{"ref":"'$CI_COMMIT_SHA'"}'
  environment:
    name: development
    url: https://dev.yourdomain.com
  only:
    - develop

deploy:staging:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl jq
  script:
    - echo "Deploying to staging environment"
    - curl -X POST "$STAGING_WEBHOOK_URL" -H "Content-Type: application/json" -d '{"ref":"'$CI_COMMIT_SHA'"}'
  environment:
    name: staging
    url: https://staging.yourdomain.com
  only:
    - main
  when: manual

deploy:production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl jq
  script:
    - echo "Deploying to production environment"
    # Add production deployment logic
  environment:
    name: production
    url: https://yourdomain.com
  only:
    - main
  when: manual

# Verification Stage
verify:deployment:
  stage: verify
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
  script:
    - sleep 60  # Wait for deployment
    - curl -f $CI_ENVIRONMENT_URL/health
    - curl -f $CI_ENVIRONMENT_URL/api/health
    - echo "Health checks passed!"
  only:
    - main
    - develop
```

### Azure DevOps Pipeline

Create Azure DevOps pipeline:

```yaml
# azure-pipelines.yml
trigger:
- main
- develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  nodeVersion: '18.x'
  containerRegistry: 'healthcareacr.azurecr.io'

stages:
- stage: Test
  displayName: 'Test Stage'
  jobs:
  - job: TestFrontend
    displayName: 'Test Frontend'
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: $(nodeVersion)
    - script: |
        cd packages/frontend
        npm ci
        npm test
        npm run lint
      displayName: 'Test Frontend'

  - job: TestBackend
    displayName: 'Test Backend'
    services:
      redis: redis:7-alpine
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: $(nodeVersion)
    - script: |
        cd packages/backend
        npm ci
        npm test
        npm run lint
      displayName: 'Test Backend'

- stage: Build
  displayName: 'Build Stage'
  condition: and(succeeded(), in(variables['Build.SourceBranch'], 'refs/heads/main', 'refs/heads/develop'))
  jobs:
  - job: BuildImages
    displayName: 'Build Docker Images'
    steps:
    - task: Docker@2
      displayName: 'Build Frontend Image'
      inputs:
        containerRegistry: 'Azure Container Registry'
        repository: 'healthcare-frontend'
        command: 'buildAndPush'
        Dockerfile: './packages/frontend/Dockerfile'
        tags: |
          $(Build.BuildId)
          latest

    - task: Docker@2
      displayName: 'Build Backend Image'
      inputs:
        containerRegistry: 'Azure Container Registry'
        repository: 'healthcare-backend'
        command: 'buildAndPush'
        Dockerfile: './packages/backend/Dockerfile'
        tags: |
          $(Build.BuildId)
          latest

- stage: Deploy
  displayName: 'Deploy Stage'
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  jobs:
  - deployment: DeployToProduction
    displayName: 'Deploy to Production'
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureContainerApps@1
            displayName: 'Deploy to Container Apps'
            inputs:
              azureSubscription: 'Azure Service Connection'
              resourceGroup: 'healthcare-app-rg'
              containerAppName: 'healthcare-frontend'
              imageName: '$(containerRegistry)/healthcare-frontend:$(Build.BuildId)'
```

## Security Best Practices

### Infrastructure Security

#### Network Security
```bash
# AWS Security Groups
aws ec2 create-security-group \
  --group-name healthcare-app-sg \
  --description "Healthcare app security group" \
  --vpc-id vpc-xxxxxxxxx

# Allow HTTPS only
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Allow HTTP for redirect
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# Internal communication only
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 3003 \
  --source-group sg-xxxxxxxxx
```

#### Secrets Management

**AWS Secrets Manager**
```bash
# Store WHO API credentials
aws secretsmanager create-secret \
  --name healthcare/icd11/credentials \
  --description "WHO ICD-11 API credentials" \
  --secret-string '{
    "client_id":"your_client_id",
    "client_secret":"your_client_secret"
  }'

# Store Redis password
aws secretsmanager create-secret \
  --name healthcare/redis/password \
  --description "Redis password" \
  --secret-string "your_secure_redis_password"
```

**Azure Key Vault**
```bash
# Create Key Vault
az keyvault create \
  --name healthcare-keyvault \
  --resource-group healthcare-app-rg \
  --location eastus

# Store secrets
az keyvault secret set \
  --vault-name healthcare-keyvault \
  --name icd11-client-id \
  --value "your_client_id"

az keyvault secret set \
  --vault-name healthcare-keyvault \
  --name icd11-client-secret \
  --value "your_client_secret"
```

**Google Secret Manager**
```bash
# Create secrets
gcloud secrets create icd11-client-id --data-file=-
gcloud secrets create icd11-client-secret --data-file=-
gcloud secrets create redis-password --data-file=-

# Grant access
gcloud secrets add-iam-policy-binding icd11-client-id \
  --member="serviceAccount:healthcare-app@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Application Security

#### Environment Variable Security
```bash
# Generate secure passwords
openssl rand -base64 32  # JWT secret
openssl rand -base64 32  # Session secret
openssl rand -base64 32  # Redis password

# Validate environment variables on startup
export ICD11_CLIENT_ID="your_client_id"
export ICD11_CLIENT_SECRET="your_client_secret"
export JWT_SECRET="$(openssl rand -base64 32)"
export SESSION_SECRET="$(openssl rand -base64 32)"
export REDIS_PASSWORD="$(openssl rand -base64 32)"
```

#### SSL/TLS Configuration

**Let's Encrypt with Certbot**
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

**AWS Certificate Manager**
```bash
# Request certificate
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names www.yourdomain.com \
  --validation-method DNS \
  --region us-east-1
```

#### Security Headers Configuration

**Nginx Security Headers**
```nginx
# nginx/security.conf
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://id.who.int;" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

### Healthcare Compliance

#### HIPAA Compliance Checklist
- [ ] **Encryption**: All data encrypted in transit and at rest
- [ ] **Access Controls**: Role-based access control implemented
- [ ] **Audit Logging**: Comprehensive audit trails
- [ ] **Data Backup**: Regular encrypted backups
- [ ] **Incident Response**: Security incident response plan
- [ ] **Training**: Staff security awareness training
- [ ] **Risk Assessment**: Regular security risk assessments

#### Data Encryption
```bash
# Encrypt environment files
gpg --symmetric --cipher-algo AES256 .env.prod
gpg --symmetric --cipher-algo AES256 docker-compose.prod.yml

# Decrypt for deployment
gpg --decrypt .env.prod.gpg > .env.prod
```

## Monitoring and Observability

### Application Monitoring

#### Prometheus and Grafana Setup

**Docker Compose for Monitoring**
```yaml
# monitoring/docker-compose.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"

  redis-exporter:
    image: oliver006/redis_exporter:latest
    environment:
      - REDIS_ADDR=redis://redis:6379
    ports:
      - "9121:9121"

volumes:
  prometheus-data:
  grafana-data:
```

**Prometheus Configuration**
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'healthcare-app'
    static_configs:
      - targets: ['frontend:3000', 'backend:3003']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

#### Application Metrics

**Backend Metrics (NestJS)**
```typescript
// metrics.service.ts
import { Injectable } from '@nestjs/common';
import { register, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
  });

  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route']
  });

  private readonly redisConnections = new Gauge({
    name: 'redis_connections_active',
    help: 'Number of active Redis connections'
  });

  constructor() {
    register.registerMetric(this.httpRequestTotal);
    register.registerMetric(this.httpRequestDuration);
    register.registerMetric(this.redisConnections);
  }

  incrementHttpRequests(method: string, route: string, statusCode: number) {
    this.httpRequestTotal.inc({ method, route, status_code: statusCode });
  }

  observeHttpDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  setRedisConnections(count: number) {
    this.redisConnections.set(count);
  }

  getMetrics() {
    return register.metrics();
  }
}
```

#### Health Check Endpoints

**Comprehensive Health Checks**
```typescript
// health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private readonly cacheService: CacheService,
    private readonly httpService: HttpService
  ) {}

  @Get()
  async healthCheck(): Promise<HealthCheckResult> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkWHOAPI(),
      this.checkMemoryUsage(),
      this.checkDiskSpace()
    ]);

    const results = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: this.getCheckResult(checks[0]),
        redis: this.getCheckResult(checks[1]),
        whoapi: this.getCheckResult(checks[2]),
        memory: this.getCheckResult(checks[3]),
        disk: this.getCheckResult(checks[4])
      }
    };

    const hasFailures = Object.values(results.checks)
      .some(check => check.status === 'error');
    
    if (hasFailures) {
      results.status = 'error';
    }

    return results;
  }

  private async checkRedis(): Promise<HealthCheck> {
    try {
      const start = Date.now();
      await this.cacheService.get('health-check');
      const responseTime = Date.now() - start;
      
      return {
        status: 'ok',
        responseTime,
        message: 'Redis is accessible'
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Redis check failed: ${error.message}`
      };
    }
  }

  private async checkWHOAPI(): Promise<HealthCheck> {
    try {
      const start = Date.now();
      const response = await this.httpService.get(
        'https://id.who.int/icd/api',
        { timeout: 5000 }
      ).toPromise();
      const responseTime = Date.now() - start;
      
      return {
        status: response.status === 200 ? 'ok' : 'warning',
        responseTime,
        message: 'WHO API is accessible'
      };
    } catch (error) {
      return {
        status: 'error',
        message: `WHO API check failed: ${error.message}`
      };
    }
  }

  private async checkMemoryUsage(): Promise<HealthCheck> {
    const usage = process.memoryUsage();
    const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const usagePercent = (usedMB / totalMB) * 100;

    return {
      status: usagePercent > 90 ? 'warning' : 'ok',
      details: {
        totalMB,
        usedMB,
        usagePercent: Math.round(usagePercent)
      },
      message: `Memory usage: ${usedMB}/${totalMB}MB (${Math.round(usagePercent)}%)`
    };
  }
}
```

### Logging Strategy

#### Structured Logging with Winston
```typescript
// logger.service.ts
import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
          const logObject = {
            timestamp,
            level,
            message,
            service: 'icd11-backend',
            environment: process.env.NODE_ENV,
            version: process.env.APP_VERSION,
            ...meta
          };

          if (stack) {
            logObject.stack = stack;
          }

          return JSON.stringify(logObject);
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ]
    });

    // Add CloudWatch transport in production
    if (process.env.NODE_ENV === 'production') {
      this.addCloudWatchTransport();
    }
  }

  private addCloudWatchTransport() {
    const WinstonCloudWatch = require('winston-cloudwatch');
    
    this.logger.add(new WinstonCloudWatch({
      logGroupName: 'healthcare-app-logs',
      logStreamName: `${process.env.NODE_ENV}-${new Date().toISOString().split('T')[0]}`,
      awsRegion: process.env.AWS_REGION || 'us-east-1',
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY
    }));
  }

  log(level: string, message: string, meta?: any) {
    this.logger.log(level, message, meta);
  }

  error(message: string, error?: Error, meta?: any) {
    this.logger.error(message, { error: error?.message, stack: error?.stack, ...meta });
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }
}
```

#### Centralized Logging with ELK Stack

**Docker Compose with ELK**
```yaml
# logging/docker-compose.elk.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    ports:
      - "5000:5000"
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  elasticsearch-data:
```

### Error Tracking and Alerting

#### Sentry Integration
```typescript
// sentry.service.ts
import * as Sentry from '@sentry/node';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SentryService {
  constructor() {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      beforeSend(event) {
        // Filter out sensitive information
        if (event.request?.headers?.authorization) {
          delete event.request.headers.authorization;
        }
        return event;
      }
    });
  }

  captureException(error: Error, context?: any) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('additional', context);
      }
      Sentry.captureException(error);
    });
  }

  captureMessage(message: string, level: Sentry.Severity = Sentry.Severity.Info) {
    Sentry.captureMessage(message, level);
  }

  setUser(user: { id: string; email?: string }) {
    Sentry.setUser(user);
  }
}
```

#### PagerDuty Integration
```bash
# Create PagerDuty webhook for critical alerts
curl -X POST "https://events.pagerduty.com/v2/enqueue" \
  -H "Content-Type: application/json" \
  -d '{
    "routing_key": "YOUR_ROUTING_KEY",
    "event_action": "trigger",
    "payload": {
      "summary": "Healthcare app critical error",
      "source": "healthcare-app",
      "severity": "critical",
      "custom_details": {
        "error": "WHO API connection failed",
        "environment": "production"
      }
    }
  }'
```

## Backup and Disaster Recovery

### Data Backup Strategy

#### Redis Backup Automation
```bash
#!/bin/bash
# backup-redis.sh

set -e

BACKUP_DIR="/backup/redis"
DATE=$(date +%Y%m%d_%H%M%S)
REDIS_CONTAINER="healthcare_redis_1"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create Redis snapshot
docker exec $REDIS_CONTAINER redis-cli BGSAVE

# Wait for background save to complete
while [ $(docker exec $REDIS_CONTAINER redis-cli LASTSAVE) -eq $(docker exec $REDIS_CONTAINER redis-cli LASTSAVE) ]; do
  sleep 1
done

# Copy dump file
docker cp $REDIS_CONTAINER:/data/dump.rdb $BACKUP_DIR/dump_$DATE.rdb

# Compress backup
gzip $BACKUP_DIR/dump_$DATE.rdb

# Upload to cloud storage
aws s3 cp $BACKUP_DIR/dump_$DATE.rdb.gz s3://healthcare-backups/redis/

# Clean up old backups (keep last 30 days)
find $BACKUP_DIR -name "dump_*.rdb.gz" -mtime +30 -delete

echo "Redis backup completed: dump_$DATE.rdb.gz"
```

#### Application Configuration Backup
```bash
#!/bin/bash
# backup-config.sh

set -e

BACKUP_DIR="/backup/config"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/app"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup environment files
tar -czf $BACKUP_DIR/config_$DATE.tar.gz \
  $APP_DIR/.env* \
  $APP_DIR/docker-compose*.yml \
  $APP_DIR/nginx/ \
  $APP_DIR/scripts/

# Upload to cloud storage
aws s3 cp $BACKUP_DIR/config_$DATE.tar.gz s3://healthcare-backups/config/

# Clean up old backups
find $BACKUP_DIR -name "config_*.tar.gz" -mtime +90 -delete

echo "Configuration backup completed: config_$DATE.tar.gz"
```

### Disaster Recovery Plan

#### Recovery Time Objectives (RTO)
- **Critical Services**: 15 minutes
- **Non-Critical Services**: 1 hour
- **Complete System Recovery**: 4 hours

#### Recovery Point Objectives (RPO)
- **Redis Data**: 15 minutes
- **Configuration**: 1 hour
- **Application Code**: Real-time (Git)

#### Recovery Procedures

**1. Complete System Recovery**
```bash
#!/bin/bash
# disaster-recovery.sh

set -e

echo "Starting disaster recovery procedure..."

# 1. Restore infrastructure
echo "Restoring infrastructure..."
./scripts/deploy-infrastructure.sh

# 2. Restore configuration
echo "Restoring configuration..."
aws s3 cp s3://healthcare-backups/config/latest.tar.gz ./
tar -xzf latest.tar.gz

# 3. Restore Redis data
echo "Restoring Redis data..."
aws s3 cp s3://healthcare-backups/redis/latest.rdb.gz ./
gunzip latest.rdb.gz
docker cp latest.rdb redis:/data/dump.rdb
docker restart redis

# 4. Deploy application
echo "Deploying application..."
docker-compose -f docker-compose.prod.yml up -d

# 5. Verify health
echo "Verifying system health..."
sleep 60
curl -f https://yourdomain.com/health
curl -f https://yourdomain.com/api/health

echo "Disaster recovery completed successfully!"
```

**2. Database Failover**
```bash
#!/bin/bash
# redis-failover.sh

set -e

PRIMARY_REDIS="redis-primary"
BACKUP_REDIS="redis-backup"

echo "Initiating Redis failover..."

# 1. Stop primary Redis
docker stop $PRIMARY_REDIS

# 2. Promote backup to primary
docker exec $BACKUP_REDIS redis-cli SLAVEOF NO ONE

# 3. Update application configuration
docker exec backend sh -c "export REDIS_HOST=$BACKUP_REDIS && supervisorctl restart backend"

# 4. Verify connectivity
docker exec backend redis-cli -h $BACKUP_REDIS ping

echo "Redis failover completed!"
```

### Business Continuity

#### Incident Response Plan

**1. Incident Detection**
```yaml
# monitoring/alerts.yml
groups:
- name: healthcare-app
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.1
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value }} requests per second"

  - alert: ServiceDown
    expr: up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Service is down"
      description: "{{ $labels.instance }} has been down for more than 1 minute"

  - alert: RedisConnectionFailed
    expr: redis_connected_clients == 0
    for: 30s
    labels:
      severity: critical
    annotations:
      summary: "Redis connection failed"
      description: "No clients connected to Redis"
```

**2. Notification Channels**
```yaml
# alertmanager.yml
global:
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alerts@yourdomain.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
- name: 'web.hook'
  slack_configs:
  - api_url: 'YOUR_SLACK_WEBHOOK_URL'
    channel: '#alerts'
    title: 'Healthcare App Alert'
    text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

  pagerduty_configs:
  - routing_key: 'YOUR_PAGERDUTY_KEY'
    description: '{{ .GroupLabels.alertname }}'

  email_configs:
  - to: 'oncall@yourdomain.com'
    subject: 'Healthcare App Alert: {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      {{ end }}
```

**3. Communication Plan**
```bash
#!/bin/bash
# notify-stakeholders.sh

INCIDENT_TYPE=$1
SEVERITY=$2
MESSAGE=$3

case $SEVERITY in
  critical)
    # Notify everyone
    ./notify-slack.sh "#general" "🚨 CRITICAL: $MESSAGE"
    ./notify-email.sh "all-staff@yourdomain.com" "Critical Incident: $INCIDENT_TYPE"
    ./notify-pagerduty.sh "$INCIDENT_TYPE" "critical"
    ;;
  warning)
    # Notify technical team
    ./notify-slack.sh "#technical" "⚠️ WARNING: $MESSAGE"
    ./notify-email.sh "tech-team@yourdomain.com" "Warning: $INCIDENT_TYPE"
    ;;
  info)
    # Notify management
    ./notify-slack.sh "#management" "ℹ️ INFO: $MESSAGE"
    ;;
esac
```

## Performance Optimization

### Application Performance

#### Caching Strategy Implementation
```typescript
// cache-strategy.service.ts
@Injectable()
export class CacheStrategyService {
  constructor(private readonly cacheService: CacheService) {}

  // Multi-level caching for WHO API responses
  async getWithCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    // Level 1: Memory cache (fastest)
    let cached = this.memoryCache.get<T>(key);
    if (cached) {
      return cached;
    }

    // Level 2: Redis cache (fast)
    cached = await this.cacheService.get<T>(key);
    if (cached) {
      this.memoryCache.set(key, cached, 300); // 5 min memory cache
      return cached;
    }

    // Level 3: Fetch from source (slowest)
    const result = await fetchFn();
    
    // Store in both caches
    await this.cacheService.set(key, result, ttl);
    this.memoryCache.set(key, result, 300);
    
    return result;
  }

  // Cache warming for popular searches
  async warmCache() {
    const popularSearches = [
      'diabetes', 'hypertension', 'covid', 'pneumonia',
      'depression', 'anxiety', 'cancer', 'stroke'
    ];

    await Promise.all(
      popularSearches.map(async (term) => {
        const key = `search:${term}`;
        try {
          await this.whoApiService.search(term);
          this.logger.debug(`Warmed cache for: ${term}`);
        } catch (error) {
          this.logger.error(`Cache warming failed for ${term}:`, error);
        }
      })
    );
  }
}
```

#### Database Query Optimization
```typescript
// optimized-search.service.ts
@Injectable()
export class OptimizedSearchService {
  async search(query: string, options: SearchOptions): Promise<SearchResult[]> {
    // Implement search result caching with pagination
    const cacheKey = this.buildCacheKey(query, options);
    
    // Check if we have cached results
    let results = await this.cacheService.get<SearchResult[]>(cacheKey);
    
    if (!results) {
      // Batch multiple WHO API requests
      const batchRequests = this.buildBatchRequests(query, options);
      const responses = await Promise.allSettled(batchRequests);
      
      results = this.mergeResponses(responses);
      
      // Cache with appropriate TTL based on query type
      const ttl = this.determineTTL(query, options);
      await this.cacheService.set(cacheKey, results, ttl);
    }

    return this.applyClientSidePagination(results, options);
  }

  private buildBatchRequests(query: string, options: SearchOptions): Promise<any>[] {
    const requests = [];
    
    // Main search request
    requests.push(this.whoApiService.search(query, options));
    
    // Prefetch related terms if query is specific enough
    if (query.length > 3) {
      const relatedTerms = this.generateRelatedTerms(query);
      relatedTerms.forEach(term => {
        requests.push(this.whoApiService.search(term, { ...options, limit: 5 }));
      });
    }
    
    return requests;
  }

  private determineTTL(query: string, options: SearchOptions): number {
    // Longer cache for specific medical terms
    if (this.isMedicalTerm(query)) {
      return 3600; // 1 hour
    }
    
    // Shorter cache for general searches
    return 1800; // 30 minutes
  }
}
```

### Infrastructure Performance

#### Load Balancer Configuration
```nginx
# nginx/performance.conf
upstream frontend {
    least_conn;
    server frontend-1:3000 max_fails=3 fail_timeout=30s;
    server frontend-2:3000 max_fails=3 fail_timeout=30s;
    server frontend-3:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream backend {
    least_conn;
    server backend-1:3003 max_fails=3 fail_timeout=30s;
    server backend-2:3003 max_fails=3 fail_timeout=30s;
    server backend-3:3003 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# Caching configuration
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m use_temp_path=off;

server {
    listen 443 ssl http2;
    
    # Enable compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API response caching
    location /api/ {
        proxy_cache api_cache;
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 404 1m;
        proxy_cache_key "$scheme$request_method$host$request_uri";
        add_header X-Cache-Status $upstream_cache_status;
        
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Connection pooling
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

#### Auto-scaling Configuration

**AWS Auto Scaling**
```json
{
  "AutoScalingGroupName": "healthcare-app-asg",
  "MinSize": 2,
  "MaxSize": 20,
  "DesiredCapacity": 4,
  "DefaultCooldown": 300,
  "HealthCheckType": "ELB",
  "HealthCheckGracePeriod": 300,
  "Tags": [
    {
      "Key": "Name",
      "Value": "healthcare-app-instance",
      "PropagateAtLaunch": true
    }
  ]
}
```

**Kubernetes HPA**
```yaml
# k8s/hpa.yml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: healthcare-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: healthcare-app
  minReplicas: 3
  maxReplicas: 50
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
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max
```

### CDN Configuration

#### CloudFront Distribution
```json
{
  "DistributionConfig": {
    "CallerReference": "healthcare-app-cdn",
    "Comment": "Healthcare app CDN distribution",
    "DefaultRootObject": "index.html",
    "Origins": [
      {
        "Id": "healthcare-app-origin",
        "DomainName": "yourdomain.com",
        "CustomOriginConfig": {
          "HTTPPort": 443,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "https-only",
          "OriginSSLProtocols": ["TLSv1.2"]
        }
      }
    ],
    "DefaultCacheBehavior": {
      "TargetOriginId": "healthcare-app-origin",
      "ViewerProtocolPolicy": "redirect-to-https",
      "Compress": true,
      "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
      "OriginRequestPolicyId": "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
    },
    "CacheBehaviors": [
      {
        "PathPattern": "/api/*",
        "TargetOriginId": "healthcare-app-origin",
        "ViewerProtocolPolicy": "https-only",
        "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
        "TTL": 300
      },
      {
        "PathPattern": "/static/*",
        "TargetOriginId": "healthcare-app-origin",
        "ViewerProtocolPolicy": "https-only",
        "CachePolicyId": "b2884449-e4de-46a7-ac36-70bc7f1ddd6d",
        "TTL": 31536000
      }
    ],
    "Enabled": true,
    "PriceClass": "PriceClass_100"
  }
}
```

## Cost Optimization

### Cloud Cost Management

#### AWS Cost Optimization
```bash
# Use Spot Instances for non-critical workloads
aws ec2 request-spot-instances \
  --spot-price "0.10" \
  --instance-count 2 \
  --type "one-time" \
  --launch-specification file://spot-instance-config.json

# Reserved Instances for predictable workloads
aws ec2 purchase-reserved-instances-offering \
  --reserved-instances-offering-id "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  --instance-count 2

# Auto Scaling based on schedule
aws autoscaling put-scheduled-update-group-action \
  --auto-scaling-group-name healthcare-app-asg \
  --scheduled-action-name scale-down-evening \
  --recurrence "0 22 * * *" \
  --desired-capacity 2 \
  --min-size 2 \
  --max-size 5
```

#### Azure Cost Optimization
```bash
# Use Azure Reserved VM Instances
az vm reservation create \
  --reserved-vm-instance-name healthcare-reservation \
  --vm-size Standard_D2s_v3 \
  --instance-count 2 \
  --term P1Y \
  --scope Subscription

# Auto-shutdown for development environments
az vm auto-shutdown \
  --resource-group healthcare-dev-rg \
  --name healthcare-dev-vm \
  --time 1900
```

#### GCP Cost Optimization
```bash
# Use Preemptible VM instances
gcloud compute instances create healthcare-worker \
  --preemptible \
  --machine-type=e2-medium \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud

# Committed use discounts
gcloud compute commitments create healthcare-commitment \
  --plan=12-month \
  --resources=vcpu=10,memory=40GB \
  --region=us-central1
```

### Resource Optimization

#### Container Resource Limits
```yaml
# k8s/deployment.yml with optimized resources
apiVersion: apps/v1
kind: Deployment
metadata:
  name: healthcare-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: backend
        image: healthcare-backend:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3003
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3003
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Database Resource Optimization
```bash
# Redis memory optimization
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Monitor Redis memory usage
redis-cli INFO memory
```

### Cost Monitoring

#### AWS Cost Explorer API
```python
# cost-monitoring.py
import boto3
from datetime import datetime, timedelta

def get_daily_costs():
    client = boto3.client('ce')
    
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    
    response = client.get_cost_and_usage(
        TimePeriod={
            'Start': start_date,
            'End': end_date
        },
        Granularity='DAILY',
        Metrics=['UnblendedCost'],
        GroupBy=[
            {
                'Type': 'DIMENSION',
                'Key': 'SERVICE'
            }
        ],
        Filter={
            'Dimensions': {
                'Key': 'SERVICE',
                'Values': ['Amazon Elastic Compute Cloud - Compute']
            }
        }
    )
    
    return response['ResultsByTime']

# Set up cost alerts
def create_cost_budget():
    client = boto3.client('budgets')
    
    budget = {
        'BudgetName': 'healthcare-app-monthly',
        'BudgetLimit': {
            'Amount': '500.00',
            'Unit': 'USD'
        },
        'TimeUnit': 'MONTHLY',
        'BudgetType': 'COST',
        'CostFilters': {
            'TagKey': ['Project'],
            'TagValue': ['healthcare-app']
        }
    }
    
    notification = {
        'Notification': {
            'NotificationType': 'ACTUAL',
            'ComparisonOperator': 'GREATER_THAN',
            'Threshold': 80.0,
            'NotificationState': 'ALARM'
        },
        'Subscribers': [
            {
                'SubscriptionType': 'EMAIL',
                'Address': 'alerts@yourdomain.com'
            }
        ]
    }
    
    client.create_budget(
        AccountId='123456789012',
        Budget=budget,
        NotificationsWithSubscribers=[notification]
    )
```

## Troubleshooting

### Common Deployment Issues

#### Docker Issues

**Issue**: Container fails to start
```bash
# Check container logs
docker logs healthcare_backend_1 --tail 50

# Check container health
docker inspect healthcare_backend_1 | jq '.[].State.Health'

# Debug container interactively
docker run -it --entrypoint /bin/bash healthcare-backend:latest

# Check resource usage
docker stats healthcare_backend_1
```

**Issue**: Out of memory errors
```bash
# Check memory limits
docker inspect healthcare_backend_1 | jq '.[].HostConfig.Memory'

# Monitor memory usage
docker exec healthcare_backend_1 cat /proc/meminfo

# Adjust memory limits
docker update --memory=1g healthcare_backend_1
```

#### Network Connectivity Issues

**Issue**: Services cannot communicate
```bash
# Check Docker network
docker network ls
docker network inspect healthcare_default

# Test connectivity between containers
docker exec healthcare_frontend_1 ping backend
docker exec healthcare_backend_1 ping redis

# Check port bindings
docker port healthcare_backend_1
netstat -tulpn | grep :3003
```

**Issue**: External API connectivity problems
```bash
# Test WHO API connectivity from container
docker exec healthcare_backend_1 curl -v https://id.who.int/icd/api

# Check DNS resolution
docker exec healthcare_backend_1 nslookup id.who.int

# Test with different DNS servers
docker exec healthcare_backend_1 nslookup id.who.int 8.8.8.8
```

#### Database Connection Issues

**Issue**: Redis connection failures
```bash
# Check Redis health
docker exec healthcare_redis_1 redis-cli ping

# Monitor Redis connections
docker exec healthcare_redis_1 redis-cli info clients

# Check Redis logs
docker logs healthcare_redis_1

# Test Redis connectivity from backend
docker exec healthcare_backend_1 redis-cli -h redis ping
```

**Issue**: Redis memory issues
```bash
# Check Redis memory usage
docker exec healthcare_redis_1 redis-cli info memory

# Check Redis configuration
docker exec healthcare_redis_1 redis-cli config get maxmemory

# Clear Redis cache if needed
docker exec healthcare_redis_1 redis-cli flushall
```

### Application-Specific Issues

#### WHO API Integration Problems

**Issue**: Authentication failures
```bash
# Test WHO API credentials
curl -X POST "https://icdaccessmanagement.who.int/connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=$ICD11_CLIENT_ID&client_secret=$ICD11_CLIENT_SECRET&scope=icdapi_access&grant_type=client_credentials"

# Check if credentials are properly set in container
docker exec healthcare_backend_1 printenv | grep ICD11

# Verify API access
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://id.who.int/icd/entity/455013390"
```

**Issue**: Rate limiting
```bash
# Monitor API request rate
docker exec healthcare_backend_1 grep "WHO API" /app/logs/combined.log | tail -20

# Check rate limit headers
curl -v -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://id.who.int/icd/entity/455013390" 2>&1 | grep -i "x-rate"

# Implement exponential backoff
# See backend implementation for retry logic
```

#### Performance Issues

**Issue**: Slow response times
```bash
# Check application metrics
curl http://localhost:3003/metrics

# Monitor container resources
docker stats --no-stream

# Check database query performance
docker exec healthcare_redis_1 redis-cli --latency-history

# Profile Node.js application
docker exec healthcare_backend_1 npm run profile
```

**Issue**: Memory leaks
```bash
# Monitor memory usage over time
while true; do
  docker exec healthcare_backend_1 ps aux | grep node
  sleep 60
done

# Take heap dumps for analysis
docker exec healthcare_backend_1 kill -USR2 $(pgrep node)

# Check for memory leaks in logs
docker logs healthcare_backend_1 | grep -i "memory\|heap"
```

### Cloud Platform Issues

#### AWS ECS Issues

**Issue**: Task fails to start
```bash
# Check ECS service events
aws ecs describe-services \
  --cluster healthcare-app-cluster \
  --services healthcare-app-service

# Check task definition
aws ecs describe-task-definition \
  --task-definition healthcare-app-task

# View task logs
aws logs get-log-events \
  --log-group-name /ecs/healthcare-app \
  --log-stream-name ecs/frontend/$(aws ecs list-tasks --cluster healthcare-app-cluster --query 'taskArns[0]' --output text | cut -d'/' -f3)
```

**Issue**: Load balancer health checks failing
```bash
# Check target group health
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:ACCOUNT:targetgroup/healthcare-frontend-tg/1234567890abcdef

# Test health check endpoint
curl -f http://$(aws elbv2 describe-load-balancers --names healthcare-app-alb --query 'LoadBalancers[0].DNSName' --output text)/health
```

#### Azure Container Apps Issues

**Issue**: Container app won't start
```bash
# Check container app status
az containerapp show \
  --name healthcare-frontend \
  --resource-group healthcare-app-rg

# View logs
az containerapp logs show \
  --name healthcare-frontend \
  --resource-group healthcare-app-rg

# Check revisions
az containerapp revision list \
  --name healthcare-frontend \
  --resource-group healthcare-app-rg
```

#### GCP Cloud Run Issues

**Issue**: Service deployment fails
```bash
# Check service status
gcloud run services describe healthcare-frontend \
  --platform managed \
  --region us-central1

# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=healthcare-frontend" \
  --limit 50 \
  --format="table(timestamp,severity,textPayload)"

# Check IAM permissions
gcloud projects get-iam-policy PROJECT_ID
```

### Monitoring and Debugging Tools

#### Health Check Scripts
```bash
#!/bin/bash
# health-check.sh

echo "=== Healthcare App Health Check ==="
echo "Timestamp: $(date)"
echo

# Check frontend
echo "Frontend Health:"
if curl -sf http://localhost:3000/api/health > /dev/null; then
  echo "✅ Frontend is healthy"
else
  echo "❌ Frontend is unhealthy"
fi

# Check backend
echo "Backend Health:"
if curl -sf http://localhost:3003/api/health > /dev/null; then
  echo "✅ Backend is healthy"
else
  echo "❌ Backend is unhealthy"
fi

# Check Redis
echo "Redis Health:"
if docker exec healthcare_redis_1 redis-cli ping > /dev/null 2>&1; then
  echo "✅ Redis is healthy"
else
  echo "❌ Redis is unhealthy"
fi

# Check WHO API connectivity
echo "WHO API Connectivity:"
if curl -sf --max-time 10 https://id.who.int/icd/api > /dev/null 2>&1; then
  echo "✅ WHO API is accessible"
else
  echo "❌ WHO API is not accessible"
fi

echo
echo "=== Resource Usage ==="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

#### Log Analysis Script
```bash
#!/bin/bash
# analyze-logs.sh

LOG_DIR="/var/log/healthcare-app"
DATE=${1:-$(date +%Y-%m-%d)}

echo "Analyzing logs for $DATE"

# Error count
echo "=== Error Summary ==="
grep -h "$DATE" $LOG_DIR/*.log | grep -i error | wc -l
echo "Total errors found"

# Top error messages
echo "=== Top Error Messages ==="
grep -h "$DATE" $LOG_DIR/*.log | grep -i error | \
  sed 's/.*"message":"\([^"]*\)".*/\1/' | \
  sort | uniq -c | sort -nr | head -10

# WHO API errors
echo "=== WHO API Errors ==="
grep -h "$DATE" $LOG_DIR/*.log | grep -i "who.*error" | wc -l
echo "WHO API errors found"

# Performance metrics
echo "=== Response Time Analysis ==="
grep -h "$DATE" $LOG_DIR/*.log | grep "responseTime" | \
  sed 's/.*"responseTime":\([0-9]*\).*/\1/' | \
  awk '{sum+=$1; count++} END {print "Average response time: " sum/count "ms"}'
```

This comprehensive deployment guide provides healthcare organizations with everything needed to successfully deploy and maintain ICD-11 healthcare applications across various cloud platforms while ensuring security, performance, and compliance with healthcare regulations.