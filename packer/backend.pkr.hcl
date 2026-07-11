# =============================================================================
# Packer Template: Interview Arena Backend AMI
# =============================================================================
# Builds an Amazon Linux 2023 AMI with:
#   - Node.js 22
#   - PM2 process manager
#   - Backend application code
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
  ami_name  = "${var.project_name}-${var.environment}-backend-${local.timestamp}"
}

source "amazon-ebs" "backend" {
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
    Service     = "backend"
    ManagedBy   = "Packer"
  }

  run_tags = {
    Name        = "packer-builder-${var.project_name}-${var.environment}-backend"
    Environment = var.environment
    Project     = var.project_name
  }

  # Enable detailed CloudWatch monitoring
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
  name    = "interview-arena-backend"
  sources = ["source.amazon-ebs.backend"]

  # Update system packages
  provisioner "shell" {
    inline = [
      "sudo dnf update -y",
      "sudo dnf upgrade -y --security",
    ]
  }    # Install Node.js 22 + prisma CLI globally (needed for prisma generate/db push)
  provisioner "shell" {
    inline = [
      "curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -",
      "sudo dnf install -y nodejs",
      "sudo npm install -g pm2 prisma",
      "node --version",
      "npm --version",
      "prisma --version",
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

  # Copy backend application code
  provisioner "file" {
    source      = "${path.root}/../backend"
    destination = "/tmp/backend"
  }

  # Install npm dependencies and set up the app
  provisioner "shell" {
    inline = [
      "sudo mkdir -p /app",
      "sudo cp -r /tmp/backend/* /app/",
      "sudo chown -R app:app /app",
    "cd /app && sudo -u app npm ci",
    "cd /app && sudo -u app npx prisma generate",
    "cd /app && sudo -u app npm prune --omit=dev",
      "sudo rm -rf /tmp/backend",
    ]
  }

  # Create systemd service for the backend
  provisioner "file" {
    content = <<-SERVICE
      [Unit]
      Description=Interview Arena Backend
      After=network.target

      [Service]
      Type=simple
      User=app
      WorkingDirectory=/app
      Environment=NODE_ENV=production
      ExecStart=/usr/bin/node /app/src/server.js
      Restart=always
      RestartSec=10
      StandardOutput=journal
      StandardError=journal
      SyslogIdentifier=interview-arena-backend

      [Install]
      WantedBy=multi-user.target
    SERVICE
    destination = "/tmp/interview-arena-backend.service"
  }

  provisioner "shell" {
    inline = [
      "sudo mv /tmp/interview-arena-backend.service /etc/systemd/system/",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable interview-arena-backend",
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
      "echo 'Backend AMI build complete'",
    ]
  }
}
