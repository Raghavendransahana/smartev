# SmartEV Deployment Guide

## Overview

This guide covers deployment strategies for the SmartEV platform across different environments, from development to production scale deployments.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   CDN / Proxy   │    │   Monitoring    │
│   (NGINX/ALB)   │    │  (CloudFlare)   │    │ (Grafana/New)   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
┌─────────▼───────────────────────▼──────────────────────▼───────┐
│                    Kubernetes Cluster                          │
├─────────────────┬─────────────────┬─────────────────┬───────────┤
│   Frontend Web  │   Backend API   │   ML Engine     │   Chat    │
│   (React/Vite)  │ (Node.js/TS)    │   (Python)      │ (Node.js) │
├─────────────────┼─────────────────┼─────────────────┼───────────┤
│   Mobile App    │   Telemetry     │   Blockchain    │   Redis   │
│ (Expo/RN Build) │   (Node.js)     │   (Hardhat)     │  (Cache)  │
└─────────────────┴─────────────────┴─────────────────┴───────────┘
          │                      │                      │
┌─────────▼───────┐    ┌─────────▼───────┐    ┌─────────▼───────┐
│   MongoDB       │    │   File Storage  │    │   Logs/Metrics  │
│   (Atlas/Self)  │    │  (S3/MinIO)     │    │ (ELK/Loki)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Development Environment

### Local Development Setup

**Prerequisites:**
- Node.js 18+
- Python 3.8+
- Docker & Docker Compose
- MongoDB (local or Atlas)

**Quick Start:**
```bash
# Clone repository
git clone <repository_url>
cd smartev

# Setup environment
cp .env.example .env
# Configure your environment variables

# Start services with Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Or start services individually:
# Backend API
cd backend/api && npm install && npm run dev

# Frontend Web
cd frontend/web && npm install && npm run dev

# Mobile App
cd frontend/app && npm install && npm run start

# ML Engine
cd "model & ai/ml" && pip install -r requirements.txt && python battery_api_server.py

# Chat Service
cd chat && npm install && npm start
```

**Development Docker Compose:**
```yaml
version: '3.8'
services:
  api:
    build:
      context: ./backend/api
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend/api:/app
      - /app/node_modules
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
     
    depends_on:
      - mongo

  web:
    build:
      context: ./frontend/web
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend/web:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:4000/api

  ml-engine:
    build:
      context: ./model & ai/ml
      dockerfile: Dockerfile.dev
    volumes:
      - ./model & ai/ml:/app
    ports:
      - "5000:5000"

  chat:
    build:
      context: ./chat
      dockerfile: Dockerfile.dev
    volumes:
      - ./chat:/app
      - /app/node_modules
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_dev_data:/data/db

volumes:
  mongo_dev_data:
```

## Staging Environment

### AWS Staging Deployment

**Infrastructure Setup:**
```bash
# Install AWS CLI and Terraform
aws configure
terraform init
terraform plan -var-file="staging.tfvars"
terraform apply
```

**Terraform Configuration (`infrastructure/staging/main.tf`):**
```hcl
provider "aws" {
  region = var.aws_region
}

# ECS Cluster
resource "aws_ecs_cluster" "smartev_staging" {
  name = "smartev-staging"
  
  capacity_providers = ["FARGATE"]
  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight           = 1
  }
}

# Application Load Balancer
resource "aws_lb" "smartev_staging_alb" {
  name               = "smartev-staging-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
}

# RDS MongoDB Alternative (DocumentDB)
resource "aws_docdb_cluster" "smartev_staging" {
  cluster_identifier      = "smartev-staging"
  engine                 = "docdb"
  master_username        = var.db_username
  master_password        = var.db_password
  backup_retention_period = 7
  preferred_backup_window = "07:00-09:00"
  skip_final_snapshot    = true
  
  vpc_security_group_ids = [aws_security_group.docdb.id]
  db_subnet_group_name   = aws_docdb_subnet_group.smartev.name
}
```

