# =============================================================================
# ACM Certificate Module
# =============================================================================
# PURPOSE:  Request and validate ACM certificates for the custom domain.
#           Uses DNS validation via Route53. Only created when domain_name
#           is provided (conditional via count in main.tf).
# DEPENDS:  Route53 hosted zone
# OUTPUTS:  certificate_arn, certificate_domain
# =============================================================================
# Resources will be added in a subsequent step.
# =============================================================================
