variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "domain_name" {
  description = "Domain name to issue certificate for"
  type        = string
}

variable "hosted_zone_name" {
  description = "Route53 hosted zone name for DNS validation"
  type        = string
}
