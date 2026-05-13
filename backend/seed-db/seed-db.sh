#!/bin/bash
set -e

# Tạo tất cả databases
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE user_service;
    CREATE DATABASE blog_service;
    CREATE DATABASE chat_service;
    CREATE DATABASE payment_service;
    CREATE DATABASE restaurant_service;
    CREATE DATABASE product_service;
    CREATE DATABASE catalog_service;
    CREATE DATABASE review_service;
    CREATE DATABASE query_service;
    CREATE DATABASE auth_service;
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

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="product_service" \
    -f /docker-entrypoint-initdb.d/product_service.sql

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="catalog_service" \
    -f /docker-entrypoint-initdb.d/catalog_service.sql

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="catalog_service" \
    -f /docker-entrypoint-initdb.d/catalog_service_data.sql

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="review_service" \
    -f /docker-entrypoint-initdb.d/review_service.sql

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="query_service" \
    -f /docker-entrypoint-initdb.d/query_service.sql