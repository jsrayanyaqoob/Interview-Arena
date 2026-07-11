# =============================================================================
# Packer Template: Interview Arena Frontend AMI
# =============================================================================
# Builds an Ubuntu 24.04 LTS AMI with:
#   - Node.js 22 LTS
#   - PM2 process manager
#   - CloudWatch Agent (metrics + logs)
#   - Git, build tools, jq, curl
#   - Frontend application code (Next.js standalone build)
#   - Static assets copied into standalone output
#   - systemd service for auto-start
# =============================================================================

packer {
  required_plugins {
    amazon = {
      version = ">= 1.3.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

# ---------------------------------------------------------------------------
# Variables
# ---------------------------------------------------------------------------
variable "environment" {
  type        = string
  default     = "dev"
  description = "Deployment environment (dev, staging, prod)"
}

variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region to build the AMI in"
}

variable "project_name" {
  type        = string
  default     = "interview-arena"
  description = "Project name for AMI naming and tagging"
}

variable "instance_type" {
  type        = string
  default     = "t3.small"
  description = "EC2 instance type used for building the AMI"
}

variable "volume_size" {
  type        = number
  default     = 20
  description = "Root volume size in GB"
}

# ---------------------------------------------------------------------------
# Locals
# ---------------------------------------------------------------------------
locals {
  timestamp = formatdate("YYYYMMDDHHmmss", timestamp())
  ami_name  = "${var.project_name}-${var.environment}-frontend-${local.timestamp}"
}

# ---------------------------------------------------------------------------
# Source: amazon-ebs
# ---------------------------------------------------------------------------
source "amazon-ebs" "frontend" {
  region        = var.aws_region
  ami_name      = local.ami_name
  instance_type = var.instance_type

  # Ubuntu 24.04 LTS (Noble) — matches Terraform's aws_ami.ubuntu filter
  source_ami_filter {
    filters = {
      name                = "ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["099720109477"]  # Canonical
  }

  ssh_username = "ubuntu"

  # AMI tags
  tags = {
    Name        = local.ami_name
    Environment = var.environment
    Project     = var.project_name
    Service     = "frontend"
    ManagedBy   = "Packer"
  }

  run_tags = {
    Name        = "packer-builder-${var.project_name}-${var.environment}-frontend"
    Environment = var.environment
    Project     = var.project_name
    Service     = "frontend"
  }

  # Root volume
  launch_block_device_mappings {
    device_name           = "/dev/sda1"
    delete_on_termination = true
    volume_size           = var.volume_size
    volume_type           = "gp3"
    encrypted             = true
  }
}

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
build {
  name    = "interview-arena-frontend"
  sources = ["source.amazon-ebs.frontend"]

  # ─── Step 1: Common system provisioning ──────────────────────
  provisioner "shell" {
    script = "${path.root}/scripts/common.sh"
  }

  # ─── Step 2: Copy CloudWatch Agent config template ───────────
  provisioner "file" {
    source      = "${path.root}/scripts/cloudwatch.json"
    destination = "/tmp/cloudwatch.json"
  }

  provisioner "shell" {
    inline = [
      "sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/bin",
      "sudo cp /tmp/cloudwatch.json /opt/aws/amazon-cloudwatch-agent/bin/config.template.json",
    ]
  }

  # ─── Step 3: Copy frontend application code ──────────────────
  provisioner "file" {
    source      = "${path.root}/../frontend"
    destination = "/tmp/frontend"
  }

  # ─── Step 4: Install deps + build Next.js ────────────────────
  provisioner "shell" {
    inline = [
      "sudo mkdir -p /app",
      "sudo cp -r /tmp/frontend/* /app/",
      "sudo chown -R ubuntu:ubuntu /app",
      "cd /app && npm ci",
      "cd /app && npm run build",
      # Copy static assets into standalone output
      "mkdir -p /app/.next/standalone/.next",
      "cp -r /app/.next/static /app/.next/standalone/.next/static",
      "sudo rm -rf /app/node_modules/.cache",
      "sudo rm -rf /tmp/frontend /tmp/cloudwatch.json",
    ]
  }

  # ─── Step 5: Create systemd service ──────────────────────────
  provisioner "file" {
    content = <<-SERVICE
      [Unit]
      Description=Interview Arena Frontend (Next.js)
      Documentation=https://github.com/your-org/interview-arena
      After=network.target
      Wants=amazon-cloudwatch-agent.service

      [Service]
      Type=simple
      User=ubuntu
      Group=ubuntu
      WorkingDirectory=/app/.next/standalone
      Environment=NODE_ENV=production
      ExecStart=/usr/bin/node /app/.next/standalone/server.js
      Restart=always
      RestartSec=10
      StandardOutput=journal
      StandardError=journal
      SyslogIdentifier=interview-arena-frontend
      LimitNOFILE=65536

      [Install]
      WantedBy=multi-user.target
    SERVICE
    destination = "/tmp/interview-arena-frontend.service"
  }

  provisioner "shell" {
    inline = [
      "sudo mv /tmp/interview-arena-frontend.service /etc/systemd/system/",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable interview-arena-frontend",
    ]
  }

  # ─── Step 6: Create firstboot script ─────────────────────────
  provisioner "file" {
    content = <<-FIRSTBOOT
      #!/bin/bash
      # Runs once on first instance boot to configure CloudWatch Agent
      set -euo pipefail

      if [ -f /opt/aws/amazon-cloudwatch-agent/bin/config.template.json ]; then
        sed -e "s/$${project_name}/${var.project_name}/g" \
            -e "s/$${environment}/${var.environment}/g" \
            /opt/aws/amazon-cloudwatch-agent/bin/config.template.json \
            > /opt/aws/amazon-cloudwatch-agent/bin/config.json

        /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
          -a fetch-config -m ec2 -s \
          -c "file:/opt/aws/amazon-cloudwatch-agent/bin/config.json"
      fi
    FIRSTBOOT
    destination = "/tmp/firstboot.sh"
  }

  provisioner "shell" {
    inline = [
      "sudo mkdir -p /app/bin",
      "sudo cp /tmp/firstboot.sh /app/bin/firstboot.sh",
      "sudo chmod +x /app/bin/firstboot.sh",
    ]
  }

  # ─── Step 7: Clean up ────────────────────────────────────────
  provisioner "shell" {
    inline = [
      "sudo apt-get clean -qq",
      "sudo rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/*",
      "sudo rm -rf /tmp/*",
      "sudo journalctl --vacuum-size=10M || true",
    ]
  }
}
