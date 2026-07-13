terraform {
  required_version = ">= 1.5"
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
  type = string
}

data "aws_launch_template" "app" {
  name = "interviewname-launch-template"
}

resource "null_resource" "deploy" {
  triggers = {
    ami_id = var.ami_id
  }

  provisioner "local-exec" {
    interpreter = ["PowerShell", "-Command"]
    command = <<-EOT
      $NEW_VERSION = aws ec2 create-launch-template-version --launch-template-id ${data.aws_launch_template.app.id} --source-version ${data.aws_launch_template.app.latest_version} --launch-template-data '{\"ImageId\":\"${var.ami_id}\"}' --query "LaunchTemplateVersion.VersionNumber" --output text

      aws ec2 modify-launch-template --launch-template-id ${data.aws_launch_template.app.id} --default-version $NEW_VERSION

      aws autoscaling start-instance-refresh --auto-scaling-group-name interviewarena-asg --preferences MinHealthyPercentage=50,InstanceWarmup=90
    EOT
  }
}