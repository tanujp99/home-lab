#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting Home Lab deployment...${NC}"

# Create namespace
echo -e "${GREEN}Creating namespace...${NC}"
kubectl apply -f k8s/base/namespace.yaml

# Apply storage class
echo -e "${GREEN}Applying storage class...${NC}"
kubectl apply -f k8s/base/storage-class.yaml

# Apply network policies
echo -e "${GREEN}Applying network policies...${NC}"
kubectl apply -f k8s/base/network-policy.yaml

# Apply configmaps
echo -e "${GREEN}Applying configmaps...${NC}"
kubectl apply -f k8s/configmaps/configmaps.yaml

# Apply secrets
echo -e "${GREEN}Setting up secrets...${NC}"
./scripts/setup-secrets.sh

# Deploy dependencies
echo -e "${GREEN}Deploying dependencies...${NC}"
kubectl apply -f k8s/dependencies/redis.yaml
kubectl apply -f k8s/dependencies/rabbitmq.yaml
kubectl apply -f k8s/dependencies/postgresql.yaml

# Wait for dependencies to be ready
echo -e "${YELLOW}Waiting for dependencies to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/redis -n home-lab
kubectl wait --for=condition=available --timeout=300s deployment/rabbitmq -n home-lab
kubectl wait --for=condition=available --timeout=300s deployment/postgresql -n home-lab

# Deploy monitoring stack
echo -e "${GREEN}Deploying monitoring stack...${NC}"
kubectl apply -f k8s/monitoring/prometheus.yaml
kubectl apply -f k8s/monitoring/grafana.yaml

# Wait for monitoring stack to be ready
echo -e "${YELLOW}Waiting for monitoring stack to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n home-lab
kubectl wait --for=condition=available --timeout=300s deployment/grafana -n home-lab

# Deploy applications
echo -e "${GREEN}Deploying applications...${NC}"
kubectl apply -f k8s/apps/weather-dashboard.yaml
kubectl apply -f k8s/apps/smart-home.yaml
kubectl apply -f k8s/apps/media-server.yaml

# Wait for applications to be ready
echo -e "${YELLOW}Waiting for applications to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/weather-dashboard -n home-lab
kubectl wait --for=condition=available --timeout=300s deployment/smart-home -n home-lab
kubectl wait --for=condition=available --timeout=300s deployment/media-server -n home-lab

# Apply ingress
echo -e "${GREEN}Applying ingress configuration...${NC}"
kubectl apply -f k8s/ingress.yaml

# Print access information
echo -e "${GREEN}Deployment completed! Access your applications at:${NC}"
echo -e "Weather Dashboard: https://weather.home-lab.local"
echo -e "Smart Home: https://smart.home-lab.local"
echo -e "Media Server: https://media.home-lab.local"
echo -e "Grafana: https://grafana.home-lab.local"
echo -e "RabbitMQ Management: https://rabbitmq.home-lab.local"

# Print pod status
echo -e "\n${YELLOW}Pod Status:${NC}"
kubectl get pods -n home-lab 