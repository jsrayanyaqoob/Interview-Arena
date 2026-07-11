# Interview Arena AI - Deployment Guide

## Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- [Terraform](https://www.terraform.io/downloads) v1.6+
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
1. Build AMIs with Packer (see below for manual AMI build instructions)
2. Run `terraform init && terraform apply`
3. Trigger ASG instance refresh (rolling update)
4. Run health checks

### 3. Access the application

After deployment, the script outputs the ALB DNS URL.
- **Frontend**: `http://<alb-dns>`
- **Backend API**: `http://<alb-dns>/api/health`

---

## Packer — Build Custom AMIs

Packer builds pre-baked AMIs so EC2 instances boot instantly without running install scripts.

### Files

| File | Purpose |
|------|---------|
| `packer/backend.pkr.hcl` | Backend AMI (Express.js + Node.js 22 + PM2 + CloudWatch Agent) |
| `packer/frontend.pkr.hcl` | Frontend AMI (Next.js standalone + Node.js 22 + PM2) |
| `packer/scripts/common.sh` | Shared provisioning script (system deps, Node.js, PM2) |
| `packer/scripts/cloudwatch.json` | CloudWatch Agent config template (metrics + logs) |
| `packer/scripts/configure-cloudwatch.sh` | First-boot CloudWatch config script |

### Build AMIs

```bash
# Build both backend and frontend AMIs for dev
bash scripts/build-ami.sh dev

# Build for production
bash scripts/build-ami.sh prod

# Validate templates without building
packer validate -var 'environment=dev' packer/backend.pkr.hcl
packer validate -var 'environment=dev' packer/frontend.pkr.hcl
```

### Use Custom AMIs in Terraform

The EC2 module accepts `backend_ami_id` and `frontend_ami_id` variables. When provided,
the launch template uses the Packer-built AMI; otherwise it falls back to the latest
Ubuntu 24.04 official AMI with user_data for first-boot setup.

```bash
# Option 1: Pass AMI IDs directly to terraform
cd terraform
terraform apply \
  -var="backend_ami_id=ami-xxxxxxxxxxxxxxxxx" \
  -var="frontend_ami_id=ami-yyyyyyyyyyyyyyyyy" \
  -var-file="env/dev.tfvars"

# Option 2: Set them in your .tfvars file
# backend_ami_id  = "ami-xxx"
# frontend_ami_id = "ami-yyy"
```

### AMI Lifecycle

Each build produces a uniquely-named AMI (`{project}-{env}-{service}-{timestamp}`). Old
AMIs are not automatically deregistered. To clean up old AMIs:

```bash
# List AMIs owned by this project
aws ec2 describe-images --owners self \
  --filters "Name=tag:Project,Values=interview-arena" \
  --query 'Images[*].[ImageId,Name,CreationDate]' --output table

# Deregister an old AMI and delete its snapshots
aws ec2 deregister-image --image-id ami-xxx
aws ec2 delete-snapshot --snapshot-id snap-xxx
```

---

## Deployment Options

### Option A: Full automated deploy (recommended)

```bash
bash scripts/deploy.sh dev        # Dev environment
bash scripts/deploy.sh prod       # Production environment
```

### Option B: Step-by-step

```bash
# 1. Build AMIs only
bash scripts/build-ami.sh dev

# 2. Run Terraform separately
cd terraform
terraform init
terraform plan -var-file="env/dev.tfvars"
terraform apply -var-file="env/dev.tfvars"
```

### Option C: CI/CD Pipeline (GitHub Actions)

Push to `main` branch triggers automatic deployment via the workflow in `.github/workflows/deploy.yml` or `.github/workflows/deploy-ssh.yml`.

The SSH-based workflow (`deploy-ssh.yml`) does NOT use Packer — it deploys code directly
via SSH. The AMI workflow (future) would integrate Packer builds into CI/CD.

---

## Environment Configs

| File | Purpose |
|------|---------|
| `terraform/env/dev.tfvars` | Development environment variables |
| `terraform/env/prod.tfvars` | Production environment variables |
| `terraform/terraform.tfvars.example` | Template for all variables |

---

## Architecture

```
User → ALB (HTTP:80) → EC2 Instance (Node.js + PM2)
                           ├── Backend: Express.js (port 5000)
                           ├── Frontend: Next.js SSR (port 3000)
                           ├── RDS PostgreSQL
                           ├── DynamoDB (sessions + cache)
                           ├── S3 (uploads + logs)
                           └── CloudWatch (metrics + logs + alarms)
```

The AMIs are pre-built with Packer, so EC2 instances boot in seconds without
runtime package installation.

---

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

---

## Troubleshooting

### Packer build fails

```bash
# Check if you have the correct AWS credentials
aws sts get-caller-identity

# Check Packer version (must be >= 1.9.0)
packer --version

# Validate template syntax
packer validate -var 'environment=dev' packer/backend.pkr.hcl
```

### Terraform state locked

```bash
terraform force-unlock <lock-id>
```

### AMI not found

```bash
# List your custom AMIs
aws ec2 describe-images --owners self \
  --filters "Name=tag:Project,Values=interview-arena" \
  --query 'Images[*].[ImageId,Name,State,CreationDate]' --output table
```