**ECS Task Definitions:**
```json
{
  "family": "smartev-api-staging",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "smartev-api",
      "image": "your-account.dkr.ecr.region.amazonaws.com/smartev-api:staging",
      "portMappings": [
        {
          "containerPort": 4000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "staging"
        }
      ],
      "secrets": [
        {
          "name": "MONGODB_URI",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:smartev-staging-mongodb-uri"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/smartev-api-staging",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## Production Environment

### Cloud Provider Options

#### Option 1: AWS Production
```bash
# Production infrastructure
cd infrastructure/production
terraform init
terraform plan -var-file="production.tfvars"
terraform apply
```

**Production Features:**
- Auto Scaling Groups with ECS
- RDS Multi-AZ for high availability
- CloudFront CDN for frontend
- ElastiCache Redis for caching
- AWS Secrets Manager for secure config
- CloudWatch for monitoring and logging

#### Option 2: Google Cloud Platform
```yaml
# GKE Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: smartev-api
  namespace: smartev-prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: smartev-api
  template:
    metadata:
      labels:
        app: smartev-api
    spec:
      containers:
      - name: smartev-api
        image: gcr.io/PROJECT_ID/smartev-api:latest
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: smartev-secrets
              key: mongodb-uri
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

#### Option 3: Self-Hosted Kubernetes
```yaml
# Helm Chart values.yaml
api:
  image:
    repository: smartev/api
    tag: "1.0.0"
  replicas: 3
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
    limits:
      memory: "1Gi"
      cpu: "1000m"

web:
  image:
    repository: smartev/web
    tag: "1.0.0"
  replicas: 2

mlEngine:
  image:
    repository: smartev/ml-engine
    tag: "1.0.0"
  replicas: 2
  resources:
    requests:
      memory: "1Gi"
      cpu: "1000m"
    limits:
      memory: "2Gi"
      cpu: "2000m"

mongodb:
  enabled: true
  auth:
    enabled: true
  replicaSet:
    enabled: true
    replicas:
      secondary: 2
```

### CI/CD Pipeline

**GitHub Actions Workflow (`.github/workflows/deploy.yml`):**
```yaml
name: Deploy SmartEV

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: smartev

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongo:
        image: mongo:6
        ports:
          - 27017:27017
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: backend/api/package-lock.json
    
    - name: Install dependencies
      run: cd backend/api && npm ci
    
    - name: Run tests
      run: cd backend/api && npm test
      env:
        MONGODB_URI: mongodb://localhost:27017/test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    strategy:
      matrix:
        service: [api, web, ml-engine, chat]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ github.repository }}-${{ matrix.service }}
        tags: |
          type=ref,event=branch
          type=sha,prefix={{branch}}-
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: ./${{ matrix.service }}
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: staging
    
    steps:
    - name: Deploy to Staging
      run: |
        # Update ECS services or Kubernetes deployments
        aws ecs update-service \
          --cluster smartev-staging \
          --service smartev-api-staging \
          --force-new-deployment

  deploy-production:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Deploy to Production
      run: |
        # Blue-Green deployment or rolling update
        kubectl set image deployment/smartev-api \
          smartev-api=${{ env.REGISTRY }}/${{ github.repository }}-api:${{ github.sha }}
```

### Security Configuration

**Security Checklist:**
- [ ] SSL/TLS certificates configured
- [ ] Environment variables secured with secrets management
- [ ] Network security groups configured
- [ ] Database encryption at rest enabled
- [ ] Application security headers configured
- [ ] Rate limiting implemented
- [ ] Input validation and sanitization
- [ ] Dependency vulnerability scanning
- [ ] Container security scanning
- [ ] Backup and recovery procedures

**Environment Security:**
```bash
# AWS Secrets Manager
aws secretsmanager create-secret \
  --name "smartev/prod/mongodb-uri" \
  --description "MongoDB connection string for SmartEV production" \
  --secret-string "mongodb://username:password@cluster.mongodb.net/smartev"

# Kubernetes Secrets
kubectl create secret generic smartev-secrets \
  --from-literal=mongodb-uri="mongodb://..." \
  --from-literal=jwt-secret="..." \
  --from-literal=groq-api-key="..."
```

