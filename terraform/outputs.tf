# =============================================================================
# Root Outputs
# =============================================================================
# NOTE: Commented out during skeleton phase.
# Uncomment when resources are created in subsequent steps.
# =============================================================================

# output "vpc_id" {
#   description = "ID of the VPC"
#   value       = module.vpc.vpc_id
# }

# output "vpc_cidr" {
#   description = "CIDR block of the VPC"
#   value       = module.vpc.vpc_cidr
# }

# output "public_subnet_ids" {
#   description = "IDs of the public subnets"
#   value       = module.vpc.public_subnet_ids
# }

# output "private_subnet_ids" {
#   description = "IDs of the private subnets"
#   value       = module.vpc.private_subnet_ids
# }

# output "alb_dns_name" {
#   description = "DNS name of the Application Load Balancer"
#   value       = module.alb.alb_dns_name
# }

# output "alb_zone_id" {
#   description = "Route53 zone ID of the ALB (for DNS alias records)"
#   value       = module.alb.alb_zone_id
# }

# output "cloudfront_domain_name" {
#   description = "CloudFront distribution domain name"
#   value       = module.cloudfront.cloudfront_domain_name
# }

# output "cloudfront_distribution_id" {
#   description = "CloudFront distribution ID for invalidation commands"
#   value       = module.cloudfront.cloudfront_distribution_id
# }

# output "rds_endpoint" {
#   description = "RDS PostgreSQL endpoint (hostname:port)"
#   value       = module.rds.rds_endpoint
#   sensitive   = true
# }

# output "rds_database_name" {
#   description = "RDS PostgreSQL database name"
#   value       = module.rds.rds_database_name
# }

# output "backend_asg_name" {
#   description = "Backend Auto Scaling Group name"
#   value       = module.ec2.backend_asg_name
# }

# output "frontend_asg_name" {
#   description = "Frontend Auto Scaling Group name"
#   value       = module.ec2.frontend_asg_name
# }

# output "backend_launch_template_id" {
#   description = "Backend launch template ID"
#   value       = module.ec2.backend_launch_template_id
# }

# output "frontend_launch_template_id" {
#   description = "Frontend launch template ID"
#   value       = module.ec2.frontend_launch_template_id
# }

# output "uploads_s3_bucket" {
#   description = "S3 bucket name for file uploads (resumes, avatars)"
#   value       = module.s3.uploads_bucket_name
# }

# output "frontend_s3_bucket" {
#   description = "S3 bucket name for frontend static assets"
#   value       = module.s3.frontend_bucket_name
# }

# output "dynamodb_tables" {
#   description = "Map of DynamoDB table names"
#   value       = module.dynamodb.table_names
# }

# output "ec2_instance_profile_arn" {
#   description = "IAM instance profile ARN for EC2 instances"
#   value       = module.iam.ec2_instance_profile_arn
# }

# output "state_bucket_name" {
#   description = "S3 bucket name for Terraform remote state"
#   value       = module.state_bootstrap.state_bucket_name
# }

# output "state_lock_table_name" {
#   description = "DynamoDB table name for Terraform state locking"
#   value       = module.state_bootstrap.lock_table_name
# }
