# =============================================================================
# Root Variables
# =============================================================================
# These variables are passed to child modules. Organized by AWS service area.
# =============================================================================

# ---------------------------------------------------------------------------
# General
# ---------------------------------------------------------------------------
variable "aws_region" {
  description = "AWS region to deploy all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
  default     = "interview-arena"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

# ---------------------------------------------------------------------------
# Networking
# ---------------------------------------------------------------------------
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones to deploy into (defaults to 2)"
  type        = list(string)
  default     = null
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "enable_vpc_flow_logs" {
  description = "Enable VPC flow logs for network auditing"
  type        = bool
  default     = true
}

variable "enable_vpc_endpoints" {
  description = "Create VPC endpoints for private subnet access to AWS services"
  type        = bool
  default     = true
}

# ---------------------------------------------------------------------------
# Database (RDS PostgreSQL)
# ---------------------------------------------------------------------------
variable "database_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "interviewarena"
}

variable "database_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "interviewarena_admin"
}

variable "database_password" {
  description = "PostgreSQL master password (sensitive — set via .tfvars or env var)"
  type        = string
  sensitive   = true
}

variable "database_port" {
  description = "PostgreSQL port"
  type        = number
  default     = 5432
}

variable "database_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.small"
}

variable "database_allocated_storage" {
  description = "Allocated storage for RDS in GB"
  type        = number
  default     = 20
}

variable "database_max_allocated_storage" {
  description = "Maximum autoscaling storage for RDS in GB"
  type        = number
  default     = 100
}

variable "database_backup_retention_days" {
  description = "Number of days to retain automated backups"
  type        = number
  default     = 7
}

variable "database_multi_az" {
  description = "Enable Multi-AZ deployment for high availability"
  type        = bool
  default     = false
}

variable "database_deletion_protection" {
  description = "Enable deletion protection for the database"
  type        = bool
  default     = true
}

# ---------------------------------------------------------------------------
# Application Ports
# ---------------------------------------------------------------------------
variable "backend_port" {
  description = "Port the backend Express.js server listens on"
  type        = number
  default     = 5000
}

variable "frontend_port" {
  description = "Port the frontend Next.js server listens on"
  type        = number
  default     = 3000
}

# ---------------------------------------------------------------------------
# EC2 / Auto Scaling
# ---------------------------------------------------------------------------
variable "backend_instance_type" {
  description = "EC2 instance type for backend servers"
  type        = string
  default     = "t3.micro"
}

variable "frontend_instance_type" {
  description = "EC2 instance type for frontend servers"
  type        = string
  default     = "t3.small"
}

variable "backend_volume_size" {
  description = "EBS root volume size (GB) for backend instances"
  type        = number
  default     = 20
}

variable "frontend_volume_size" {
  description = "EBS root volume size (GB) for frontend instances"
  type        = number
  default     = 20
}

variable "backend_min_size" {
  description = "Minimum number of backend instances in the ASG"
  type        = number
  default     = 1
}

variable "backend_max_size" {
  description = "Maximum number of backend instances in the ASG"
  type        = number
  default     = 10
}

variable "backend_desired_capacity" {
  description = "Desired number of backend instances"
  type        = number
  default     = 2
}

variable "frontend_min_size" {
  description = "Minimum number of frontend instances in the ASG"
  type        = number
  default     = 1
}

variable "frontend_max_size" {
  description = "Maximum number of frontend instances in the ASG"
  type        = number
  default     = 10
}

variable "frontend_desired_capacity" {
  description = "Desired number of frontend instances"
  type        = number
  default     = 2
}

# ---------------------------------------------------------------------------
# AMI (Packer-built)
# ---------------------------------------------------------------------------
variable "backend_ami_id" {
  description = "Override AMI ID for backend (leave empty to auto-discover latest)"
  type        = string
  default     = null
}

variable "frontend_ami_id" {
  description = "Override AMI ID for frontend (leave empty to auto-discover latest)"
  type        = string
  default     = null
}

# ---------------------------------------------------------------------------
# Secrets & API Keys
# ---------------------------------------------------------------------------
variable "jwt_secret" {
  description = "JWT signing secret (sensitive)"
  type        = string
  sensitive   = true
}

variable "jwt_refresh_secret" {
  description = "JWT refresh token secret (sensitive)"
  type        = string
  sensitive   = true
}

variable "gemini_api_key" {
  description = "Google Gemini API key (sensitive)"
  type        = string
  sensitive   = true
}

# ---------------------------------------------------------------------------
# Domain & SSL
# ---------------------------------------------------------------------------
variable "domain_name" {
  description = "Custom domain name (e.g., app.interviewarena.com). Leave empty to use CloudFront default domain."
  type        = string
  default     = null
}

variable "acm_certificate_arn" {
  description = "ARN of ACM certificate for HTTPS. Leave empty to auto-request one."
  type        = string
  default     = null
}

variable "hosted_zone_name" {
  description = "Route53 hosted zone name for DNS records (e.g., interviewarena.com)"
  type        = string
  default     = null
}

# ---------------------------------------------------------------------------
# Monitoring
# ---------------------------------------------------------------------------
variable "ssh_allowed_ip" {
  description = "CIDR block allowed for SSH access to EC2 instances (e.g., 203.0.113.5/32). Must be explicitly set per environment — no default for security."
  type        = string
}

variable "alarm_email" {
  description = "Email address for CloudWatch alarm notifications via SNS"
  type        = string
  default     = null
}

variable "enable_detailed_monitoring" {
  description = "Enable detailed CloudWatch monitoring on EC2 instances"
  type        = bool
  default     = true
}

# ---------------------------------------------------------------------------
# WAF
# ---------------------------------------------------------------------------
variable "enable_waf" {
  description = "Enable AWS WAF for ALB and CloudFront"
  type        = bool
  default     = false
}

# ---------------------------------------------------------------------------
# Backup & Retention
# ---------------------------------------------------------------------------
variable "logs_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 30
}

variable "ami_retention_count" {
  description = "Number of recent AMIs to retain per service"
  type        = number
  default     = 5
}
