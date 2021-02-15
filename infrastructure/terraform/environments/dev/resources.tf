provider "aws" {
    region                  = var.region
    profile                 = var.environment
    shared_credentials_file = "~/.aws/creds"
}