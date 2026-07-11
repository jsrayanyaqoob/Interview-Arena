# =============================================================================
# Packer Template: Interview Arena Frontend AMI
# =============================================================================
# Builds an Amazon Linux 2023 AMI with:
#   - Node.js 22
#   - PM2 process manager
#   - Frontend application code (Next.js standalone build)
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

variable "environment" {
  type    = string
  default = "dev"
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "interview-arena"
}

locals {
  timestamp = formatdate("YYYYMMDDHHmmss", timestamp())
  ami_name  = "${var.project_name}-${var.environment}-frontend-${local.timestamp}"
}

source "amazon-ebs" "frontend" {
  region        = var.aws_region
  ami_name      = local.ami_name
  instance_type = "t3.small"
  source_ami_filter {
    filters = {
      name                = "al2023-ami-2023.*-kernel-6.1-x86_64"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["amazon"]
  }
  ssh_username = "ec2-user"

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
  }

  enable_volume_delete_on_termination = true

  launch_block_device_mappings {
    device_name           = "/dev/xvda"
    delete_on_termination = true
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
  }
}

build {
  name    = "interview-arena-frontend"
  sources = ["source.amazon-ebs.frontend"]

  # Update system packages
  provisioner "shell" {
    inline = [
      "sudo dnf update -y",
      "sudo dnf upgrade -y --security",
    ]
  }

  # Install Node.js 22
  provisioner "shell" {
    inline = [
      "curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -",
      "sudo dnf install -y nodejs",
      "sudo npm install -g pm2",
      "node --version",
      "npm --version",
    ]
  }

  # Install system dependencies
  provisioner "shell" {
    inline = [
      "sudo dnf install -y gcc-c++ make git jq curl unzip",
    ]
  }

  # Create the app user
  provisioner "shell" {
    inline = [
      "sudo useradd -m -s /bin/bash -r app || true",
    ]
  }

  # Copy frontend application code
  provisioner "file" {
    source      = "${path.root}/../frontend"
    destination = "/tmp/frontend"
  }

  # Install npm dependencies and build Next.js
  provisioner "shell" {
    inline = [
      "sudo mkdir -p /app",
      "sudo cp -r /tmp/frontend/* /app/",
      "sudo chown -R app:app /app",
      "cd /app && sudo -u app npm ci",
      "cd /app && sudo -u app npm run build",
      # Copy static assets into standalone output so server.js can serve them
      "mkdir -p /app/.next/standalone/.next && cp -r /app/.next/static /app/.next/standalone/.next/static",
      "sudo rm -rf /app/node_modules/.cache",
      "sudo rm -rf /tmp/frontend",
    ]
  }

  # Create systemd service for the frontend
  provisioner "file" {
    content = <<-SERVICE
      [Unit]
      Description=Interview Arena Frontend
      After=network.target

      [Service]
      Type=simple
      User=app
      WorkingDirectory=/app/.next/standalone
      Environment=NODE_ENV=production
      ExecStart=/usr/bin/node /app/.next/standalone/server.js
      Restart=always
      RestartSec=10
      StandardOutput=journal
      StandardError=journal
      SyslogIdentifier=interview-arena-frontend

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

  # Clean up
  provisioner "shell" {
    inline = [
      "sudo dnf clean all",
      "sudo rm -rf /var/cache/dnf/*",
      "sudo rm -rf /tmp/*",
    ]
  }

  # Tag the AMI
  provisioner "shell" {
    inline = [
      "echo 'Frontend AMI build complete'",
    ]
  }
}
