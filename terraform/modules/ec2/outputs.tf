output "instance_id" {
  description = "ID of the standalone EC2 instance"
  value       = aws_instance.main.id
}

output "instance_public_ip" {
  description = "Public IP of the standalone EC2 instance"
  value       = try(aws_eip.main[0].public_ip, aws_instance.main.public_ip)
}

output "backend_security_group_id" {
  description = "Security group ID for EC2 instances"
  value       = aws_security_group.ec2.id
}

output "frontend_security_group_id" {
  description = "Security group ID for EC2 instances (alias — same SG for both backend and frontend)"
  value       = aws_security_group.ec2.id
}

output "launch_template_id" {
  description = "Launch template ID"
  value       = aws_launch_template.main.id
}

output "launch_template_latest_version" {
  description = "Latest version of the launch template"
  value       = aws_launch_template.main.latest_version
}

output "backend_asg_name" {
  description = "Backend Auto Scaling Group name"
  value       = ""  # Placeholder — will be populated when ASG is added
}

output "frontend_asg_name" {
  description = "Frontend Auto Scaling Group name"
  value       = ""  # Placeholder — will be populated when ASG is added
}
