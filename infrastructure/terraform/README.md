# Creating Infrastructure - AWS

Prerequisites:

1. Install Terraform https://www.terraform.io/downloads.html 
2. From the security credentials on AWS create an access key and store it in the ~/.aws/credentials file with the following format:

```
[dev]
aws_access_key_id = 
aws_secret_access_key = 
regions = us-east-1

[prod]
aws_access_key_id = 
aws_secret_access_key = 
regions = us-east-1
```

**Note:** dev and prod will have same credentials

After installing Terraform and creating credentials file it is time to create infrastructure on AWS. 

## Terraform state management

- Navigate into infrastructure/terraform/prerequisites/prod directory
- Open remotestate.tf file and comment terraform block section

![remotestate.tf](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/ce0e6973-5015-49f7-a9be-d9b6f34824bf/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210523%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210523T091402Z&X-Amz-Expires=86400&X-Amz-Signature=7d188144b59b1e65f7656acb06c065c053b390b1f8368148aa6bd2c632c6b687&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22)
- Run terraform init to initialize directory and if everything is okay you should see the following output

![output 1](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/ca981bb1-e8bd-4cc2-b579-500aa1f1a396/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210523%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210523T091542Z&X-Amz-Expires=86400&X-Amz-Signature=4da850189838af0fed7a3790cb784af2657864265f67d5eafb3bdaa10bf621ba&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22)
- After that, you have to run terraform apply where you will see the following output

![output 2](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/f2b5dfe4-fd07-47ef-ad20-033fb566d7dd/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210523%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210523T091703Z&X-Amz-Expires=86400&X-Amz-Signature=cf1941950e28ad537005fcacfe6caa03dd9803c87c88bf12bd9599c121605c17&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22)
- You will be prompted to type yes so that program can continue. It will create an S3 bucket in order to manage remote vs local state and a DynamoDB table that has configuration set to only 1 read and 1 write = only one person can manage remote state at a time

![output 3](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/166b430f-bd2f-47e6-85cc-a5d8c2523299/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210523%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210523T091725Z&X-Amz-Expires=86400&X-Amz-Signature=893b298235efec1e74ba7db8164d698ee6ed61a9ba6a0b2c51ff798a5ef349c1&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22)
- Once apply finishes, remove commented terraform block, initialize terraform with terraform init. You will be prompted with the following message

![output 4](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/98f483a3-9103-4a58-8e8a-6ee024bf653c/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210523%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210523T091850Z&X-Amz-Expires=86400&X-Amz-Signature=da7fdeab15227c47e243ee3b7d50d9adf50c70d1a113acfa873ac42c474bf5a4&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22)

Type no since we don't have any state yet.

![output 5](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/7f77a534-d1e7-4b7a-b815-d529a375949d/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210523%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210523T091922Z&X-Amz-Expires=86400&X-Amz-Signature=fdee13bc1c77640c242652e00138ddf034c1d5e3786ddbfbdc636a233df53a5e&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22)

Now you are ready to manage infrastructure with the remote state using Terraform.

## Creating EC2 Instance

After setting up Terraform state it is time to create infrastructure for seqr.

- Navigate infrastructure/terraform/environments/prod
- Run terraform init to get new state
- Run terraform apply to apply changes to the AWS where EC2 instance with the configuration that is defined in the seqr.resoruce.tf file = EC2 Instance (m5.2xlarge), root volume with 1TB (change if you need more), security groups for allowing access from the outside of AWS and a public IP address to the instance
- After apply gets to the prompt it should show only 3 resources that are going to be created

![output 6](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/88cbd739-c30a-4a70-ab65-94043a31dd38/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210523%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210523T092124Z&X-Amz-Expires=86400&X-Amz-Signature=d38b00aa717939381d63ed88a0ab8179a0f20891db3fe8803069e5142523524e&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22)

After apply gets to the prompt it should show only 3 resources that are going to be created
