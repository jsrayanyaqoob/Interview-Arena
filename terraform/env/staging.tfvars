# =============================================================================
# Staging Environment
# =============================================================================
# Pre-production environment for integration testing.
# Mirrors production but with fewer instances and lower cost.
# =============================================================================

environment                = "staging"
aws_region                 = "us-east-1"

# Networking
vpc_cidr                   = "10.1.0.0/16"
public_subnet_cidrs        = ["10.1.1.0/24", "10.1.2.0/24"]
private_subnet_cidrs       = ["10.1.10.0/24", "10.1.11.0/24"]
enable_vpc_flow_logs       = true
enable_vpc_endpoints       = true

# Database
database_name              = "interviewarena"
database_username          = "interviewarena_admin"
database_port              = 5432
database_instance_class    = "db.t3.small"
database_allocated_storage = 40
database_max_allocated_storage = 200
database_backup_retention_days = 14
database_multi_az          = false
database_deletion_protection = true

# Application Ports
backend_port               = 5000
frontend_port              = 3000

# EC2 / Auto Scaling
backend_instance_type      = "t3.medium"
frontend_instance_type     = "t3.small"
backend_volume_size        = 30
frontend_volume_size       = 20
backend_min_size           = 2
backend_max_size           = 6
backend_desired_capacity   = 2
frontend_min_size          = 2
frontend_max_size          = 6
frontend_desired_capacity  = 2

# Security
ssh_allowed_ip            = "125.209.102.118/32"

# Monitoring
alarm_email                = "alerts@interviewarena.com"
enable_detailed_monitoring = true

# WAF
enable_waf                 = true

# Logs
logs_retention_days        = 30
ami_retention_count        = 5

# Domain (optional for staging)
domain_name                = null
hosted_zone_name           = null
acm_certificate_arn        = null
