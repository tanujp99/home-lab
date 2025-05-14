#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create backup directories
mkdir -p $BACKUP_DIR/postgresql
mkdir -p $BACKUP_DIR/pvc-snapshots
mkdir -p $BACKUP_DIR/secrets

echo -e "${YELLOW}Starting backup process...${NC}"

# Backup PostgreSQL
echo -e "${GREEN}Backing up PostgreSQL...${NC}"
kubectl exec -n home-lab deploy/postgresql -- \
  pg_dump -U $POSTGRES_USER $POSTGRES_DB > \
  $BACKUP_DIR/postgresql/postgresql_$TIMESTAMP.sql

# Compress PostgreSQL backup
gzip $BACKUP_DIR/postgresql/postgresql_$TIMESTAMP.sql

# Backup PVCs
echo -e "${GREEN}Creating PVC snapshots...${NC}"
for pvc in $(kubectl get pvc -n home-lab -o jsonpath='{.items[*].metadata.name}'); do
  echo "Creating snapshot for PVC: $pvc"
  kubectl create -f - <<EOF
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: ${pvc}-snapshot-${TIMESTAMP}
  namespace: home-lab
spec:
  source:
    persistentVolumeClaimName: ${pvc}
EOF
done

# Backup secrets
echo -e "${GREEN}Backing up secrets...${NC}"
kubectl get secrets -n home-lab -o yaml > $BACKUP_DIR/secrets/secrets_$TIMESTAMP.yaml

# Cleanup old backups
echo -e "${YELLOW}Cleaning up old backups...${NC}"

# Cleanup old PostgreSQL backups
find $BACKUP_DIR/postgresql -name "postgresql_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Cleanup old PVC snapshots
for snapshot in $(kubectl get volumesnapshot -n home-lab -o jsonpath='{.items[*].metadata.name}'); do
  snapshot_age=$(kubectl get volumesnapshot $snapshot -n home-lab -o jsonpath='{.metadata.creationTimestamp}')
  if [ $(date -d "$snapshot_age" +%s) -lt $(date -d "$RETENTION_DAYS days ago" +%s) ]; then
    kubectl delete volumesnapshot $snapshot -n home-lab
  fi
done

# Cleanup old secret backups
find $BACKUP_DIR/secrets -name "secrets_*.yaml" -mtime +$RETENTION_DAYS -delete

echo -e "${GREEN}Backup completed successfully!${NC}"
echo -e "Backup location: $BACKUP_DIR"
echo -e "Timestamp: $TIMESTAMP"

# Print backup summary
echo -e "\n${YELLOW}Backup Summary:${NC}"
echo "PostgreSQL backup: $BACKUP_DIR/postgresql/postgresql_$TIMESTAMP.sql.gz"
echo "PVC snapshots: Created for all PVCs"
echo "Secrets backup: $BACKUP_DIR/secrets/secrets_$TIMESTAMP.yaml" 