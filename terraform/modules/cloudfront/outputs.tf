output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = ""  # Placeholder — replace with aws_cloudfront_distribution.main.domain_name when resources are added
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for cache invalidation)"
  value       = ""  # Placeholder — replace with aws_cloudfront_distribution.main.id when resources are added
}

output "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = ""  # Placeholder — replace with aws_cloudfront_distribution.main.arn when resources are added
}

output "cloudfront_hosted_zone_id" {
  description = "CloudFront hosted zone ID (for Route53 alias records)"
  value       = ""  # Placeholder — replace with aws_cloudfront_distribution.main.hosted_zone_id when resources are added
}
