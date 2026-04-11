#!/usr/bin/env bash
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$ROOT_DIR/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "FAILED: .env file not found at $ENV_FILE"
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "FAILED: curl is required"
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "FAILED: jq is required"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

KEYCLOAK_BASE_URL="${NEXT_PUBLIC_KEYCLOAK_BASE_URL:-http://localhost:9090/auth}"
KEYCLOAK_REALM_NAME="${KEYCLOAK_REALM:-${NEXT_PUBLIC_KEYCLOAK_REALM:-restaurant-realm}}"
GATEWAY_BASE_URL="${GATEWAY_URL:-http://localhost:8080}"
GATEWAY_BASE_URL="${GATEWAY_BASE_URL%/}"
CLIENT_ID="${DASHBOARD_TEST_CLIENT_ID:-restaurant-frontend}"

ADMIN_USERNAME="${DASHBOARD_ADMIN_USERNAME:-admin_manager}"
MERCHANT_USERNAME="${DASHBOARD_MERCHANT_USERNAME:-merchant}"
ADMIN_PASSWORD_VALUE="${ADMIN_PASSWORD:-}"
MERCHANT_PASSWORD_VALUE="${MERCHANT_PASSWORD:-}"

if [[ -z "$ADMIN_PASSWORD_VALUE" || -z "$MERCHANT_PASSWORD_VALUE" ]]; then
  echo "FAILED: ADMIN_PASSWORD and MERCHANT_PASSWORD must be set in .env"
  exit 1
fi

SUCCESS_COUNT=0
FAILED_COUNT=0

request_token() {
  local username="$1"
  local password="$2"

  curl -sS -X POST "$KEYCLOAK_BASE_URL/realms/$KEYCLOAK_REALM_NAME/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "grant_type=password" \
    --data-urlencode "client_id=$CLIENT_ID" \
    --data-urlencode "username=$username" \
    --data-urlencode "password=$password" \
    | jq -r '.access_token // empty'
}

call_api() {
  local label="$1"
  local token="$2"
  local url="$3"

  local body_file
  body_file="$(mktemp)"

  local status
  status="$(curl -sS -o "$body_file" -w "%{http_code}" "$url" -H "Authorization: Bearer $token" -H "Accept: application/json")"

  if [[ "$status" == "200" ]]; then
    echo "SUCCESS [$status] $label"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    local body
    body="$(cat "$body_file")"
    echo "FAILED  [$status] $label"
    if [[ -n "$body" ]]; then
      echo "  Response: $body"
    fi
    FAILED_COUNT=$((FAILED_COUNT + 1))
  fi

  rm -f "$body_file"
}

extract_json_field() {
  local token="$1"
  local url="$2"
  local jq_expression="$3"

  curl -sS "$url" \
    -H "Authorization: Bearer $token" \
    -H "Accept: application/json" \
    | jq -r "$jq_expression"
}

echo "Requesting admin token..."
ADMIN_TOKEN="$(request_token "$ADMIN_USERNAME" "$ADMIN_PASSWORD_VALUE")"
if [[ -z "$ADMIN_TOKEN" ]]; then
  echo "FAILED: cannot obtain admin access token"
  exit 1
fi

echo "Requesting merchant token..."
MERCHANT_TOKEN="$(request_token "$MERCHANT_USERNAME" "$MERCHANT_PASSWORD_VALUE")"
if [[ -z "$MERCHANT_TOKEN" ]]; then
  echo "FAILED: cannot obtain merchant access token"
  exit 1
fi

TODAY_UTC="$(date -u +%F)"

echo "Running admin dashboard checks..."
call_api "Admin overview" "$ADMIN_TOKEN" "$GATEWAY_BASE_URL/api/dashboard/overview"
call_api "Admin revenue (week)" "$ADMIN_TOKEN" "$GATEWAY_BASE_URL/api/dashboard/revenue?period=week"
call_api "Admin revenue compare (week)" "$ADMIN_TOKEN" "$GATEWAY_BASE_URL/api/dashboard/revenue/compare?period=week"
call_api "Admin order status (week)" "$ADMIN_TOKEN" "$GATEWAY_BASE_URL/api/dashboard/orders/status?period=week"
call_api "Admin hourly orders" "$ADMIN_TOKEN" "$GATEWAY_BASE_URL/api/dashboard/orders/hourly?date=$TODAY_UTC"
call_api "Admin recent orders" "$ADMIN_TOKEN" "$GATEWAY_BASE_URL/api/dashboard/orders/recent?limit=5"
call_api "Admin top products" "$ADMIN_TOKEN" "$GATEWAY_BASE_URL/api/dashboard/top-products?period=week&limit=5"
call_api "Admin revenue by restaurant" "$ADMIN_TOKEN" "$GATEWAY_BASE_URL/api/dashboard/revenue/by-restaurant?period=week&limit=10"
call_api "Admin user stats overview" "$ADMIN_TOKEN" "$GATEWAY_BASE_URL/api/users/admin/stats/overview"
call_api "Admin restaurant stats" "$ADMIN_TOKEN" "$GATEWAY_BASE_URL/api/restaurant/admin/stats"

