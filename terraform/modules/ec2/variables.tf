variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for security groups"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for the standalone EC2 instance"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for ASGs"
  type        = list(string)
}

variable "backend_port" {
  description = "Backend application port"
  type        = number
}

variable "frontend_port" {
  description = "Frontend application port"
  type        = number
}

variable "backend_instance_type" {
  description = "EC2 instance type for backend"
  type        = string
}

variable "frontend_instance_type" {
  description = "EC2 instance type for frontend"
  type        = string
}

variable "backend_volume_size" {
  description = "EBS volume size (GB) for backend"
  type        = number
}

variable "frontend_volume_size" {
  description = "EBS volume size (GB) for frontend"
  type        = number
}

variable "backend_min_size" {
  description = "ASG min size for backend"
  type        = number
}

variable "backend_max_size" {
  description = "ASG max size for backend"
  type        = number
}

variable "backend_desired_capacity" {
  description = "ASG desired capacity for backend"
  type        = number
}

variable "frontend_min_size" {
  description = "ASG min size for frontend"
  type        = number
}

variable "frontend_max_size" {
  description = "ASG max size for frontend"
  type        = number
}

variable "frontend_desired_capacity" {
  description = "ASG desired capacity for frontend"
  type        = number
}

variable "backend_ami_id" {
  description = "Override AMI ID for backend (null = auto-discover)"
  type        = string
  default     = null
}

variable "frontend_ami_id" {
  description = "Override AMI ID for frontend (null = auto-discover)"
  type        = string
  default     = null
}

variable "ssh_allowed_ip" {
  description = "CIDR block allowed for SSH access (e.g., 203.0.113.5/32)"
  type        = string
}

variable "ec2_instance_profile_arn" {
  description = "IAM instance profile ARN"
  type        = string
}

variable "alb_security_group_id" {
  description = "ALB security group ID (for ingress rules)"
  type        = string
}

variable "target_group_arn" {
  description = "Backend ALB target group ARN"
  type        = string
}

variable "frontend_target_group_arn" {
  description = "Frontend ALB target group ARN"
  type        = string
}

variable "target_group_name" {
  description = "Backend target group name (for alarms)"
  type        = string
}

variable "frontend_target_group_name" {
  description = "Frontend target group name (for alarms)"
  type        = string
}

variable "alb_dns_name" {
  description = "ALB DNS name (for user data)"
  type        = string
}

variable "alb_arn_suffix" {
  description = "ALB ARN suffix (for CloudWatch alarms)"
  type        = string
}

variable "rds_endpoint" {
  description = "RDS endpoint"
  type        = string
}

variable "rds_port" {
  description = "RDS port"
  type        = number
}

variable "rds_database_name" {
  description = "RDS database name"
  type        = string
}

variable "rds_username" {
  description = "RDS master username"
  type        = string
}

variable "jwt_secret_arn" {
  description = "JWT secret ARN"
  type        = string
}

variable "jwt_refresh_secret_arn" {
  description = "JWT refresh secret ARN"
  type        = string
}

variable "gemini_api_key_arn" {
  description = "Gemini API key ARN"
  type        = string
}

variable "database_password_secret_arn" {
  description = "Database password secret ARN"
  type        = string
}

variable "uploads_bucket_name" {
  description = "S3 uploads bucket name"
  type        = string
}

variable "domain_name" {
  description = "Custom domain name"
  type        = string
  default     = null
}

variable "enable_detailed_monitoring" {
  description = "Enable detailed CloudWatch monitoring"
  type        = bool
  default     = true
}
