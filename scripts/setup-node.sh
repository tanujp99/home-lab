#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

# Configuration
NODE_TYPE=$1
NODE_IP=$2
CONTROL_PLANE_IP=$3

if [ -z "$NODE_TYPE" ] || [ -z "$NODE_IP" ]; then
    echo -e "${RED}Usage: $0 <node-type> <node-ip> [control-plane-ip]${NC}"
    echo "Example: $0 control 192.168.1.101"
    echo "Example: $0 worker 192.168.1.102 192.168.1.101"
    exit 1
fi

echo -e "${YELLOW}Starting node setup...${NC}"

# Update system
echo -e "${GREEN}Updating system...${NC}"
apt update && apt upgrade -y

# Install required packages
echo -e "${GREEN}Installing required packages...${NC}"
apt install -y apt-transport-https ca-certificates curl software-properties-common

# Install Docker
echo -e "${GREEN}Installing Docker...${NC}"
curl -fsSL https://get.docker.com | sh

# Install Kubernetes components
echo -e "${GREEN}Installing Kubernetes components...${NC}"
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | tee /etc/apt/sources.list.d/kubernetes.list
apt update

if [ "$NODE_TYPE" = "control" ]; then
    # Control plane setup
    echo -e "${GREEN}Setting up control plane node...${NC}"
    apt install -y kubelet kubeadm kubectl

    # Initialize Kubernetes cluster
    echo -e "${GREEN}Initializing Kubernetes cluster...${NC}"
    kubeadm init --pod-network-cidr=10.244.0.0/16 --apiserver-advertise-address=$NODE_IP

    # Configure kubectl
    echo -e "${GREEN}Configuring kubectl...${NC}"
    mkdir -p $HOME/.kube
    cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
    chown $(id -u):$(id -g) $HOME/.kube/config

    # Install Calico network plugin
    echo -e "${GREEN}Installing Calico network plugin...${NC}"
    kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.26.1/manifests/calico.yaml

    # Setup NFS server
    echo -e "${GREEN}Setting up NFS server...${NC}"
    apt install -y nfs-kernel-server
    mkdir -p /mnt/nfs_share
    chown nobody:nogroup /mnt/nfs_share
    chmod 777 /mnt/nfs_share
    echo "/mnt/nfs_share *(rw,sync,no_subtree_check,no_root_squash)" | tee /etc/exports
    exportfs -a
    systemctl restart nfs-kernel-server

    # Print join command
    echo -e "${YELLOW}Use the following command to join worker nodes:${NC}"
    kubeadm token create --print-join-command

else
    # Worker node setup
    echo -e "${GREEN}Setting up worker node...${NC}"
    apt install -y kubelet kubeadm

    # Install NFS client
    echo -e "${GREEN}Installing NFS client...${NC}"
    apt install -y nfs-common
    mkdir -p /mnt/nfs_share
    echo "$CONTROL_PLANE_IP:/mnt/nfs_share /mnt/nfs_share nfs defaults 0 0" | tee -a /etc/fstab
    mount -a
fi

# Configure DNS
echo -e "${GREEN}Configuring DNS...${NC}"
cat >> /etc/hosts << EOF
$CONTROL_PLANE_IP weather.home-lab.local
$CONTROL_PLANE_IP smart.home-lab.local
$CONTROL_PLANE_IP media.home-lab.local
$CONTROL_PLANE_IP grafana.home-lab.local
$CONTROL_PLANE_IP rabbitmq.home-lab.local
EOF

echo -e "${GREEN}Node setup completed successfully!${NC}"

if [ "$NODE_TYPE" = "control" ]; then
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Copy the join command shown above"
    echo "2. Run it on each worker node"
    echo "3. Verify cluster status with: kubectl get nodes"
fi 