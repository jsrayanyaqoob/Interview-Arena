# =============================================================================
# CloudFront CDN Module
# =============================================================================
# PURPOSE:  CDN distribution with dual origin:
#           - ALB origin for SSR frontend + API (default)
#           - S3 origin for static assets (_next/static/*, /static/*)
#           Viewer uses HTTPS via CloudFront's default cert or custom ACM.
# DEPENDS:  ALB (alb_dns_name), S3 (bucket domain, OAI), ACM (certificate)
# OUTPUTS:  cloudfront_domain_name, cloudfront_distribution_id
# =============================================================================
# Resources will be added in a subsequent step.
# =============================================================================
