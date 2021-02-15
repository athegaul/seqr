resource "aws_instance" "seqr" {
    ami           = data.aws_ami.seqr.id
    instance_type = "m5.2xlarge"

    root_block_device {
        volume_type           = "standard"
        volume_size           = var.volume_size
        delete_on_termination = true
    }

    vpc_security_group_ids = [
        aws_security_group.seqr-sg.id
    ]

    tags = {
        Environment = var.environment
        Name        = "${var.environment}-seqr"
    }
}

resource "aws_eip" "seqr" {
  vpc      = true
  instance = aws_instance.seqr.id
}

data "aws_ami" "seqr" {
    most_recent = true

    filter {
        name   = "name"
        values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
    }

    filter {
        name   = "virtualization-type"
        values = ["hvm"]
    }

    owners = ["099720109477"] # Canonical
}

resource "aws_security_group" "seqr-sg" {
    name        = "seqr security group"
    description = "Allow SSH, HTTPS and HTTP traffic"

    ingress {
        description = "SSH"
        from_port   = 22
        to_port     = 22
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        description = "HTTPS"
        from_port   = 443
        to_port     = 443
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        description = "HTTP"
        from_port   = 80
        to_port     = 80
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
}
