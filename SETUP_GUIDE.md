# Home Lab Kubernetes Cluster Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Script Setup](#script-setup)
3. [Node Setup](#node-setup)
4. [Network Configuration](#network-configuration)
5. [Kubernetes Installation](#kubernetes-installation)
6. [Storage Setup](#storage-setup)
7. [Application Deployment](#application-deployment)
8. [Monitoring Setup](#monitoring-setup)
9. [Security Configuration](#security-configuration)
10. [Verification](#verification)

## Prerequisites

### Hardware Requirements
- 9 Nodes (Minimum specifications per node):
  - CPU: 4 cores
  - RAM: 8GB
  - Storage: 100GB SSD
  - Network: 1Gbps

### Software Requirements
- Ubuntu 22.04 LTS
- Docker 24.0+
- Kubernetes 1.28+
- Helm 3.12+
- NFS Server (for storage)

### Required Accounts and API Keys
1. **OpenWeather API**
   - Sign up at: https://openweathermap.org/api
   - Get API key from dashboard
   - Free tier: 60 calls/minute

2. **Home Assistant**
   - Install Home Assistant
   - Generate long-lived access token:
     - Profile → Long-Lived Access Tokens
   - Note down token

3. **PostgreSQL**
   - Default credentials (change in production):
     - Username: postgres
     - Password: (generate secure password)
     - Database: homelab

4. **RabbitMQ**
   - Default credentials (change in production):
     - Username: admin
     - Password: (generate secure password)

5. **Grafana**
   - Default credentials (change in production):
     - Username: admin
     - Password: (generate secure password)

## Script Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd home-lab-kubernetes
```

### 2. Make Scripts Executable
```bash
# Make all scripts executable
chmod +x scripts/*.sh

# Verify permissions
ls -l scripts/
```

Expected output:
```
-rwxr-xr-x 1 user user setup-node.sh
-rwxr-xr-x 1 user user setup-secrets.sh
-rwxr-xr-x 1 user user deploy.sh
-rwxr-xr-x 1 user user backup.sh
-rwxr-xr-x 1 user user restore.sh
```

### 3. Verify Script Locations
```bash
# Check script contents
head -n 1 scripts/*.sh

# Expected output should show shebang line for each script:
# #!/bin/bash
```

### 4. Test Script Execution
```bash
# Test script execution (should show usage)
./scripts/setup-node.sh

# Expected output:
# Usage: ./setup-node.sh <node-type> <node-ip> [control-plane-ip]
# Example: ./setup-node.sh control 192.168.1.101
# Example: ./setup-node.sh worker 192.168.1.102 192.168.1.101
```

## Node Setup

### 1. Control Plane Node (Node 1)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install kubeadm, kubelet, kubectl
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt update
sudo apt install -y kubelet kubeadm kubectl

# Initialize Kubernetes cluster
sudo kubeadm init --pod-network-cidr=10.244.0.0/16 --apiserver-advertise-address=<NODE1_IP>

# Configure kubectl
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Install Calico network plugin
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.26.1/manifests/calico.yaml
```

### 2. Worker Nodes (Nodes 2-9)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install kubeadm, kubelet
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt update
sudo apt install -y kubelet kubeadm

# Join cluster (run command from control plane node)
sudo kubeadm join <CONTROL_PLANE_IP>:6443 --token <TOKEN> --discovery-token-ca-cert-hash <HASH>
```

## Network Configuration

### Node IP Addresses
```
Node 1 (Control Plane): 192.168.1.101
Node 2 (Worker): 192.168.1.102
Node 3 (Worker): 192.168.1.103
Node 4 (Worker): 192.168.1.104
Node 5 (Worker): 192.168.1.105
Node 6 (Worker): 192.168.1.106
Node 7 (Worker): 192.168.1.107
Node 8 (Worker): 192.168.1.108
Node 9 (Worker): 192.168.1.109
```

### DNS Configuration
Add to `/etc/hosts` on all nodes:
```
192.168.1.101 weather.home-lab.local
192.168.1.101 smart.home-lab.local
192.168.1.101 media.home-lab.local
192.168.1.101 grafana.home-lab.local
192.168.1.101 rabbitmq.home-lab.local
```

## Storage Setup

### NFS Server Setup (on Node 1)
```bash
# Install NFS server
sudo apt install -y nfs-kernel-server

# Create shared directory
sudo mkdir -p /mnt/nfs_share
sudo chown nobody:nogroup /mnt/nfs_share
sudo chmod 777 /mnt/nfs_share

# Configure NFS exports
echo "/mnt/nfs_share *(rw,sync,no_subtree_check,no_root_squash)" | sudo tee /etc/exports
sudo exportfs -a
sudo systemctl restart nfs-kernel-server
```

### NFS Client Setup (on all nodes)
```bash
# Install NFS client
sudo apt install -y nfs-common

# Create mount point
sudo mkdir -p /mnt/nfs_share

# Mount NFS share
echo "192.168.1.101:/mnt/nfs_share /mnt/nfs_share nfs defaults 0 0" | sudo tee -a /etc/fstab
sudo mount -a
```

## Application Deployment

### 1. Create Namespace
```bash
kubectl apply -f k8s/base/namespace.yaml
```

### 2. Setup Secrets
```bash
# Run setup-secrets.sh
./scripts/setup-secrets.sh

# Enter the following when prompted:
# OpenWeather API Key: <your-api-key>
# Home Assistant Token: <your-token>
# PostgreSQL URL: postgresql://postgres:<password>@postgresql:5432/homelab
# Grafana Admin Password: <your-password>
# RabbitMQ Username: admin
# RabbitMQ Password: <your-password>
# PostgreSQL Username: postgres
# PostgreSQL Password: <your-password>
# PostgreSQL Database: homelab
```

### 3. Deploy Dependencies
```bash
# Deploy storage class
kubectl apply -f k8s/base/storage-class.yaml

# Deploy Redis
kubectl apply -f k8s/dependencies/redis.yaml

# Deploy RabbitMQ
kubectl apply -f k8s/dependencies/rabbitmq.yaml

# Deploy PostgreSQL
kubectl apply -f k8s/dependencies/postgresql.yaml
```

### 4. Deploy Applications
```bash
# Deploy Weather Dashboard
kubectl apply -f k8s/apps/weather-dashboard.yaml

# Deploy Smart Home
kubectl apply -f k8s/apps/smart-home.yaml

# Deploy Media Server
kubectl apply -f k8s/apps/media-server.yaml
```

## Monitoring Setup

### 1. Deploy Prometheus
```bash
# Add Prometheus Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace home-lab \
  --set grafana.adminPassword='<your-grafana-password>'
```

### 2. Configure Grafana
1. Access Grafana at `https://grafana.home-lab.local`
2. Login with:
   - Username: admin
   - Password: <your-grafana-password>
3. Import dashboards:
   - Node Exporter Full
   - Kubernetes Cluster
   - Application Metrics

## Security Configuration

### 1. Network Policies
```bash
# Apply network policies
kubectl apply -f k8s/base/network-policy.yaml
```

### 2. RBAC Configuration
```bash
# Create service accounts
kubectl apply -f k8s/base/rbac.yaml
```

### 3. Security Context
```bash
# Apply security contexts
kubectl apply -f k8s/base/security-context.yaml
```

## Verification

### 1. Check Cluster Status
```bash
# Check nodes
kubectl get nodes

# Check pods
kubectl get pods -n home-lab

# Check services
kubectl get svc -n home-lab
```

### 2. Test Applications
1. Weather Dashboard:
   - Access: https://weather.home-lab.local
   - Verify weather data display

2. Smart Home:
   - Access: https://smart.home-lab.local
   - Verify Home Assistant integration

3. Media Server:
   - Access: https://media.home-lab.local
   - Verify content streaming

4. Monitoring:
   - Access: https://grafana.home-lab.local
   - Verify metrics collection

### 3. Backup Verification
```bash
# Run backup
./scripts/backup.sh

# Verify backup files
ls -l /backups/
```

## Maintenance

### Regular Tasks
1. Weekly:
   - Check system updates
   - Verify backups
   - Review logs

2. Monthly:
   - Rotate secrets
   - Update applications
   - Review access permissions

3. Quarterly:
   - Security audit
   - Performance review
   - Capacity planning

### Troubleshooting
1. Check pod logs:
   ```bash
   kubectl logs -n home-lab <pod-name>
   ```

2. Check pod events:
   ```bash
   kubectl describe pod -n home-lab <pod-name>
   ```

3. Check service status:
   ```bash
   kubectl get svc -n home-lab
   ```

4. Check persistent volumes:
   ```bash
   kubectl get pvc -n home-lab
   ```

## Support and Resources

### Documentation
- Kubernetes: https://kubernetes.io/docs/
- Prometheus: https://prometheus.io/docs/
- Grafana: https://grafana.com/docs/
- Home Assistant: https://www.home-assistant.io/docs/

### Community Support
- Kubernetes Slack: kubernetes.slack.com
- Home Assistant Forum: community.home-assistant.io
- Grafana Community: community.grafana.com 