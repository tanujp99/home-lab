# Home Lab Operations Guide

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Security Implementation](#security-implementation)
3. [Monitoring & Alerting](#monitoring--alerting)
4. [Backup & Recovery](#backup--recovery)
5. [Troubleshooting](#troubleshooting)

## System Architecture

### Overview
The Home Lab Kubernetes cluster is designed as a multi-application platform with the following components:

```
┌─────────────────────────────────────────────────────────┐
│                     Kubernetes Cluster                   │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │  Weather    │    │  Smart      │    │   Media     │  │
│  │  Dashboard  │    │   Home      │    │   Server    │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │  Redis      │    │  RabbitMQ   │    │ PostgreSQL  │  │
│  │  Cache      │    │  Message Q  │    │  Database   │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐                    │
│  │ Prometheus  │    │   Grafana   │                    │
│  │ Monitoring  │    │  Dashboard  │                    │
│  └─────────────┘    └─────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

### Component Details

#### Applications
- **Weather Dashboard**: Real-time weather monitoring
- **Smart Home**: Home automation integration
- **Media Server**: Content streaming and management

#### Infrastructure
- **Redis**: Caching layer
- **RabbitMQ**: Message queuing
- **PostgreSQL**: Persistent data storage
- **Prometheus**: Metrics collection
- **Grafana**: Visualization and alerting

## Security Implementation

### Network Security

#### Network Policies
```yaml
# Example Network Policy
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: app-isolation
  namespace: home-lab
spec:
  podSelector:
    matchLabels:
      app: weather-dashboard
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
```

#### Security Context
```yaml
# Example Security Context
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  runAsGroup: 3000
  fsGroup: 2000
  capabilities:
    drop:
    - ALL
```

### Secret Management
- All sensitive data stored in Kubernetes secrets
- Secrets encrypted at rest
- Access controlled via RBAC
- Regular secret rotation

### Access Control
- RBAC policies for each component
- Service accounts with minimal required permissions
- Regular access review and audit

## Monitoring & Alerting

### Prometheus Configuration

#### Custom Metrics
```yaml
# Example Prometheus Rule
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: app-alerts
  namespace: home-lab
spec:
  groups:
  - name: app.rules
    rules:
    - alert: HighErrorRate
      expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: High error rate detected
```

### Grafana Dashboards

#### Application Dashboard
- Request rates
- Error rates
- Response times
- Resource utilization

#### Infrastructure Dashboard
- Node metrics
- Pod metrics
- Storage metrics
- Network metrics

### Alerting Rules
1. **Critical Alerts**
   - Service down
   - High error rate
   - Resource exhaustion

2. **Warning Alerts**
   - High latency
   - Memory pressure
   - Disk space low

## Backup & Recovery

### Automated Backup Strategy

#### Database Backups
```bash
#!/bin/bash
# Example backup script
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgresql"

# Backup PostgreSQL
kubectl exec -n home-lab deploy/postgresql -- \
  pg_dump -U $POSTGRES_USER $POSTGRES_DB > \
  $BACKUP_DIR/postgresql_$TIMESTAMP.sql

# Compress backup
gzip $BACKUP_DIR/postgresql_$TIMESTAMP.sql

# Retain last 7 days of backups
find $BACKUP_DIR -name "postgresql_*.sql.gz" -mtime +7 -delete
```

#### Persistent Volume Backups
- Daily snapshots of PVCs
- Retention policy: 7 days
- Automated cleanup

### Recovery Procedures

1. **Database Recovery**
   ```bash
   # Restore PostgreSQL backup
   kubectl exec -n home-lab deploy/postgresql -- \
     psql -U $POSTGRES_USER $POSTGRES_DB < \
     $BACKUP_DIR/postgresql_$TIMESTAMP.sql
   ```

2. **Volume Recovery**
   - Restore from snapshots
   - Point-in-time recovery
   - Data consistency checks

## Troubleshooting

### Common Issues

1. **Pod Startup Issues**
   ```bash
   # Check pod logs
   kubectl logs -n home-lab <pod-name>
   
   # Check pod events
   kubectl describe pod -n home-lab <pod-name>
   ```

2. **Network Issues**
   ```bash
   # Check network policies
   kubectl get networkpolicy -n home-lab
   
   # Test connectivity
   kubectl exec -n home-lab <pod-name> -- curl <service-name>
   ```

3. **Storage Issues**
   ```bash
   # Check PVC status
   kubectl get pvc -n home-lab
   
   # Check storage class
   kubectl get storageclass
   ```

### Health Checks

1. **Application Health**
   ```bash
   # Check all pods
   kubectl get pods -n home-lab
   
   # Check services
   kubectl get svc -n home-lab
   ```

2. **Infrastructure Health**
   ```bash
   # Check nodes
   kubectl get nodes
   
   # Check events
   kubectl get events -n home-lab
   ```

### Maintenance Procedures

1. **Regular Maintenance**
   - Weekly security updates
   - Monthly backup verification
   - Quarterly access review

2. **Emergency Procedures**
   - Service recovery
   - Data restoration
   - Incident response

## Best Practices

1. **Security**
   - Regular security audits
   - Secret rotation
   - Access control review

2. **Monitoring**
   - Dashboard review
   - Alert threshold tuning
   - Metric collection optimization

3. **Backup**
   - Regular backup testing
   - Recovery drills
   - Retention policy review

4. **Documentation**
   - Keep runbooks updated
   - Document all changes
   - Maintain incident reports 