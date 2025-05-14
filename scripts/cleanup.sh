#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting cleanup of Home Lab deployment...${NC}"

# Delete ingress
echo -e "${RED}Deleting ingress...${NC}"
kubectl delete -f k8s/ingress.yaml --ignore-not-found

# Delete applications
echo -e "${RED}Deleting applications...${NC}"
kubectl delete -f k8s/apps/weather-dashboard.yaml --ignore-not-found
kubectl delete -f k8s/apps/smart-home.yaml --ignore-not-found
kubectl delete -f k8s/apps/media-server.yaml --ignore-not-found

# Delete monitoring stack
echo -e "${RED}Deleting monitoring stack...${NC}"
kubectl delete -f k8s/monitoring/prometheus.yaml --ignore-not-found
kubectl delete -f k8s/monitoring/grafana.yaml --ignore-not-found

# Delete configmaps
echo -e "${RED}Deleting configmaps...${NC}"
kubectl delete -f k8s/configmaps/configmaps.yaml --ignore-not-found

# Delete secrets
echo -e "${RED}Deleting secrets...${NC}"
kubectl delete -f k8s/secrets/secrets.yaml --ignore-not-found

# Delete network policies
echo -e "${RED}Deleting network policies...${NC}"
kubectl delete -f k8s/base/network-policy.yaml --ignore-not-found

# Delete namespace
echo -e "${RED}Deleting namespace...${NC}"
kubectl delete namespace home-lab --ignore-not-found

echo -e "${GREEN}Cleanup completed!${NC}" 