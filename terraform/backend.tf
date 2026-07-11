# =============================================================================
# Remote State Backend (S3 + DynamoDB)
# =============================================================================
# UNCOMMENT BELOW AFTER RUNNING bootstrap-state.sh
# This migrates Terraform state from local to S3 with DynamoDB locking.
#
# Migration steps:
#   1. terraform init                               (local backend)
#   2. terraform apply -target=module.state_bootstrap (creates S3 + DynamoDB)
#   3. Update bucket name below with actual account ID
#   4. Uncomment this block
#   5. terraform init -migrate                      (copies state to S3)
#
# terraform {
#   backend "s3" {
#     bucket         = "${var.project_name}-terraform-state-ACCOUNT_ID"
#     key            = "${var.environment}/terraform.tfstate"
#     region         = "us-east-1"
#     dynamodb_table = "${var.project_name}-terraform-locks"
#     encrypt        = true
#   }
# }
