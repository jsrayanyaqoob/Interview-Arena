#!/usr/bin/env bash
# =============================================================================
# Interview Arena AI - Build AMIs with Packer
# =============================================================================
# Usage: ./scripts/build-ami.sh [environment]
#   environment: dev | prod (default: dev)
#
# Prerequisites:
#   - AWS CLI configured with appropriate credentials
#   - Packer >= 1.9.0 installed
#   - jq installed
# =============================================================================
# This replaces the old build-and-push.sh (Docker + ECR) with
# Packer-based AMI building for EC2 deployment.
# =============================================================================

set -euo pipefail

ENVIRONMENT="${1:-dev}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")\" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Interview Arena - Build AMIs${NC}"
echo -e "${CYAN}  Environment: ${ENVIRONMENT}${NC}"
echo -e "${CYAN}========================================${NC}"

# ─── Check prerequisites ─────────────────────────────────────
if ! command -v packer &> /dev/null; then
  echo -e "${RED}  ✗ Packer is not installed!${NC}"
  echo -e "${RED}    Install from: https://developer.hashicorp.com/packer/install${NC}"
  echo -e "${RED}    Then run: sudo mv ~/downloads/packer /usr/local/bin/${NC}"
  exit 1
fi

PACKER_VERSION=$(packer --version)
echo -e "${GREEN}  Packer version: ${PACKER_VERSION}${NC}"

# ─── Validate Packer templates ───────────────────────────────
echo -e "\n${YELLOW}➜ Validating Packer templates...${NC}"

packer validate \
  -var "environment=${ENVIRONMENT}" \
  -var "aws_region=${AWS_REGION:-us-east-1}" \
  "${PROJECT_DIR}/packer/backend.pkr.hcl"

echo -e "${GREEN}  ✓ Backend template validated${NC}"

packer validate \
  -var "environment=${ENVIRONMENT}" \
  -var "aws_region=${AWS_REGION:-us-east-1}" \
  "${PROJECT_DIR}/packer/frontend.pkr.hcl"

echo -e "${GREEN}  ✓ Frontend template validated${NC}"

# ─── Build Backend AMI ────────────────────────────────────────
echo -e "\n${YELLOW}➜ Building backend AMI...${NC}"

packer build \
  -var "environment=${ENVIRONMENT}" \
  -var "aws_region=${AWS_REGION:-us-east-1}" \
  "${PROJECT_DIR}/packer/backend.pkr.hcl"

echo -e "${GREEN}  ✓ Backend AMI built${NC}"

# ─── Build Frontend AMI ───────────────────────────────────────
echo -e "\n${YELLOW}➜ Building frontend AMI...${NC}"

packer build \
  -var "environment=${ENVIRONMENT}" \
  -var "aws_region=${AWS_REGION:-us-east-1}" \
  "${PROJECT_DIR}/packer/frontend.pkr.hcl"

echo -e "${GREEN}  ✓ Frontend AMI built${NC}"

# ─── Done ─────────────────────────────────────────────────────
echo -e "\n${CYAN}========================================${NC}"
echo -e "${GREEN}  AMI build complete!${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo "  Next steps:"
echo "    1. Run 'terraform apply' to update launch templates with new AMIs"
echo "    2. Run 'aws autoscaling start-instance-refresh' to deploy"
echo ""
echo "  Or use the deploy script: ./scripts/deploy.sh ${ENVIRONMENT}"
echo ""
