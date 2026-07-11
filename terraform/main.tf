# =============================================================================
# Module Orchestration
# =============================================================================
# This file wires together all infrastructure modules.
# Order matters: modules with dependencies are sequenced accordingly.
# =============================================================================
#
# Data sources
data "aws_caller_identity" "current" {}
data "aws_availability_zones" "available" {
  state = "available"
}
#
# NOTE: The RDS→EC2 SG rule will be uncommented when both modules have resources.
#   resource "aws_security_group_rule" "rds_from_ec2" { ... }
#
# ---------------------------------------------------------------------------
# State Bootstrap (S3 + DynamoDB for remote state)
# ---------------------------------------------------------------------------
module "state_bootstrap" {
  source = "./modules/state_bootstrap"

  project_name = var.project_name
  environment  = var.environment
}

# ---------------------------------------------------------------------------
# VPC & Networking
# ---------------------------------------------------------------------------
module "vpc" {
  source = "./modules/vpc"

  project_name          = var.project_name
  environment           = var.environment
  vpc_cidr              = var.vpc_cidr
  availability_zones    = local.azs
  public_subnet_cidrs   = var.public_subnet_cidrs
  private_subnet_cidrs  = var.private_subnet_cidrs
  enable_flow_logs      = var.enable_vpc_flow_logs
  enable_vpc_endpoints  = var.enable_vpc_endpoints
}

# ---------------------------------------------------------------------------
# IAM Roles & Policies
# ---------------------------------------------------------------------------
module "iam" {
  source = "./modules/iam"

  project_name = var.project_name
  environment  = var.environment
}

# ---------------------------------------------------------------------------
# Secrets Manager
# ---------------------------------------------------------------------------
module "secrets" {
  source = "./modules/secrets"

  project_name       = var.project_name
  environment        = var.environment
  jwt_secret         = var.jwt_secret
  jwt_refresh_secret = var.jwt_refresh_secret
  gemini_api_key     = var.gemini_api_key
  database_password  = var.database_password
}

# ---------------------------------------------------------------------------
# ACM Certificate (optional — only if domain_name is provided)
# ---------------------------------------------------------------------------
module "acm" {
  source = "./modules/acm"

  count = var.domain_name != null ? 1 : 0

  project_name      = var.project_name
  environment       = var.environment
  domain_name       = var.domain_name
  hosted_zone_name  = var.hosted_zone_name
}

# ---------------------------------------------------------------------------
# RDS PostgreSQL
# ---------------------------------------------------------------------------
module "rds" {
  source = "./modules/rds"

  project_name             = var.project_name
  environment              = var.environment
  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnet_ids
  database_name            = var.database_name
  database_username        = var.database_username
  database_password        = var.database_password
  database_port            = var.database_port
  instance_class           = var.database_instance_class
  allocated_storage        = var.database_allocated_storage
  max_allocated_storage    = var.database_max_allocated_storage
  backup_retention_days    = var.database_backup_retention_days
  multi_az                 = var.database_multi_az
  deletion_protection      = var.database_deletion_protection
}

# ---------------------------------------------------------------------------
# DynamoDB Tables
# ---------------------------------------------------------------------------
module "dynamodb" {
  source = "./modules/dynamodb"

  project_name = var.project_name
  environment  = var.environment
}

# ---------------------------------------------------------------------------
# S3 Buckets
# ---------------------------------------------------------------------------
module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environment  = var.environment
  domain_name  = var.domain_name
}

# ---------------------------------------------------------------------------
# Application Load Balancer
# ---------------------------------------------------------------------------
module "alb" {
  source = "./modules/alb"

  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  backend_port      = var.backend_port
  frontend_port     = var.frontend_port
  certificate_arn   = var.acm_certificate_arn != null ? var.acm_certificate_arn : try(module.acm[0].certificate_arn, null)
}

# ---------------------------------------------------------------------------
# EC2 / Auto Scaling
# ---------------------------------------------------------------------------
module "ec2" {
  source = "./modules/ec2"

