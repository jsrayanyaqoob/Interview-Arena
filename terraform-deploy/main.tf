terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

variable "ami_id" {
  description = "ami-0fc17d97b67068516"
  type        = string
}

# Reference your EXISTING launch template (doesn't create a new one)
data "aws_launch_template" "interviewarena" {
  name = "interviewarena-launch-template"
}

# Create a new version of the launch template with the new AMI
resource "aws_launch_template" "interviewarena_new_version" {
  name_prefix = "interviewarena-launch-template"
  image_id    = var.ami_id

  # Reuse settings from the existing template
  instance_type = data.aws_launch_template.interviewarena.instance_type

  lifecycle {
    create_before_destroy = true
  }
}

# Reference your EXISTING ASG
data "aws_autoscaling_group" "interviewarena" {
  name = "interviewarena-asg"
}

# Trigger an instance refresh whenever the AMI changes
resource "null_resource" "instance_refresh" {
  triggers = {
    ami_id = var.ami_id
  }

  provisioner "local-exec" {
    command = <<-EOT
      aws autoscaling start-instance-refresh \
        --auto-scaling-group-name interviewarena-asg \
        --preferences '{"MinHealthyPercentage": 50, "InstanceWarmup": 60}'
    EOT
  }
}