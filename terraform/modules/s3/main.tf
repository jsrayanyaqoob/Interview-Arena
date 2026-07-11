# =============================================================================
# S3 Module
# =============================================================================
# PURPOSE:  Creates S3 buckets for file uploads, frontend static assets,
#           and CloudFront access logs. Configures CloudFront OAI for the
#           frontend bucket.
# DEPENDS:  Nothing (but outputs consumed by CloudFront)
# OUTPUTS:  uploads_bucket_name, frontend_bucket_domain, logs_bucket_domain,
#           cloudfront_oai_iam_arn
# =============================================================================
# Resources will be added in a subsequent step.
# =============================================================================
