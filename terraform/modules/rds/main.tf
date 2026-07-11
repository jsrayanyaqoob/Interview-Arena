# =============================================================================
# RDS PostgreSQL Module
# =============================================================================
# PURPOSE:  Managed PostgreSQL database for the platform. Includes security
#           group, subnet group, parameter group, and CloudWatch alarms.
# DEPENDS:  VPC (vpc_id, private_subnet_ids), EC2 backend SG (for ingress)
# OUTPUTS:  rds_endpoint, rds_port, rds_database_name, rds_username
# =============================================================================
# Resources will be added in a subsequent step.
# =============================================================================
