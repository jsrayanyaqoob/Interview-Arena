variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "alb_arn" {
  description = "ARN of the ALB to associate the WAF ACL with"
  type        = string
}

variable "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution to associate the WAF ACL with"
  type        = string
}
