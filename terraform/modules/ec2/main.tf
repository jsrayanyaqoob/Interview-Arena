# =============================================================================
# EC2 Module
# =============================================================================
# PURPOSE:  EC2 launch templates + Auto Scaling Groups for backend and
#           frontend applications. Instances run in private subnets behind
#           the ALB. AMIs are pre-built with Packer.
# DEPENDS:  VPC, IAM, ALB, Secrets, RDS, S3
# OUTPUTS:  asg_names, launch_template_ids, security_group_ids
# =============================================================================

# ---------------------------------------------------------------------------
# EC2 Security Group
# ---------------------------------------------------------------------------
resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-${var.environment}-ec2-sg"
  description = "Security group for EC2 instances (backend + frontend)"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Backend application traffic from ALB"
    from_port       = var.backend_port
    to_port         = var.backend_port
    protocol        = "tcp"
    security_groups = [var.alb_security_group_id]
  }

  ingress {
    description     = "Frontend application traffic from ALB"
    from_port       = var.frontend_port
    to_port         = var.frontend_port
    protocol        = "tcp"
    security_groups = [var.alb_security_group_id]
  }

  ingress {
    description = "SSH from authorized IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_ip]
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-ec2-sg"
  }
}

# ---------------------------------------------------------------------------
# Ubuntu LTS AMI Data Source
# ---------------------------------------------------------------------------
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]  # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ---------------------------------------------------------------------------
# Launch Template
# ---------------------------------------------------------------------------
resource "aws_launch_template" "main" {
  name                   = "${var.project_name}-${var.environment}-lt"
  description            = "Launch template for ${var.project_name} ${var.environment} EC2 instances (AMI: ${var.backend_ami_id != null ? "Packer-built" : "Ubuntu auto-discovered"})"
  image_id               = var.backend_ami_id != null ? var.backend_ami_id : data.aws_ami.ubuntu.id
  instance_type          = var.backend_instance_type
  vpc_security_group_ids = [aws_security_group.ec2.id]

  iam_instance_profile {
    arn = var.ec2_instance_profile_arn
  }

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    project_name = var.project_name
    environment  = var.environment
  }))

  block_device_mappings {
    device_name = "/dev/sda1"
    ebs {
      volume_size           = 20
      volume_type           = "gp3"
      delete_on_termination = true
      encrypted             = true
    }
  }

  metadata_options {
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  monitoring {
    enabled = true
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.project_name}-${var.environment}-instance"
    }
  }

  tag_specifications {
    resource_type = "volume"
    tags = {
      Name = "${var.project_name}-${var.environment}-volume"
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-lt"
  }
}

# ---------------------------------------------------------------------------
# EC2 Instance (single, in public subnet)
# ---------------------------------------------------------------------------
resource "aws_instance" "main" {
  launch_template {
    id      = aws_launch_template.main.id
    version = aws_launch_template.main.latest_version
  }

  subnet_id                   = var.public_subnet_ids[0]
  associate_public_ip_address = true

  tags = {
    Name = "${var.project_name}-${var.environment}-instance"
  }
}

# ---------------------------------------------------------------------------
# Target Group Attachment (register instance with ALB)
# ---------------------------------------------------------------------------
resource "aws_lb_target_group_attachment" "main" {
  target_group_arn = var.target_group_arn
  target_id        = aws_instance.main.id
  port             = var.frontend_port
}
