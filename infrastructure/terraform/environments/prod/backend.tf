terraform {
  backend "s3" {
    key            = "prod.state"
    region         = "us-east-1"
    profile        = "prod"
    dynamodb_table = "prod-seqr-terraform-statelock"
    bucket         = "prod-seqr-terraform"
  }
}
