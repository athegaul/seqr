# Infrastructure
The infrastructure as of right now is based around one EC2 instance.

## Terraform
Verson of terraform: v.0.14.6

Make sure that you have inside your ~/.aws/credentials file the following block:
```
[dev]
aws_access_key_id =
aws_secret_access_key =
regions = us_east-1
```

## Ansible
To install ansible you can do one of the following:
1. `pip3 install ansible`
2. `brew install ansible`


## SSH to machine
In order to run `ansible-playbook` from your machine to the server, you need to set up the ssh key. Navigate to the home directory and run the following commands:

1. `ssh-keygen -t ed25519 -C "ansible"`
    **Note**: name your file ansible, don't forget that it needs to have a full path and don't include a passphrase
2. Inside AWS Console connect to your instance with the EC2 Instance Connect
3. Create ansible user and store password in Secrets maanger
   ```
   sudo adduser ansible
   sudo usermod -aG sudo ansible
   ```
4. Navigate to the ansible home directory
5. Create .ssh directory with the authorized_keys file
   ```
   sudo mkdir .ssh
   cd .ssh
   sudo touch authorized_keys
   ```
6. Copy ansible.pub key from your machine and add it to the authorized_keys file
7. Inside `/etc/ssh/sshd_config` change `PasswordAuthentication yes` and `ChallengeResponseAuthentication yes`
8. Restart the sshd service `sudo service sshd restart`
9. Inside /etc/sudoers.d directory create `sudoers_ansible` file with the following content
   `ansible ALL=(ALL) NOPASSWD: ALL`
   With this we want to make sure that ansible user will have sudo privileges
10. At the end of the `/etc/ssh/sshd_config` file add the following line
    `AllowUsers ansible`
11. Restart the sshd service again `sudo service sshd restart`
12. Store the ansible private key in Secrets Manager as base64 encoded `base64 ansible > encoded_ansible_private_key`
    When you want to decode the private key use `base64 -d encoded_ansible_private_key`
    **Note**: make sure when you copy and paste the encoded value into a file to press return key (new line) on every space that you see