FALLBACK_RESTAURANT_ID="$(extract_json_field "$ADMIN_TOKEN" "$GATEWAY_BASE_URL/api/dashboard/orders/recent?limit=1" '.[0].restaurantId // empty')"
if [[ -z "$FALLBACK_RESTAURANT_ID" ]]; then
  FALLBACK_RESTAURANT_ID="$(extract_json_field "$ADMIN_TOKEN" "$GATEWAY_BASE_URL/api/dashboard/revenue/by-restaurant?period=week&limit=1" '.items[0].restaurantId // empty')"
fi

echo "Resolving merchant restaurant id..."
MERCHANT_ID="$(extract_json_field "$MERCHANT_TOKEN" "$GATEWAY_BASE_URL/api/users/accesstoken" '.id // .userId // empty')"
MERCHANT_TEST_TOKEN="$MERCHANT_TOKEN"
if [[ -z "$MERCHANT_ID" ]]; then
  echo "FAILED: cannot resolve merchant id from /api/users/accesstoken"
  FAILED_COUNT=$((FAILED_COUNT + 1))
else
  RESTAURANT_ID="$(extract_json_field "$MERCHANT_TOKEN" "$GATEWAY_BASE_URL/api/restaurant/merchant/$MERCHANT_ID" '.id // empty')"
  if [[ -z "$RESTAURANT_ID" ]]; then
    if [[ -n "$FALLBACK_RESTAURANT_ID" ]]; then
      RESTAURANT_ID="$FALLBACK_RESTAURANT_ID"
      MERCHANT_TEST_TOKEN="$ADMIN_TOKEN"
      echo "WARN: merchant $MERCHANT_ID has no restaurant mapping, fallback to admin token with restaurant $RESTAURANT_ID"
    else
      RESTAURANT_ID="00000000-0000-0000-0000-000000000001"
      MERCHANT_TEST_TOKEN="$ADMIN_TOKEN"
      echo "WARN: cannot resolve restaurant id for merchant $MERCHANT_ID, using synthetic restaurantId $RESTAURANT_ID for API contract checks"
    fi
  fi
fi

if [[ -n "${RESTAURANT_ID:-}" ]]; then
  echo "Running merchant dashboard checks for restaurant $RESTAURANT_ID..."
  call_api "Merchant overview" "$MERCHANT_TEST_TOKEN" "$GATEWAY_BASE_URL/api/merchant/dashboard/overview?restaurantId=$RESTAURANT_ID"
  call_api "Merchant revenue (week)" "$MERCHANT_TEST_TOKEN" "$GATEWAY_BASE_URL/api/merchant/dashboard/revenue?restaurantId=$RESTAURANT_ID&period=week"
  call_api "Merchant order status (week)" "$MERCHANT_TEST_TOKEN" "$GATEWAY_BASE_URL/api/merchant/dashboard/orders/status?restaurantId=$RESTAURANT_ID&period=week"
  call_api "Merchant live orders" "$MERCHANT_TEST_TOKEN" "$GATEWAY_BASE_URL/api/merchant/dashboard/orders/live?restaurantId=$RESTAURANT_ID"
  call_api "Merchant top products" "$MERCHANT_TEST_TOKEN" "$GATEWAY_BASE_URL/api/merchant/dashboard/top-products?restaurantId=$RESTAURANT_ID&period=week&limit=5"
fi

echo "----------------------------------------"
echo "SUCCESS: $SUCCESS_COUNT"
echo "FAILED : $FAILED_COUNT"

if [[ "$FAILED_COUNT" -eq 0 ]]; then
  echo "Dashboard API smoke test completed successfully"
  exit 0
fi

echo "Dashboard API smoke test completed with failures"
exit 1
