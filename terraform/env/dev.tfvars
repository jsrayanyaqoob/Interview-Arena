# =============================================================================
# Dev Environment
# =============================================================================
# Low-cost configuration for development and testing.
# Single AZ, minimal instances, small RDS instance.
# =============================================================================

environment                = "dev"
aws_region                 = "us-east-1"

# Networking
vpc_cidr                   = "10.0.0.0/16"
public_subnet_cidrs        = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs       = ["10.0.10.0/24", "10.0.11.0/24"]
enable_vpc_flow_logs       = true
enable_vpc_endpoints       = true

# Database
database_name              = "interviewarena"
database_username          = "interviewarena_admin"
database_port              = 5432
database_instance_class    = "db.t3.small"
database_allocated_storage = 20
database_max_allocated_storage = 100
database_backup_retention_days = 7
database_multi_az          = false
database_deletion_protection = false

# Application Ports
backend_port               = 5000
frontend_port              = 3000

# EC2 / Auto Scaling
backend_instance_type      = "t3.medium"
frontend_instance_type     = "t3.small"
backend_volume_size        = 20
frontend_volume_size       = 20
backend_min_size           = 1
backend_max_size           = 3
backend_desired_capacity   = 1
frontend_min_size          = 1
frontend_max_size          = 3
frontend_desired_capacity  = 1

# Security
ssh_allowed_ip            = "125.209.102.118/32"

# Monitoring
alarm_email                = null
enable_detailed_monitoring = true

# WAF
enable_waf                 = false

# Logs
logs_retention_days        = 7
ami_retention_count        = 3

# Domain (no custom domain for dev)
domain_name                = null
hosted_zone_name           = null
acm_certificate_arn        = null
