packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "region" {
  default = "us-east-1"
}

source "amazon-ebs" "app" {
  ami_name      = "interviewarena-ami-{{timestamp}}"
  instance_type = "t3.micro"
  region        = var.region

  source_ami_filter {
    filters = {
      name                = "al2023-ami-*-x86_64"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    owners      = ["137112412989"] # Amazon's official AMI owner ID
    most_recent = true
  }

  ssh_username = "ec2-user"

  # No VPC/subnet specified = Packer uses default VPC's public subnet automatically
}

build {
  name    = "app-build"
  sources = ["source.amazon-ebs.app"]

  provisioner "shell" {
    inline = [
      "sudo yum update -y",
      "sudo yum install -y nginx",
      "sudo systemctl enable nginx",
      "echo '<h1>Hello from Packer-built AMI</h1>' | sudo tee /usr/share/nginx/html/index.html"
    ]
  }

  post-processor "manifest" {
    output = "packer-manifest.json"
  }
}