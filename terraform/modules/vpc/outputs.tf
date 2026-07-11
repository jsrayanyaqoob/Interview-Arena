output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "vpc_flow_log_group" {
  description = "CloudWatch log group for VPC flow logs"
  value       = null  # Placeholder — will be populated when flow logs are created
}

output "nat_eip_ids" {
  description = "Elastic IP IDs for NAT gateways"
  value       = []  # Placeholder — will be populated when NAT gateways are created
}
