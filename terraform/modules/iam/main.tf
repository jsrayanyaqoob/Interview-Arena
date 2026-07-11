# =============================================================================
# IAM Module
# =============================================================================
# PURPOSE:  EC2 instance profile role with permissions for CloudWatch Agent,
#           Systems Manager (SSM), and read access to DynamoDB, S3, and
#           Secrets Manager.
# DEPENDS:  Nothing
# OUTPUTS:  ec2_instance_profile_arn, ec2_instance_role_arn
# =============================================================================

# ---------------------------------------------------------------------------
# EC2 IAM Role
# ---------------------------------------------------------------------------
resource "aws_iam_role" "ec2_instance_role" {
  name = "${var.project_name}-${var.environment}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  description = "IAM role for EC2 instances in ${var.project_name} ${var.environment}"

  tags = {
    Name = "${var.project_name}-${var.environment}-ec2-role"
  }
}

# ---------------------------------------------------------------------------
# Managed Policy Attachments
# ---------------------------------------------------------------------------

# CloudWatch Agent - metrics, logs, and dashboard access
resource "aws_iam_role_policy_attachment" "cloudwatch_agent" {
  role       = aws_iam_role.ec2_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# Systems Manager - instance management, patching, session manager
resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# ---------------------------------------------------------------------------
# Custom Read-Only Policy - Application Services
# ---------------------------------------------------------------------------
resource "aws_iam_policy" "ec2_read_only" {
  name        = "${var.project_name}-${var.environment}-ec2-readonly"
  description = "Read-only access to DynamoDB, S3, and Secrets Manager for EC2 instances"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DynamoDBReadAccess"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:DescribeTable"
        ]
        Resource = "arn:aws:dynamodb:*:*:table/${var.project_name}-${var.environment}-*"
      },
      {
        Sid    = "S3ReadAccess"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::${var.project_name}-${var.environment}-*",
          "arn:aws:s3:::${var.project_name}-${var.environment}-*/*"
        ]
      },
      {
        Sid    = "SecretsManagerReadAccess"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:aws:secretsmanager:*:*:secret:${var.project_name}-${var.environment}-*"
      },
      {
        Sid    = "EC2DescribeAccess"
        Effect = "Allow"
        Action = [
          "ec2:DescribeTags",
          "ec2:DescribeInstances"
        ]
        Resource = "*"
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-ec2-readonly"
  }
}

resource "aws_iam_role_policy_attachment" "ec2_read_only" {
  role       = aws_iam_role.ec2_instance_role.name
  policy_arn = aws_iam_policy.ec2_read_only.arn
}

# ---------------------------------------------------------------------------
# Instance Profile
# ---------------------------------------------------------------------------
resource "aws_iam_instance_profile" "ec2" {
  name = "${var.project_name}-${var.environment}-ec2-instance-profile"
  role = aws_iam_role.ec2_instance_role.name

  tags = {
    Name = "${var.project_name}-${var.environment}-ec2-instance-profile"
  }
}
