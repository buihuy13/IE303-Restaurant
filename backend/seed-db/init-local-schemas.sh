#!/bin/bash
# init-local-schemas.sh - Initialize database schemas for local testing
# This script creates tables using the SQL schema files

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
echo "Initializing Database Schemas"
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

# Function to execute SQL file on database
execute_sql_file() {
    local db_name=$1
    local sql_file=$2

    if [ -f "$sql_file" ]; then
        echo "  → Executing $sql_file on $db_name..."
        psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$db_name" -f "$sql_file" >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "  ✓ Success"
        else
            echo "  ⚠️  Failed (may already exist)"
        fi
    else
        echo "  ⚠️  File not found: $sql_file"
    fi
}

# Initialize user_service
echo ""
echo "Initializing user_service..."
execute_sql_file "user_service" "$SCRIPT_DIR/user_service.sql"

# Initialize catalog_service
echo ""
echo "Initializing catalog_service..."
execute_sql_file "catalog_service" "$SCRIPT_DIR/catalog_service.sql"
execute_sql_file "catalog_service" "$SCRIPT_DIR/catalog_service_data.sql"

# Initialize restaurant_service
echo ""
echo "Initializing restaurant_service..."
execute_sql_file "restaurant_service" "$SCRIPT_DIR/restaurant_service.sql"

# Initialize product_service
echo ""
echo "Initializing product_service..."
execute_sql_file "product_service" "$SCRIPT_DIR/product_service.sql"

# Initialize review_service
echo ""
echo "Initializing review_service..."
execute_sql_file "review_service" "$SCRIPT_DIR/review_service.sql"

# Initialize query_service
echo ""
echo "Initializing query_service..."
execute_sql_file "query_service" "$SCRIPT_DIR/query_service.sql"

echo ""
echo "=========================================="
echo "Schema initialization complete!"
echo "=========================================="
echo ""
echo "Next step: Run the seed script to populate data:"
echo "  cd backend/seed-db"
echo "  ./seed-local.sh"
