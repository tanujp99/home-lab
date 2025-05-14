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
RESTORE_TIMESTAMP=$1

if [ -z "$RESTORE_TIMESTAMP" ]; then
    echo -e "${RED}Error: Please provide a backup timestamp${NC}"
    echo "Usage: $0 <timestamp>"
    echo "Example: $0 20240315_123456"
    exit 1
fi

echo -e "${YELLOW}Starting restore process...${NC}"

# Verify backup files exist
if [ ! -f "$BACKUP_DIR/postgresql/postgresql_$RESTORE_TIMESTAMP.sql.gz" ]; then
    echo -e "${RED}Error: PostgreSQL backup not found${NC}"
    exit 1
fi

if [ ! -f "$BACKUP_DIR/secrets/secrets_$RESTORE_TIMESTAMP.yaml" ]; then
    echo -e "${RED}Error: Secrets backup not found${NC}"
    exit 1
fi

# Restore PostgreSQL
echo -e "${GREEN}Restoring PostgreSQL...${NC}"
gunzip -c $BACKUP_DIR/postgresql/postgresql_$RESTORE_TIMESTAMP.sql.gz | \
    kubectl exec -i -n home-lab deploy/postgresql -- psql -U $POSTGRES_USER $POSTGRES_DB

# Restore PVCs from snapshots
echo -e "${GREEN}Restoring PVCs from snapshots...${NC}"
for snapshot in $(kubectl get volumesnapshot -n home-lab -o jsonpath='{.items[*].metadata.name}' | grep $RESTORE_TIMESTAMP); do
    pvc_name=$(echo $snapshot | sed "s/-snapshot-$RESTORE_TIMESTAMP//")
    echo "Restoring PVC: $pvc_name from snapshot: $snapshot"
    
    # Create restore PVC
    kubectl create -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${pvc_name}-restore
  namespace: home-lab
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: $(kubectl get pvc $pvc_name -n home-lab -o jsonpath='{.spec.resources.requests.storage}')
  dataSource:
    name: $snapshot
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
EOF

    # Scale down deployment using the PVC
    deployment=$(kubectl get deployment -n home-lab -o jsonpath='{.items[*].metadata.name}' | grep -E "redis|rabbitmq|postgresql")
    if [ ! -z "$deployment" ]; then
        echo "Scaling down deployment: $deployment"
        kubectl scale deployment $deployment -n home-lab --replicas=0
        
        # Wait for pods to terminate
        echo "Waiting for pods to terminate..."
        kubectl wait --for=delete pod -l app=$deployment -n home-lab --timeout=300s
        
        # Delete original PVC
        echo "Deleting original PVC: $pvc_name"
        kubectl delete pvc $pvc_name -n home-lab
        
        # Rename restored PVC
        echo "Renaming restored PVC"
        kubectl patch pvc ${pvc_name}-restore -n home-lab -p "{\"metadata\":{\"name\":\"$pvc_name\"}}"
        
        # Scale deployment back up
        echo "Scaling deployment back up"
        kubectl scale deployment $deployment -n home-lab --replicas=1
    fi
done

# Restore secrets
echo -e "${GREEN}Restoring secrets...${NC}"
kubectl apply -f $BACKUP_DIR/secrets/secrets_$RESTORE_TIMESTAMP.yaml

echo -e "${GREEN}Restore completed successfully!${NC}"
echo -e "Restored from backup timestamp: $RESTORE_TIMESTAMP"

# Print restore summary
echo -e "\n${YELLOW}Restore Summary:${NC}"
echo "PostgreSQL: Restored from $BACKUP_DIR/postgresql/postgresql_$RESTORE_TIMESTAMP.sql.gz"
echo "PVCs: Restored from snapshots"
echo "Secrets: Restored from $BACKUP_DIR/secrets/secrets_$RESTORE_TIMESTAMP.yaml" 