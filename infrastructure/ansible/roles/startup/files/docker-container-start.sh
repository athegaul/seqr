#!/bin/sh

sudo docker container start elasticsearch
sudo docker container start kibana
sudo docker container start pipeline-runner
sudo docker container start redis
sudo docker container start postgres
