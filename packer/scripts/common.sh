#!/bin/bash
# =============================================================================
# Common provisioning script used by both backend and frontend Packer builds
# =============================================================================
# Installs system dependencies, Node.js 22, PM2, and CloudWatch Agent.
# This script targets Ubuntu 24.04 LTS (Noble).
# =============================================================================
set -euxo pipefail

export DEBIAN_FRONTEND=noninteractive

echo "=== [1/5] Updating system packages ==="
apt-get update -qq
apt-get upgrade -y -qq
apt-get autoremove -y -qq
apt-get autoclean -qq

echo "=== [2/5] Installing system dependencies ==="
apt-get install -y -qq \
    gnupg \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    jq \
    unzip \
    ca-certificates

echo "=== [3/5] Installing CloudWatch Agent ==="
wget -q https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i -E ./amazon-cloudwatch-agent.deb
mkdir -p /opt/aws/amazon-cloudwatch-agent/bin
rm -f ./amazon-cloudwatch-agent.deb

echo "=== [4/5] Installing Node.js 22 LTS ==="
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y -qq nodejs

# Verify installations
echo "  Node.js: $(node --version)"
echo "  npm:     $(npm --version)"

echo "=== [5/5] Installing PM2 globally ==="
npm install -g pm2

# Clean up package cache
apt-get clean -qq
rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/*
