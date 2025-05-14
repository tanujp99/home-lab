#!/bin/bash

# Function to encode string to base64
encode_base64() {
    echo -n "$1" | base64
}

# Read secrets from environment or prompt
read -p "Enter OpenWeather API Key: " OPENWEATHER_API_KEY
read -p "Enter Home Assistant Token: " HOME_ASSISTANT_TOKEN
read -p "Enter PostgreSQL URL: " POSTGRES_URL
read -p "Enter Grafana Admin Password: " GRAFANA_ADMIN_PASSWORD
read -p "Enter RabbitMQ Username: " RABBITMQ_USERNAME
read -p "Enter RabbitMQ Password: " RABBITMQ_PASSWORD
read -p "Enter PostgreSQL Username: " POSTGRES_USERNAME
read -p "Enter PostgreSQL Password: " POSTGRES_PASSWORD
read -p "Enter PostgreSQL Database: " POSTGRES_DB

# Encode secrets
OPENWEATHER_API_KEY_BASE64=$(encode_base64 "$OPENWEATHER_API_KEY")
HOME_ASSISTANT_TOKEN_BASE64=$(encode_base64 "$HOME_ASSISTANT_TOKEN")
POSTGRES_URL_BASE64=$(encode_base64 "$POSTGRES_URL")
GRAFANA_ADMIN_PASSWORD_BASE64=$(encode_base64 "$GRAFANA_ADMIN_PASSWORD")
RABBITMQ_USERNAME_BASE64=$(encode_base64 "$RABBITMQ_USERNAME")
RABBITMQ_PASSWORD_BASE64=$(encode_base64 "$RABBITMQ_PASSWORD")
POSTGRES_USERNAME_BASE64=$(encode_base64 "$POSTGRES_USERNAME")
POSTGRES_PASSWORD_BASE64=$(encode_base64 "$POSTGRES_PASSWORD")
POSTGRES_DB_BASE64=$(encode_base64 "$POSTGRES_DB")

# Create temporary file with secrets
cat > k8s/secrets/secrets.tmp.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: weather-api-secrets
  namespace: home-lab
type: Opaque
data:
  api-key: ${OPENWEATHER_API_KEY_BASE64}
---
apiVersion: v1
kind: Secret
metadata:
  name: smart-home-secrets
  namespace: home-lab
type: Opaque
data:
  token: ${HOME_ASSISTANT_TOKEN_BASE64}
---
apiVersion: v1
kind: Secret
metadata:
  name: media-server-secrets
  namespace: home-lab
type: Opaque
data:
  postgres-url: ${POSTGRES_URL_BASE64}
---
apiVersion: v1
kind: Secret
metadata:
  name: grafana-secrets
  namespace: home-lab
type: Opaque
data:
  admin-password: ${GRAFANA_ADMIN_PASSWORD_BASE64}
---
apiVersion: v1
kind: Secret
metadata:
  name: rabbitmq-secrets
  namespace: home-lab
type: Opaque
data:
  username: ${RABBITMQ_USERNAME_BASE64}
  password: ${RABBITMQ_PASSWORD_BASE64}
---
apiVersion: v1
kind: Secret
metadata:
  name: postgresql-secrets
  namespace: home-lab
type: Opaque
data:
  username: ${POSTGRES_USERNAME_BASE64}
  password: ${POSTGRES_PASSWORD_BASE64}
  database: ${POSTGRES_DB_BASE64}
EOF

# Apply secrets
kubectl apply -f k8s/secrets/secrets.tmp.yaml

# Clean up
rm k8s/secrets/secrets.tmp.yaml 