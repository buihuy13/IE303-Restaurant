#!/bin/bash

command=$1

if [ "$command" = "up" ]; then
  docker compose -f docker-compose.dev.yml up -d
  echo "Waiting for Keycloak to be ready..."
  until curl -s "http://localhost:9090/health/ready" | grep -q "UP"; do
    echo "Keycloak not ready yet, retrying in 3s"
    sleep 3
  done

  echo "Waiting for realm to be ready..."
  until curl -s "http://localhost:9090/realms/restaurant-realm" | grep -q "restaurant-realm"; do
    echo "Realm not ready yet, retrying in 3s..."
    sleep 3
  done

  echo "Running role management script"
  bash ./keycloak-config/role-management.sh
elif [ "$command" = "down" ]; then
  docker compose -f docker-compose.dev.yml down -v
else
  echo "Usage: $0 {up|down}"
  exit 1
fi