output "rds_endpoint" {
  description = "RDS endpoint (hostname:port)"
  value       = ""  # Placeholder — replace with aws_db_instance.postgres.endpoint when resources are added
}

output "rds_port" {
  description = "RDS port"
  value       = 0  # Placeholder — replace with aws_db_instance.postgres.port when resources are added
}

output "rds_database_name" {
  description = "RDS database name"
  value       = ""  # Placeholder — replace with aws_db_instance.postgres.db_name when resources are added
}

output "rds_username" {
  description = "RDS master username"
  value       = ""  # Placeholder — replace with aws_db_instance.postgres.username when resources are added
}

output "rds_security_group_id" {
  description = "Security group ID for RDS"
  value       = ""  # Placeholder — replace with aws_security_group.rds.id when resources are added
}
