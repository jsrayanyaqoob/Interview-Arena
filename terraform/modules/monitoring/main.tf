# =============================================================================
# Monitoring Module
# =============================================================================
# PURPOSE:  CloudWatch dashboards, metric alarms, SNS notifications, and log
#           groups for infrastructure and application monitoring.
# DEPENDS:  EC2 (ASG names), ALB (arn_suffix, target group names)
# OUTPUTS:  alarm_sns_topic_arn, dashboard_name, log_group_names
# =============================================================================

# ---------------------------------------------------------------------------
# SNS Topic for Alarm Notifications
# ---------------------------------------------------------------------------
resource "aws_sns_topic" "alarms" {
  name = "${var.project_name}-${var.environment}-alarms"

  tags = {
    Name        = "${var.project_name}-${var.environment}-alarms"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_sns_topic_subscription" "email" {
  count     = var.alarm_email != null ? 1 : 0
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

# ---------------------------------------------------------------------------
# EC2 CloudWatch Alarms
# ---------------------------------------------------------------------------
# Only create alarms when an instance_id is provided (i.e., EC2 module has
# created a standalone instance). Auto Scaling alarms are NOT created here.

# High CPU — alert when CPU exceeds 80% for 5 consecutive minutes
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  count = var.instance_id != null ? 1 : 0

  alarm_name          = "${var.project_name}-${var.environment}-high-cpu"
  alarm_description   = "EC2 CPU utilization exceeds 80% for 5 minutes"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  threshold           = 80
  datapoints_to_alarm = 2

  metric_name        = "CPUUtilization"
  namespace          = "AWS/EC2"
  period             = 300  # 5 minutes
  statistic          = "Average"

  dimensions = {
    InstanceId = var.instance_id
  }

  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  insufficient_data_actions = []

  treat_missing_data = "missing"

  tags = {
    Name        = "${var.project_name}-${var.environment}-high-cpu"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Low Disk Space — alert when root disk usage exceeds 80%
# Requires CloudWatch Agent to report disk_used_percent metric
resource "aws_cloudwatch_metric_alarm" "low_disk" {
  count = var.instance_id != null ? 1 : 0

  alarm_name          = "${var.project_name}-${var.environment}-low-disk"
  alarm_description   = "EC2 root disk usage exceeds 80% (requires CW Agent)"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  threshold           = 80
  datapoints_to_alarm = 2

  metric_name        = "disk_used_percent"
  namespace          = "CWAgent"
  period             = 300  # 5 minutes
  statistic          = "Average"

  dimensions = {
    InstanceId = var.instance_id
    path       = "/"
    device     = "/dev/sda1"
    fstype     = "ext4"
  }

  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  insufficient_data_actions = []

  treat_missing_data = "notBreaching"

  tags = {
    Name        = "${var.project_name}-${var.environment}-low-disk"
    Environment = var.environment
    Project     = var.project_name
  }
}

# EC2 Status Check Failed — alert on instance health check failure
resource "aws_cloudwatch_metric_alarm" "status_check_failed" {
  count = var.instance_id != null ? 1 : 0

  alarm_name          = "${var.project_name}-${var.environment}-status-check-failed"
  alarm_description   = "EC2 status check failed (system or instance)"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  threshold           = 0
  datapoints_to_alarm = 2

  metric_name        = "StatusCheckFailed"
  namespace          = "AWS/EC2"
  period             = 300  # 5 minutes
  statistic          = "Maximum"

  dimensions = {
    InstanceId = var.instance_id
  }

  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  insufficient_data_actions = []

  treat_missing_data = "missing"

  tags = {
    Name        = "${var.project_name}-${var.environment}-status-check-failed"
    Environment = var.environment
    Project     = var.project_name
  }
}

# ---------------------------------------------------------------------------
# CloudWatch Log Groups
# ---------------------------------------------------------------------------
# NOTE: Log group names must match the log_group_name configured in the
# CloudWatch Agent config on EC2 instances (see user_data.sh).

# EC2 System Logs (/var/log/syslog, /var/log/auth.log, etc.)
resource "aws_cloudwatch_log_group" "syslog" {
  name              = "${var.project_name}-${var.environment}-syslog"
  retention_in_days = var.logs_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-syslog"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Application Logs (PM2 / Node.js output, /app/logs)
resource "aws_cloudwatch_log_group" "application" {
  name              = "${var.project_name}-${var.environment}-application"
  retention_in_days = var.logs_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-application"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Nginx Logs (access.log + error.log)
resource "aws_cloudwatch_log_group" "nginx" {
  name              = "${var.project_name}-${var.environment}-nginx"
  retention_in_days = var.logs_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-nginx"
    Environment = var.environment
    Project     = var.project_name
  }
}
