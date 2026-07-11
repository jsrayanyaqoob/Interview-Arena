#!/bin/bash
# =============================================================================
# EC2 User Data - Server Preparation
# =============================================================================
# This script runs on first EC2 instance launch.
# It prepares the server for deploying a Next.js application by:
#   - Updating all system packages
#   - Installing Node.js (LTS)
#   - Installing PM2 process manager globally
#   - Installing Git for application deployment
#   - Creating the application directory structure
#
# NOTE: The application itself is NOT deployed here.
# Deployment is handled separately via CI/CD pipeline.
# =============================================================================
set -euo pipefail

exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "================================================"
echo "  Server Preparation - $(date)"
echo "================================================"

# ─── Update System Packages ──────────────────────────
echo "[1/6] Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get autoremove -y -qq
apt-get autoclean -qq

# ─── Install System Dependencies ─────────────────────
echo "[2/6] Installing system dependencies..."
apt-get install -y -qq \
    gnupg \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    jq \
    unzip

# ─── Install CloudWatch Agent ────────────────────────
echo "[3/6] Installing CloudWatch Agent..."
wget -q https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i -E ./amazon-cloudwatch-agent.deb
echo '{
  "metrics": {
    "metrics_collected": {
      "cpu": {"measurement": ["cpu_usage_idle", "cpu_usage_iowait", "cpu_usage_user", "cpu_usage_system"]},
      "mem": {"measurement": ["mem_used_percent"]},
      "disk": {"measurement": ["disk_used_percent"], "resources": ["*"]},
      "diskio": {"measurement": ["disk_io_time_percent"]},
      "net": {"measurement": ["net_bytes_sent", "net_bytes_recv"]},
      "swap": {"measurement": ["swap_used_percent"]},
      "logfile": {"logs_collected": {"files": {"collect_list": [{"file_path": "/var/log/syslog","log_group_name": "${var.project_name}-${var.environment}-syslog","log_stream_name": "{instance_id}"}]}}}
  }
}' > /opt/aws/amazon-cloudwatch-agent/bin/config.json
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json
rm -f ./amazon-cloudwatch-agent.deb
echo "  CloudWatch Agent installed and configured"

# ─── Install Node.js 22 LTS ──────────────────────────
echo "[4/6] Installing Node.js 22 LTS..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y -qq nodejs
echo "  Node.js version: $(node --version)"
echo "  npm version: $(npm --version)"

# ─── Install PM2 Globally ────────────────────────────
echo "[5/6] Installing PM2 process manager..."
npm install -g pm2
pm2 --version

# Configure PM2 to start on boot
pm2 startup systemd -u ubuntu --hp /home/ubuntu || true

# ─── Prepare Application Directory ───────────────────
echo "[6/6] Preparing application directory..."
mkdir -p /app
chown ubuntu:ubuntu /app
chmod 755 /app

echo ""
echo "================================================"
echo "  Server preparation complete!"
echo "  Ready for Next.js application deployment."
echo "================================================"
