output "alarm_sns_topic_arn" {
  description = "ARN of the SNS topic for CloudWatch alarms"
  value       = aws_sns_topic.alarms.arn
}

output "dashboard_name" {
  description = "Name of the CloudWatch dashboard"
  value       = ""  # Placeholder — replace with aws_cloudwatch_dashboard.main.dashboard_name when resources are added
}

output "high_cpu_alarm_name" {
  description = "Name of the high CPU alarm"
  value       = try(aws_cloudwatch_metric_alarm.high_cpu[0].alarm_name, null)
}

output "low_disk_alarm_name" {
  description = "Name of the low disk space alarm"
  value       = try(aws_cloudwatch_metric_alarm.low_disk[0].alarm_name, null)
}

output "status_check_alarm_name" {
  description = "Name of the status check failed alarm"
  value       = try(aws_cloudwatch_metric_alarm.status_check_failed[0].alarm_name, null)
}

output "log_group_names" {
  description = "List of CloudWatch log group names"
  value = [
    aws_cloudwatch_log_group.syslog.name,
    aws_cloudwatch_log_group.application.name,
    aws_cloudwatch_log_group.nginx.name,
  ]
}

output "syslog_log_group_name" {
  description = "CloudWatch log group name for EC2 system logs"
  value       = aws_cloudwatch_log_group.syslog.name
}

output "application_log_group_name" {
  description = "CloudWatch log group name for application logs"
  value       = aws_cloudwatch_log_group.application.name
}

output "nginx_log_group_name" {
  description = "CloudWatch log group name for Nginx logs"
  value       = aws_cloudwatch_log_group.nginx.name
}
