#!/bin/bash

command=$1

if [ "$command" = "up" ]; then
  docker compose -f docker-compose.dev.yml up -d
elif [ "$command" = "down" ]; then
  docker compose -f docker-compose.dev.yml down -v
else
  echo "Usage: $0 {up|down}"
  exit 1
fi