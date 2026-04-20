-- Run against the default `postgres` database once:
--   psql -U postgres -d postgres -f scripts/create-database.sql
SELECT 'CREATE DATABASE payment_service'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'payment_service')\gexec
