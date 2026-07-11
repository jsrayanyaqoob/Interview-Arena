output "uploads_bucket_name" {
  description = "Name of the uploads S3 bucket"
  value       = ""  # Placeholder — replace with aws_s3_bucket.uploads.id when resources are added
}

output "uploads_bucket_arn" {
  description = "ARN of the uploads S3 bucket"
  value       = ""  # Placeholder — replace with aws_s3_bucket.uploads.arn when resources are added
}

output "frontend_bucket_name" {
  description = "Name of the frontend static assets bucket"
  value       = ""  # Placeholder — replace with aws_s3_bucket.frontend.id when resources are added
}

output "frontend_bucket_arn" {
  description = "ARN of the frontend static assets bucket"
  value       = ""  # Placeholder — replace with aws_s3_bucket.frontend.arn when resources are added
}

output "frontend_bucket_domain" {
  description = "Domain name of the frontend bucket"
  value       = ""  # Placeholder — replace with aws_s3_bucket.frontend.bucket_domain_name when resources are added
}

output "logs_bucket_name" {
  description = "Name of the CloudFront logs bucket"
  value       = ""  # Placeholder — replace with aws_s3_bucket.logs.id when resources are added
}

output "logs_bucket_arn" {
  description = "ARN of the CloudFront logs bucket"
  value       = ""  # Placeholder — replace with aws_s3_bucket.logs.arn when resources are added
}

output "logs_bucket_domain" {
  description = "Domain name of the logs bucket"
  value       = ""  # Placeholder — replace with aws_s3_bucket.logs.bucket_domain_name when resources are added
}

output "cloudfront_oai_iam_arn" {
  description = "IAM ARN for CloudFront origin access identity"
  value       = ""  # Placeholder — replace with aws_cloudfront_origin_access_identity.frontend.iam_arn when resources are added
}

output "cloudfront_oai_id" {
  description = "ID of the CloudFront origin access identity"
  value       = ""  # Placeholder — replace with aws_cloudfront_origin_access_identity.frontend.id when resources are added
}
