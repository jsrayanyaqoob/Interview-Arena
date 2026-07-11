output "state_bucket_name" {
  description = "Name of the S3 bucket storing Terraform state"
  value       = ""  # Placeholder — replace with aws_s3_bucket.terraform_state.id when resources are added
}

output "state_bucket_arn" {
  description = "ARN of the S3 bucket storing Terraform state"
  value       = ""  # Placeholder — replace with aws_s3_bucket.terraform_state.arn when resources are added
}

output "lock_table_name" {
  description = "Name of the DynamoDB table for state locking"
  value       = ""  # Placeholder — replace with aws_dynamodb_table.terraform_locks.name when resources are added
}
