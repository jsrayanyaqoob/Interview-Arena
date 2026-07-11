# Interview Arena AI - Deployment Guide

## Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- [Terraform](https://www.terraform.io/downloads) v1.6+
- [Docker](https://docs.docker.com/get-docker/)
- [Node.js](https://nodejs.org/) v22+
- [jq](https://stedolan.github.io/jq/)

## Quick Start

### 1. Clone and configure

```bash
git clone <repo-url> interview-arena
cd interview-arena
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
# Edit terraform.tfvars with your values (JWT secrets, Gemini API key, DB password)
```

### 2. Deploy infrastructure

```bash
# Deploy to dev environment
bash scripts/deploy.sh dev
```

This will:
1. Run `terraform init && terraform plan` (prompts for confirmation)
2. Build and push Docker images to ECR
3. Force ECS deployment
4. Run health checks

### 3. Access the application

After deployment, the script outputs the ALB DNS URL.
- **Frontend**: `http://<alb-dns>`
- **Backend API**: `http://<alb-dns>/api/health`

## Deployment Options

### Option A: Full automated deploy (recommended)
```bash
bash scripts/deploy.sh dev        # Dev environment
bash scripts/deploy.sh prod       # Production environment
```

### Option B: Step-by-step

```bash
# 1. Build and push Docker images only
bash scripts/build-and-push.sh dev

# 2. Run Terraform separately
cd terraform
terraform init
terraform plan -var-file="env/dev.tfvars"
terraform apply -var-file="env/dev.tfvars"

# 3. Force ECS deployment
aws ecs update-service --cluster interview-arena-dev-cluster \
  --service interview-arena-dev-backend-service --force-new-deployment

aws ecs update-service --cluster interview-arena-dev-cluster \
  --service interview-arena-dev-frontend-service --force-new-deployment
```

### Option C: CI/CD Pipeline (GitHub Actions)

Push to `main` branch triggers automatic deployment via the workflow in `.github/workflows/deploy.yml`.

**Required GitHub Secrets:**
| Secret | Description |
|--------|-------------|
| `AWS_ROLE_ARN` | IAM role ARN for GitHub Actions OIDC |
| `JWT_SECRET` | JWT signing secret |
| `JWT_REFRESH_SECRET` | JWT refresh token secret |
| `GEMINI_API_KEY` | Google Gemini API key |
| `DATABASE_PASSWORD` | PostgreSQL master password |

## Environment Configs

| File | Purpose |
|------|---------|
| `terraform/env/dev.tfvars` | Development environment variables |
| `terraform/env/prod.tfvars` | Production environment variables |
| `terraform/terraform.tfvars.example` | Template for all variables |

## Architecture

```
User → CloudFront → S3 (static files)
                 → ALB → ECS Fargate (Next.js SSR)
                        → ECS Fargate (Express.js API) → RDS PostgreSQL
                                                        → DynamoDB
                                                        → S3 Uploads
                                                        → Gemini AI API
```

## Docker Images

```bash
# Build backend
docker build -f terraform/Dockerfiles/backend.Dockerfile -t backend:latest backend/

# Build frontend  
docker build -f terraform/Dockerfiles/frontend.Dockerfile -t frontend:latest frontend/
```

## Local Development

```bash
# Backend
cd backend
cp .env.example .env  # Configure your .env
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend (separate terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

## Troubleshooting

### Health check fails
Check ECS task logs in CloudWatch:
```bash
aws logs tail /ecs/interview-arena-dev-backend --follow
```

### Terraform state locked
```bash
# If using S3 backend, force unlock
terraform force-unlock <lock-id>
```

### ECS task not starting
```bash
# Check ECS task status
aws ecs describe-tasks --cluster interview-arena-dev-cluster \
  --tasks <task-id>
```
