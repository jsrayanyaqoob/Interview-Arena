output "jwt_secret_arn" {
  description = "ARN of the JWT secret"
  value       = ""  # Placeholder — replace with aws_secretsmanager_secret.jwt_secret.arn when resources are added
}

output "jwt_refresh_secret_arn" {
  description = "ARN of the JWT refresh secret"
  value       = ""  # Placeholder — replace with aws_secretsmanager_secret.jwt_refresh_secret.arn when resources are added
}

output "gemini_api_key_arn" {
  description = "ARN of the Gemini API key"
  value       = ""  # Placeholder — replace with aws_secretsmanager_secret.gemini_api_key.arn when resources are added
}

output "database_password_secret_arn" {
  description = "ARN of the database password"
  value       = ""  # Placeholder — replace with aws_secretsmanager_secret.database_password.arn when resources are added
}

output "app_config_secret_arn" {
  description = "ARN of the app configuration secret"
  value       = ""  # Placeholder — replace with aws_secretsmanager_secret.app_config.arn when resources are added
}
