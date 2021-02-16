# Ansible
This directory allows you to configure your server for the single instance with `ansible-playbook` command.

# Inventory file
Inventory file with the name `inventory` allows you to define servers with which ansible will communicate to.

In our case it needs to have the following line `ip_address`, where **ip_address** is the elastic ip address assigned by AWS.

# Configuration file
Ansible configuration file with the name `ansible.cfg` allows you to define ansible configuration settings.

We will need to define the defaults which will be the inventory file it is reading from and also the private key file.

```
[defaults]
remote_user = ansible
inventory = inventory
private_key_file = ~/.ssh/ansible
```

To verify that ansible configuration is working and is able to connect to the server run the `ansible` command with the `ping` module `ansible all -m ping`.