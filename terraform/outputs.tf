# =============================================================================
# Root Outputs
# =============================================================================
# These outputs expose key infrastructure identifiers for use in CI/CD,
# external tooling, and cross-stack references.
# =============================================================================

output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.vpc.private_subnet_ids
}

output "security_group_ids" {
  description = "Map of security group IDs (alb, ec2)"
  value = {
    alb = module.alb.alb_security_group_id
    ec2 = module.ec2.backend_security_group_id
  }
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.alb_dns_name
}

output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = module.ec2.instance_public_ip
}

output "acm_certificate_arn" {
  description = "ARN of the ACM certificate (null if no domain configured)"
  value       = try(module.acm[0].certificate_arn, null)
}
