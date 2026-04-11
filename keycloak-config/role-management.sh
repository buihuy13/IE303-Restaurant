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

KEYCLOAK_URL="http://localhost:9090/auth"
ADMIN_USER="${KEYCLOAK_ADMIN}"
ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD}"
REALM="restaurant-realm"
CLIENT_ID="${BACKEND_CLIENT_ID}"
FORWARDED_PROTO_HEADER="X-Forwarded-Proto: https"

require_value() {
  local value="$1"
  local name="$2"

  if [ -z "$value" ] || [ "$value" = "null" ]; then
    echo "Failed to resolve $name"
    exit 1
  fi
}

#Lấy admin token
ADMIN_TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "$FORWARDED_PROTO_HEADER" \
  -d "grant_type=password&client_id=admin-cli&username=$ADMIN_USER&password=$ADMIN_PASSWORD" \
  | jq -r '.access_token')

require_value "$ADMIN_TOKEN" "admin token"
echo "Got admin token"

#Lấy ID của client my-backend-service
CLIENT_UUID=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/clients?clientId=$CLIENT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "$FORWARDED_PROTO_HEADER" \
  | jq -r '.[0].id')

require_value "$CLIENT_UUID" "client UUID"
echo "Client UUID: $CLIENT_UUID"

#Lấy service account user ID
SA_USER_ID=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/clients/$CLIENT_UUID/service-account-user" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "$FORWARDED_PROTO_HEADER" \
  | jq -r '.id')

require_value "$SA_USER_ID" "service account user ID"
echo "Service Account User ID: $SA_USER_ID"

#Lấy ID của realm-management client
RM_CLIENT_UUID=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/clients?clientId=realm-management" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "$FORWARDED_PROTO_HEADER" \
  | jq -r '.[0].id')

require_value "$RM_CLIENT_UUID" "realm-management UUID"
echo "realm-management UUID: $RM_CLIENT_UUID"

#Lấy role IDs cần assign
ROLES_JSON=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/clients/$RM_CLIENT_UUID/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "$FORWARDED_PROTO_HEADER" \
  | jq '[.[] | select(.name == "manage-users" or .name == "view-users" or .name == "view-realm")]')

require_value "$ROLES_JSON" "roles JSON"
if [ "$ROLES_JSON" = "[]" ]; then
  echo "No roles found to assign"
  exit 1
fi

echo "Roles to assign: $ROLES_JSON"

#Assign roles cho service account
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/users/$SA_USER_ID/role-mappings/clients/$RM_CLIENT_UUID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "$FORWARDED_PROTO_HEADER" \
  -d "$ROLES_JSON"

echo "Roles assigned successfully."
