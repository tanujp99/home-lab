# Home Lab

A practical, production-ready home lab environment that demonstrates real-world Kubernetes deployment and management skills. This project showcases the implementation of a modern, containerized application stack with proper monitoring, security, and CI/CD practices.

## Project Overview

This home lab project implements a practical microservices architecture using Kubernetes, focusing on real-world scenarios and best practices. The project includes:

- A modern web application with a React frontend and Node.js backend
- Real-time data processing using public APIs
- Comprehensive monitoring and logging
- Automated CI/CD pipeline
- Security best practices implementation

## Architecture

### Infrastructure
- **Kubernetes Cluster**: 3-node cluster (1 control plane, 2 workers)
- **Network**: Calico CNI for network policies and security
- **Storage**: Local persistent storage with proper backup strategies
- **Monitoring**: Prometheus + Grafana for metrics and visualization
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

### Application Stack
- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Cache**: Redis
- **Message Queue**: RabbitMQ

## Key Features

### 1. Real-time Weather Dashboard
- Integrates with OpenWeatherMap API
- Displays weather data for multiple locations
- Implements caching for API responses
- Shows historical weather trends

### 2. Smart Home Integration
- Connects with Home Assistant API
- Controls and monitors smart devices
- Implements secure authentication
- Provides real-time device status

### 3. Media Management
- Personal media server capabilities
- Automatic metadata fetching
- Content organization and streaming
- Backup and synchronization features

## Technical Implementation

### Security
- Network policies using Calico
- TLS encryption for all services
- Role-based access control (RBAC)
- Regular security updates and patches

### Monitoring
- Resource usage tracking
- Application performance monitoring
- Alert system for critical events
- Custom Grafana dashboards

### CI/CD Pipeline
- GitLab CI/CD integration
- Automated testing
- Blue-green deployments
- Rollback capabilities

## Getting Started

### Prerequisites
- 3x HP Spectre SFF PCs (or similar hardware)
- Ubuntu 20.04 LTS
- Minimum 8GB RAM per node
- 256GB SSD per node
- Stable network connection

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/home-lab.git
cd home-lab
```

2. Set up the Kubernetes cluster:
```bash
./scripts/setup-cluster.sh
```

3. Deploy the base infrastructure:
```bash
kubectl apply -f k8s/base/
```

4. Deploy the applications:
```bash
kubectl apply -f k8s/apps/
```

5. Access the dashboard:
```bash
kubectl port-forward svc/dashboard 8080:80
```

## Project Structure

```
home-lab/
├── k8s/                    # Kubernetes manifests
│   ├── base/              # Base infrastructure
│   ├── apps/              # Application deployments
│   └── monitoring/        # Monitoring stack
├── apps/                  # Application source code
│   ├── frontend/         # React frontend
│   ├── backend/          # Node.js backend
│   └── services/         # Microservices
├── scripts/              # Automation scripts
├── docs/                 # Documentation
└── terraform/            # Infrastructure as Code
```

## Development Workflow

1. **Local Development**
   - Use minikube for local testing
   - Implement features in feature branches
   - Write tests for new functionality

2. **CI/CD Process**
   - Push to feature branch
   - Automated tests run
   - Code review process
   - Merge to main branch
   - Automated deployment

3. **Monitoring and Maintenance**
   - Regular health checks
   - Performance monitoring
   - Security updates
   - Backup verification

## Acknowledgments

- [Kubernetes](https://kubernetes.io/)
- [Calico](https://www.tigera.io/project-calico/)
- [Prometheus](https://prometheus.io/)
- [Grafana](https://grafana.com/)
- [Home Assistant](https://www.home-assistant.io/)