### Monitoring and Logging

**Monitoring Stack:**
```yaml
# Prometheus configuration
global:
  scrape_interval: 15s

scrape_configs:
- job_name: 'smartev-api'
  static_configs:
  - targets: ['api:4000']
  metrics_path: /api/metrics

- job_name: 'smartev-ml'
  static_configs:
  - targets: ['ml-engine:5000']
  metrics_path: /metrics
```

**Grafana Dashboard:**
- API response times and error rates
- Database connection health
- ML model prediction latency
- Battery analytics processing times
- User engagement metrics
- Resource utilization (CPU, memory, storage)

**Logging Configuration:**
```yaml
# Fluentd/Fluent Bit for log aggregation
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluent-bit-config
data:
  fluent-bit.conf: |
    [SERVICE]
        Flush         1
        Log_Level     info
        Daemon        off

    [INPUT]
        Name              tail
        Path              /var/log/containers/*smartev*.log
        Parser            docker
        Tag               smartev.*
        Refresh_Interval  5

    [OUTPUT]
        Name  es
        Match smartev.*
        Host  elasticsearch
        Port  9200
        Index smartev-logs
```

### Backup and Recovery

**Database Backup:**
```bash
# MongoDB Atlas backup (automatic)
# Self-hosted MongoDB backup
mongodump --uri="mongodb://username:password@host:port/smartev" --out /backups/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="smartev"

# Create backup
mongodump --db $DB_NAME --out $BACKUP_DIR/$DATE

# Compress backup
tar -czf $BACKUP_DIR/smartev_backup_$DATE.tar.gz -C $BACKUP_DIR $DATE

# Upload to S3
aws s3 cp $BACKUP_DIR/smartev_backup_$DATE.tar.gz s3://smartev-backups/

# Clean up local files older than 7 days
find $BACKUP_DIR -name "smartev_backup_*.tar.gz" -mtime +7 -delete
```

### Performance Optimization

**Frontend Optimization:**
```javascript
// Code splitting
const ChargingStationsMap = lazy(() => import('./components/ChargingStationsMap'));
const BatteryAnalytics = lazy(() => import('./components/BatteryAnalytics'));

// Service Worker for offline functionality
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

**Backend Optimization:**
```javascript
// Database connection pooling
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

// Redis caching
const redis = new Redis(process.env.REDIS_URL);

// Cache middleware
const cacheMiddleware = (duration = 300) => async (req, res, next) => {
  const key = `cache:${req.originalUrl}`;
  const cached = await redis.get(key);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  res.sendResponse = res.json;
  res.json = (data) => {
    redis.setex(key, duration, JSON.stringify(data));
    res.sendResponse(data);
  };
  
  next();
};
```

### Scaling Strategies

**Horizontal Scaling:**
- Load balancers (NGINX, AWS ALB, GCP Load Balancer)
- Container orchestration (Kubernetes, ECS, Docker Swarm)
- Database sharding or read replicas
- CDN for static assets
- Microservices architecture

**Vertical Scaling:**
- Resource monitoring and auto-scaling
- Performance profiling and optimization
- Database query optimization
- Memory management and garbage collection tuning

### Disaster Recovery

**Recovery Plan:**
1. **Database Recovery**: Point-in-time restore from backups
2. **Application Recovery**: Rolling back to previous stable deployment
3. **Infrastructure Recovery**: Infrastructure as Code for quick rebuilding
4. **Data Recovery**: Multiple backup locations and retention policies

**RTO/RPO Targets:**
- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 1 hour
- **Backup Frequency**: Hourly incremental, daily full backup
- **Backup Retention**: 30 days local, 1 year remote

This deployment guide provides comprehensive coverage for deploying SmartEV across different environments with proper security, monitoring, and scaling considerations.
