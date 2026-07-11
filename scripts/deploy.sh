#!/usr/bin/env bash
# =============================================================================
# Interview Arena AI - Deploy to AWS (AMI-based EC2)
# =============================================================================
# Usage: ./scripts/deploy.sh [environment]
#   environment: dev | prod (default: dev)
#
# Steps:
#   1. Builds new AMIs with Packer
#   2. Runs terraform init + plan + apply (updates launch templates with new AMIs)
#   3. Triggers ASG instance refresh for zero-downtime rollout
#   4. Runs health checks
# =============================================================================
# This replaces the old ECS/Docker-based deploy.sh with AMI-based EC2 deployment.
# =============================================================================

set -euo pipefail

ENVIRONMENT="${1:-dev}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TF_DIR="${PROJECT_DIR}/terraform"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Error handler
cleanup() {
  local exit_code=$?
  if [ $exit_code -ne 0 ]; then
    echo -e "\n${RED}✗ Deployment failed with exit code $exit_code${NC}"
  fi
}
trap cleanup EXIT

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Interview Arena - Deploy to AWS${NC}"
echo -e "${CYAN}  Environment: ${ENVIRONMENT}${NC}"
echo -e "${CYAN}========================================${NC}"

# ─── Validate environment ────────────────────────────────────
if [ ! -f "${TF_DIR}/env/${ENVIRONMENT}.tfvars" ]; then
  echo -e "${RED}  ✗ Environment file not found: env/${ENVIRONMENT}.tfvars${NC}"
  exit 1
fi

# ─── Step 1: Build AMIs with Packer ──────────────────────────
echo -e "\n${YELLOW}➜ Step 1/5: Building AMIs with Packer...${NC}"
bash "${SCRIPT_DIR}/build-ami.sh" "$ENVIRONMENT"
echo -e "${GREEN}  ✓ AMIs built${NC}"

# ─── Step 2: Terraform Init + Apply ──────────────────────────
echo -e "\n${YELLOW}➜ Step 2/5: Running Terraform...${NC}"

cd "$TF_DIR"

terraform init -upgrade
echo -e "${GREEN}  ✓ Terraform initialized${NC}"

terraform validate
echo -e "${GREEN}  ✓ Terraform validated${NC}"

echo -e "\n${YELLOW}➜ Terraform Plan:${NC}"
terraform plan -var-file="env/${ENVIRONMENT}.tfvars" -out=tfplan

echo ""
read -p "❓ Apply this plan? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  terraform apply tfplan
  echo -e "${GREEN}  ✓ Terraform applied${NC}"
else
  echo -e "${YELLOW}  Skipping terraform apply${NC}"
fi

cd "$PROJECT_DIR"

# ─── Step 3: Get ASG names ───────────────────────────────────
echo -e "\n${YELLOW}➜ Step 3/5: Getting ASG info...${NC}"

AWS_REGION="${AWS_REGION:-us-east-1}"

BACKEND_ASG="interview-arena-${ENVIRONMENT}-backend-asg"
FRONTEND_ASG="interview-arena-${ENVIRONMENT}-frontend-asg"

# Verify ASGs exist
if aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names "$BACKEND_ASG" \
  --region "$AWS_REGION" \
  --query 'AutoScalingGroups[0]' \
  --output text &>/dev/null; then
  echo -e "${GREEN}  ✓ Backend ASG found: ${BACKEND_ASG}${NC}"
else
  echo -e "${YELLOW}  ⚠ Backend ASG not found (may need first deploy). Skipping refresh.${NC}"
  BACKEND_ASG=""
fi

if aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names "$FRONTEND_ASG" \
  --region "$AWS_REGION" \
  --query 'AutoScalingGroups[0]' \
  --output text &>/dev/null; then
  echo -e "${GREEN}  ✓ Frontend ASG found: ${FRONTEND_ASG}${NC}"
else
  echo -e "${YELLOW}  ⚠ Frontend ASG not found (may need first deploy). Skipping refresh.${NC}"
  FRONTEND_ASG=""
fi

# ─── Step 4: Trigger ASG Instance Refresh ────────────────────
echo -e "\n${YELLOW}➜ Step 4/5: Triggering ASG instance refresh (rolling update)...${NC}"

if [ -n "$BACKEND_ASG" ]; then
  echo -e "  Refreshing backend ASG: ${BACKEND_ASG}"
  aws autoscaling start-instance-refresh \
    --auto-scaling-group-name "$BACKEND_ASG" \
    --strategy Rolling \
    --preferences '{"MinHealthyPercentage": 50, "InstanceWarmup": 120}' \
    --region "$AWS_REGION" \
    --output text
  echo -e "${GREEN}  ✓ Backend instance refresh started${NC}"
fi

if [ -n "$FRONTEND_ASG" ]; then
  echo -e "  Refreshing frontend ASG: ${FRONTEND_ASG}"
  aws autoscaling start-instance-refresh \
    --auto-scaling-group-name "$FRONTEND_ASG" \
    --strategy Rolling \
    --preferences '{"MinHealthyPercentage": 50, "InstanceWarmup": 120}' \
    --region "$AWS_REGION" \
    --output text
  echo -e "${GREEN}  ✓ Frontend instance refresh started${NC}"
fi

# ─── Step 5: Health Check ────────────────────────────────────
echo -e "\n${YELLOW}➜ Step 5/5: Running health check...${NC}"

ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names "interview-arena-${ENVIRONMENT}-alb" \
  --query 'LoadBalancers[0].DNSName' \
  --region "$AWS_REGION" \
  --output text 2>/dev/null || echo "")

if [ -n "$ALB_DNS" ]; then
  echo -e "  Waiting 30s for instances to register with ALB..."
  sleep 30

  echo -e "  Checking backend health at: http://${ALB_DNS}/api/health"
  if curl -sf --max-time 30 "http://${ALB_DNS}/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Backend is healthy!${NC}"
    echo -e "${GREEN}  ➤ Access the app at: http://${ALB_DNS}${NC}"
  else
    echo -e "${RED}  ✗ Backend health check failed. Check ASG instances.${NC}"
    echo -e "${YELLOW}  ➤ aws ec2 describe-instances --filters \"Name=tag:Name,Values=interview-arena-${ENVIRONMENT}-backend\"${NC}"
    echo -e "${YELLOW}  ➤ Check CloudWatch logs: /ec2/interview-arena-${ENVIRONMENT}-backend-sg${NC}"
  fi
else
  echo -e "${YELLOW}  ALB not found. Health check skipped.${NC}"
fi

# ─── Done ────────────────────────────────────────────────────
echo -e "\n${CYAN}========================================${NC}"
echo -e "${GREEN}  Deployment complete!${NC}"
echo -e "${CYAN}========================================${NC}"
