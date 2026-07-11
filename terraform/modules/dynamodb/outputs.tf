output "interview_sessions_table_name" {
  description = "Name of the interview sessions table"
  value       = ""  # Placeholder — replace with aws_dynamodb_table.interview_sessions.name when resources are added
}

output "analytics_events_table_name" {
  description = "Name of the analytics events table"
  value       = ""  # Placeholder — replace with aws_dynamodb_table.analytics_events.name when resources are added
}

output "api_cache_table_name" {
  description = "Name of the API cache table"
  value       = ""  # Placeholder — replace with aws_dynamodb_table.api_cache.name when resources are added
}

output "table_names" {
  description = "Map of all DynamoDB table names"
  value = {
    interview_sessions = ""  # Placeholder — replace with aws_dynamodb_table.interview_sessions.name
    analytics_events   = ""  # Placeholder — replace with aws_dynamodb_table.analytics_events.name
    api_cache          = ""  # Placeholder — replace with aws_dynamodb_table.api_cache.name
  }
}

output "table_arns" {
  description = "Map of all DynamoDB table ARNs"
  value = {
    interview_sessions = ""  # Placeholder — replace with aws_dynamodb_table.interview_sessions.arn
    analytics_events   = ""  # Placeholder — replace with aws_dynamodb_table.analytics_events.arn
    api_cache          = ""  # Placeholder — replace with aws_dynamodb_table.api_cache.arn
  }
}
