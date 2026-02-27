#!/bin/bash
set -e

echo "Substituting environment variables in realm config..."

mkdir -p /opt/keycloak/data/import

sed -e "s|SMTP_PASSWORD_PLACEHOLDER|${SMTP_PASSWORD}|g" \
    -e "s|SMTP_FROM_PLACEHOLDER|${SMTP_FROM}|g" \
    -e "s|GOOGLE_CLIENT_ID_PLACEHOLDER|${GOOGLE_CLIENT_ID}|g" \
    -e "s|GOOGLE_CLIENT_SECRET_PLACEHOLDER|${GOOGLE_CLIENT_SECRET}|g" \
    -e "s|FACEBOOK_CLIENT_ID_PLACEHOLDER|${FACEBOOK_CLIENT_ID}|g" \
    -e "s|FACEBOOK_CLIENT_SECRET_PLACEHOLDER|${FACEBOOK_CLIENT_SECRET}|g" \
    -e "s|BACKEND_CLIENT_SECRET_PLACEHOLDER|${BACKEND_CLIENT_SECRET}|g" \
    -e "s|ADMIN_PASSWORD_PLACEHOLDER|${ADMIN_PASSWORD}|g" \
    -e "s|USER_PASSWORD_PLACEHOLDER|${USER_PASSWORD}|g" \
    -e "s|MERCHANT_PASSWORD_PLACEHOLDER|${MERCHANT_PASSWORD}|g" \
    /tmp/realm.json > /opt/keycloak/data/import/realm.json

echo "Building Keycloak"
/opt/keycloak/bin/kc.sh build

echo "Starting Keycloak"
exec /opt/keycloak/bin/kc.sh start \
    --optimized \
    --import-realm \
    --proxy=edge \
    --http-enabled=true \
    --hostname-strict=false