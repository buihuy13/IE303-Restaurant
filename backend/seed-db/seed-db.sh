#!/bin/bash
set -e

# Tạo tất cả databases
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE user_service;
    CREATE DATABASE blog_service;
    CREATE DATABASE chat_service;
    CREATE DATABASE payment_service;
    CREATE DATABASE restaurant_service;
EOSQL

# Chạy từng file SQL vào đúng database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="user_service" \
    -f /docker-entrypoint-initdb.d/user_service.sql

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="blog_service" \
    -f /docker-entrypoint-initdb.d/blog_service.sql

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="chat_service" \
    -f /docker-entrypoint-initdb.d/chat_service.sql

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="payment_service" \
    -f /docker-entrypoint-initdb.d/payment_service.sql

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="restaurant_service" \
    -f /docker-entrypoint-initdb.d/restaurant_service.sql
