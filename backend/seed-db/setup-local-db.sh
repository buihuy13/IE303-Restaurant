#!/bin/bash
# setup-local-db.sh - Create local databases for testing
# This script creates the necessary databases in your local PostgreSQL

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)

cd "$REPO_ROOT"

# Load environment variables
set -a
source .env 2>/dev/null || true
set +a

# Database connection settings
LOCAL_DB_HOST="${LOCAL_DB_HOST:-localhost}"
LOCAL_DB_PORT="${LOCAL_DB_PORT:-5432}"
LOCAL_DB_USER="${LOCAL_DB_USER:-postgres}"
LOCAL_DB_PASSWORD="${LOCAL_DB_PASSWORD:-1}"

export PGPASSWORD="$LOCAL_DB_PASSWORD"

echo "=========================================="
echo "Setting up local databases"
echo "=========================================="
echo "Host: $LOCAL_DB_HOST:$LOCAL_DB_PORT"
echo "User: $LOCAL_DB_USER"
echo ""

# Check if PostgreSQL is running
echo "Checking PostgreSQL connection..."
if ! pg_isready -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" >/dev/null 2>&1; then
    echo "❌ Cannot connect to PostgreSQL at $LOCAL_DB_HOST:$LOCAL_DB_PORT"
    echo "Please ensure PostgreSQL is running and accessible."
    exit 1
fi
echo "✓ PostgreSQL is running"

# Databases to create
declare -a databases=(
    "user_service"
    "catalog_service"
    "restaurant_service"
    "product_service"
    "review_service"
    "query_service"
)

# Create databases
echo ""
echo "Creating databases..."
for db in "${databases[@]}"; do
    if psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$db"; then
        echo "  ✓ $db already exists"
    else
        createdb -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" "$db" && echo "  ✓ Created $db" || echo "  ❌ Failed to create $db"
    fi
done

echo ""
echo "=========================================="
echo "Database setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Run the seed script:"
echo "   cd backend/seed-db"
echo "   ./seed-local.sh"
echo ""
echo "2. Or set your environment variables when running services:"
echo "   export SPRING_DATASOURCE_URL=jdbc:postgresql://$LOCAL_DB_HOST:$LOCAL_DB_PORT/<database_name>"
echo "   export SPRING_DATASOURCE_USERNAME=$LOCAL_DB_USER"
echo "   export SPRING_DATASOURCE_PASSWORD=$LOCAL_DB_PASSWORD"
