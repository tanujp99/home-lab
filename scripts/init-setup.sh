#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Starting initial setup...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

# Create required directories
echo -e "${GREEN}Creating required directories...${NC}"
mkdir -p /backups/postgresql
mkdir -p /backups/pvc-snapshots
mkdir -p /backups/secrets
mkdir -p /mnt/nfs_share

# Set directory permissions
echo -e "${GREEN}Setting directory permissions...${NC}"
chmod 755 /backups
chmod 755 /backups/postgresql
chmod 755 /backups/pvc-snapshots
chmod 755 /backups/secrets
chmod 777 /mnt/nfs_share

# Make scripts executable
echo -e "${GREEN}Making scripts executable...${NC}"
chmod +x scripts/*.sh

# Verify script permissions
echo -e "${GREEN}Verifying script permissions...${NC}"
ls -l scripts/

# Create required users and groups
echo -e "${GREEN}Creating required users and groups...${NC}"
groupadd -f kubernetes
useradd -g kubernetes -m -s /bin/bash kubernetes || true

# Set up sudo access for kubernetes user
echo -e "${GREEN}Setting up sudo access...${NC}"
echo "kubernetes ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/kubernetes
chmod 440 /etc/sudoers.d/kubernetes

# Create .kube directory for kubernetes user
echo -e "${GREEN}Setting up .kube directory...${NC}"
mkdir -p /home/kubernetes/.kube
chown -R kubernetes:kubernetes /home/kubernetes/.kube
chmod 700 /home/kubernetes/.kube

# Set up log directory
echo -e "${GREEN}Setting up log directory...${NC}"
mkdir -p /var/log/kubernetes
chown -R kubernetes:kubernetes /var/log/kubernetes
chmod 755 /var/log/kubernetes

# Create systemd service directory
echo -e "${GREEN}Setting up systemd service directory...${NC}"
mkdir -p /etc/systemd/system/kubernetes.service.d
chmod 755 /etc/systemd/system/kubernetes.service.d

# Set up backup cron job
echo -e "${GREEN}Setting up backup cron job...${NC}"
(crontab -l 2>/dev/null; echo "0 2 * * * /scripts/backup.sh") | crontab -

# Verify setup
echo -e "${GREEN}Verifying setup...${NC}"
echo "Checking script permissions:"
ls -l scripts/
echo "Checking directory permissions:"
ls -ld /backups /backups/* /mnt/nfs_share
echo "Checking user setup:"
id kubernetes
echo "Checking cron jobs:"
crontab -l

echo -e "${GREEN}Initial setup completed successfully!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the permissions and verify they are correct"
echo "2. Proceed with node setup using setup-node.sh"
echo "3. Configure your applications and secrets" 