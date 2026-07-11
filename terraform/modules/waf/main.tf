# =============================================================================
# WAF Module (Optional)
# =============================================================================
# PURPOSE:  AWS WAF web ACL to protect ALB and CloudFront from common web
#           exploits (SQL injection, XSS, rate limiting, IP reputation).
#           Disabled by default. Enable via enable_waf = true.
# DEPENDS:  ALB (alb_arn), CloudFront (distribution_arn)
# OUTPUTS:  waf_acl_arn, waf_acl_id
# =============================================================================
# Resources will be added in a subsequent step.
# =============================================================================
