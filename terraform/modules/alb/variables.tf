variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID to place the ALB in"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for the ALB"
  type        = list(string)
}

variable "backend_port" {
  description = "Port the backend target group listens on"
  type        = number
}

variable "frontend_port" {
  description = "Port the frontend target group listens on"
  type        = number
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS listener (null = HTTP only)"
  type        = string
  default     = null
}
