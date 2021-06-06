# Ansible
This directory allows you to configure your server for the single instance with `ansible-playbook` command.

## Inventory file
Inventory file with the name `inventory` allows you to define servers with which ansible will communicate to.

In our case it needs to have the following line `ip_address`, where **ip_address** is the elastic ip address assigned by AWS.

## Configuration file
Ansible configuration file with the name `ansible.cfg` allows you to define ansible configuration settings.

We will need to define the defaults which will be the inventory file it is reading from and also the private key file.

```
[defaults]
remote_user = ansible
inventory = inventory
private_key_file = ~/.ssh/ansible
```

To verify that ansible configuration is working and is able to connect to the server run the `ansible` command with the `ping` module. 

```
ansible all -m ping
```

## Running ansible playbook
**Note:** Make sure you generate ssh key on server for deployment with the name ansible and copy/paste generate public key to your github account. Also for POSTGRES_PASSWORD environment variable in vars you will need to set password.

Run ansible playbooks with the following order
```
ansible-playbook docker.yml
ansible-playbook elasticsearch-container.yml
ansible-playbook kibana-container.yml
ansible-playbook pipeline-runner.yml
```

Before you run postgres-container, make sure you have set the postgres username, password, aws secret and access key in the [/roles/deploy/vars/main.yml](https://github.com/athegaul/seqr/blob/master/infrastructure/ansible/roles/deploy/vars/main.yml) file

```
ansible-playbook postgres-container.yml
ansible-playbook startup-script.yml
ansible-playbook node.yml
ansible-playbook deploy.yml --tags migration
ansible-playbook deploy.yml --tags deploy
ansible-playbook node-startup.yml
ansible-playbook seqr-startup.yml
```

Once seqr-startup is completed you will have to create admin user. Connect to the server, navigate to seqr repository and run the following command:
```
python manage.py createsuperuser
```

From here you can follow [local install](https://github.com/broadinstitute/seqr/blob/master/deploy/LOCAL_INSTALL.md) guide for pipeline-runner.