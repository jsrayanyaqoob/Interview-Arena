variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "alarm_email" {
  description = "Email address to send CloudWatch alarm notifications to"
  type        = string
  default     = null
}

variable "backend_asg_name" {
  description = "Backend ASG name (for scaling alarms)"
  type        = string
}

variable "frontend_asg_name" {
  description = "Frontend ASG name (for scaling alarms)"
  type        = string
}

variable "alb_arn_suffix" {
  description = "ALB ARN suffix for CloudWatch metric dimensions"
  type        = string
}

variable "target_group_name" {
  description = "Backend target group name"
  type        = string
}

variable "frontend_target_group_name" {
  description = "Frontend target group name"
  type        = string
}

variable "logs_retention_days" {
  description = "CloudWatch logs retention period in days"
  type        = number
}

variable "instance_id" {
  description = "EC2 instance ID for instance-level alarms (null = skip instance alarms)"
  type        = string
  default     = null
}
