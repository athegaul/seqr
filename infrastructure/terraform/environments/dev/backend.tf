terraform {
  backend "s3" {
    key            = "dev.state"
    region         = "us-east-1"
    profile        = "dev"
    dynamodb_table = "dev-seqr-terraform-statelock"
    bucket         = "dev-seqr-terraform"
  }
}