  project_name                 = var.project_name
  environment                  = var.environment
  vpc_id                       = module.vpc.vpc_id
  public_subnet_ids            = module.vpc.public_subnet_ids
  private_subnet_ids           = module.vpc.private_subnet_ids
  backend_port                 = var.backend_port
  frontend_port                = var.frontend_port
  backend_instance_type        = var.backend_instance_type
  frontend_instance_type       = var.frontend_instance_type
  backend_volume_size          = var.backend_volume_size
  frontend_volume_size         = var.frontend_volume_size
  backend_min_size             = var.backend_min_size
  backend_max_size             = var.backend_max_size
  backend_desired_capacity     = var.backend_desired_capacity
  frontend_min_size            = var.frontend_min_size
  frontend_max_size            = var.frontend_max_size
  frontend_desired_capacity    = var.frontend_desired_capacity
  backend_ami_id               = var.backend_ami_id
  frontend_ami_id              = var.frontend_ami_id
  ec2_instance_profile_arn     = module.iam.ec2_instance_profile_arn
  alb_security_group_id        = module.alb.alb_security_group_id
  target_group_arn             = module.alb.target_group_arn
  frontend_target_group_arn    = module.alb.frontend_target_group_arn
  target_group_name            = module.alb.target_group_name
  frontend_target_group_name   = module.alb.frontend_target_group_name
  alb_dns_name                 = module.alb.alb_dns_name
  alb_arn_suffix               = module.alb.alb_arn_suffix
  rds_endpoint                 = module.rds.rds_endpoint
  rds_port                     = module.rds.rds_port
  rds_database_name            = module.rds.rds_database_name
  rds_username                 = module.rds.rds_username
  jwt_secret_arn               = module.secrets.jwt_secret_arn
  jwt_refresh_secret_arn       = module.secrets.jwt_refresh_secret_arn
  gemini_api_key_arn           = module.secrets.gemini_api_key_arn
  database_password_secret_arn = module.secrets.database_password_secret_arn
  uploads_bucket_name          = module.s3.uploads_bucket_name
  domain_name                  = var.domain_name
  ssh_allowed_ip               = var.ssh_allowed_ip
  enable_detailed_monitoring   = var.enable_detailed_monitoring
}

# ---------------------------------------------------------------------------
# RDS → EC2 Security Group Rule (standalone to avoid circular dependency)
# ---------------------------------------------------------------------------
resource "aws_security_group_rule" "rds_from_ec2" {
  type                     = "ingress"
  from_port                = var.database_port
  to_port                  = var.database_port
  protocol                 = "tcp"
  source_security_group_id = module.ec2.backend_security_group_id
  security_group_id        = module.rds.rds_security_group_id
  description              = "Allow EC2 backend to access RDS"
}

# ---------------------------------------------------------------------------
# CloudFront CDN
# ---------------------------------------------------------------------------
module "cloudfront" {
  source = "./modules/cloudfront"

  project_name               = var.project_name
  environment                = var.environment
  frontend_bucket_domain     = module.s3.frontend_bucket_domain
  frontend_bucket_arn        = module.s3.frontend_bucket_arn
  frontend_oai_iam_arn       = module.s3.cloudfront_oai_iam_arn
  alb_dns_name               = module.alb.alb_dns_name
  domain_name                = var.domain_name
  acm_certificate_arn        = var.acm_certificate_arn != null ? var.acm_certificate_arn : try(module.acm[0].certificate_arn, null)
  logs_bucket_domain         = module.s3.logs_bucket_domain
}

# ---------------------------------------------------------------------------
# WAF (optional — disabled by default)
# ---------------------------------------------------------------------------
module "waf" {
  source = "./modules/waf"

  count = var.enable_waf ? 1 : 0

  project_name         = var.project_name
  environment          = var.environment
  alb_arn              = module.alb.alb_arn
  cloudfront_distribution_arn = module.cloudfront.cloudfront_distribution_arn
}

# ---------------------------------------------------------------------------
# Monitoring (CloudWatch + SNS)
# ---------------------------------------------------------------------------
module "monitoring" {
  source = "./modules/monitoring"

  project_name          = var.project_name
  environment           = var.environment
  alarm_email           = var.alarm_email
  instance_id           = module.ec2.instance_id
  backend_asg_name      = module.ec2.backend_asg_name
  frontend_asg_name     = module.ec2.frontend_asg_name
  alb_arn_suffix        = module.alb.alb_arn_suffix
  target_group_name     = module.alb.target_group_name
  frontend_target_group_name = module.alb.frontend_target_group_name
  logs_retention_days   = var.logs_retention_days
}
