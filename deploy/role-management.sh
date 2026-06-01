#!/bin/bash

# Auto-install jq nếu chưa có
if ! command -v jq &> /dev/null; then
  echo "jq not found, installing..."
  
  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo apt-get install -y jq
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v brew &> /dev/null; then
      brew install jq
    else
      echo "Cannot install jq: brew not found. Install brew first: https://brew.sh"
      exit 1
    fi
  else
    echo "Cannot install jq: unsupported OS"
    exit 1
  fi
  
  echo "jq installed successfully"
fi

# Load file .env
set -a
source "$(dirname "$0")/../.env"
set +a

KEYCLOAK_URL="http://20.205.208.223/auth"
ADMIN_USER="${KEYCLOAK_ADMIN}"
ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD}"
REALM="restaurant-realm"
CLIENT_ID="${BACKEND_CLIENT_ID}"

#Lấy admin token
ADMIN_TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=admin-cli&username=$ADMIN_USER&password=$ADMIN_PASSWORD" \
  | jq -r '.access_token')

echo "Got admin token"
echo $ADMIN_TOKEN

#Lấy ID của client my-backend-service
CLIENT_UUID=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/clients?clientId=$CLIENT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | jq -r '.[0].id')

echo "Client UUID: $CLIENT_UUID"

#Lấy service account user ID
SA_USER_ID=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/clients/$CLIENT_UUID/service-account-user" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | jq -r '.id')

echo "Service Account User ID: $SA_USER_ID"

#Lấy ID của realm-management client
RM_CLIENT_UUID=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/clients?clientId=realm-management" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | jq -r '.[0].id')

echo "realm-management UUID: $RM_CLIENT_UUID"

#Lấy role IDs cần assign
ROLES_JSON=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/clients/$RM_CLIENT_UUID/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | jq '[.[] | select(.name == "manage-users" or .name == "view-users" or .name == "view-realm")]')

echo "Roles to assign: $ROLES_JSON"

#Assign roles cho service account
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/users/$SA_USER_ID/role-mappings/clients/$RM_CLIENT_UUID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$ROLES_JSON"

echo "Roles assigned successfully."