locals {
  profile = "prod"
  region  = "us-east-1"
}

terraform {
  backend "s3" {
    key            = "this_bucket.state"
    region         = "us-east-1"
    profile        = "prod"
    dynamodb_table = "prod-seqr-terraform-statelock"
    bucket         = "prod-seqr-terraform"
  }

  required_providers {
    aws = {
      version                 = ">= 3.0"
    }
  }
}

provider "aws" {
  region                  = local.region
  profile                 = local.profile
  shared_credentials_file = "~/.aws/credentials"
}


resource "aws_s3_bucket" "terraform_state" {
  bucket = "${local.profile}-seqr-terraform"

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_dynamodb_table" "terraform-statelock" {
  attribute {
    name = "LockID"
    type = "S"
  }

  hash_key       = "LockID"
  name           = "${local.profile}-seqr-terraform-statelock"
  read_capacity  = 1
  write_capacity = 1
}
