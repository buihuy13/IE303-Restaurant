#!/bin/bash
# sync-query-service.sh
# Sync read models in query_service from source databases
# IMPORTANT: Cannot do cross-database queries in PostgreSQL without FDW
# Solution: Dump from source DB and restore to query_service DB

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)

cd "$REPO_ROOT"

set -a
source "$REPO_ROOT/.env"
set +a

# Determine DB mode (docker or local)
SEED_DB_MODE="${SEED_DB_MODE:-auto}"

if [[ "$SEED_DB_MODE" == "docker" ]] || [[ "$SEED_DB_MODE" == "auto" ]]; then
    if command -v docker >/dev/null 2>&1; then
        DB_MODE="docker"
    else
        DB_MODE="local"
    fi
else
    DB_MODE="$SEED_DB_MODE"
fi

echo "Database mode: $DB_MODE"

PSQL="docker compose exec -T -u postgres postgres psql -U postgres"

# ===================================================================
# Step 1: Sync restaurant_read_model
# ===================================================================
echo "=========================================="
echo "Syncing restaurant_read_model..."
echo "=========================================="

# First, dump data from restaurant_service to temp files
echo "  → Extracting data from restaurant_service..."
$PSQL -d restaurant_service -tA -F "," -c "
    SELECT
        id,
        res_name as name,
        slug,
        address,
        phone,
        image_url,
        enabled,
        opening_time,
        closing_time,
        latitude,
        longitude,
        rating,
        total_review as review_count,
        merchant_id,
        created_at,
        updated_at
    FROM restaurants
    WHERE enabled = true;
" > /tmp/restaurant_data.csv 2>/dev/null || true

# Then load into query_service
echo "  → Loading into query_service..."
$PSQL -d query_service <<'SQL'
-- Clear existing data
TRUNCATE TABLE restaurant_read_model RESTART IDENTITY CASCADE;

-- Create temp table to load CSV data
DROP TABLE IF EXISTS tmp_restaurant_import;
CREATE TEMP TABLE tmp_restaurant_import (
    id UUID,
    name VARCHAR(255),
    slug VARCHAR(255),
    address VARCHAR(500),
    phone VARCHAR(20),
    image_url VARCHAR(500),
    enabled BOOLEAN,
    opening_time TIME,
    closing_time TIME,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    rating DECIMAL(3,2),
    review_count INTEGER,
    merchant_id UUID,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Copy from host file (using pgClient inline data instead)
-- We'll insert directly from values
SQL

# Read the CSV and insert row by row
if [ -s /tmp/restaurant_data.csv ]; then
    echo "  → Inserting restaurant data..."

    # Create a SQL file with all the INSERT statements
    {
        # Read CSV and generate INSERT statements
        while IFS="," read -r id name slug address phone image_url enabled opening_time closing_time latitude longitude rating review_count merchant_id created_at updated_at; do
            # Skip empty lines
            [ -z "$id" ] && continue

            # Escape single quotes
            name=$(echo "$name" | sed "s/'/''/g")
            slug=$(echo "$slug" | sed "s/'/''/g")
            address=$(echo "$address" | sed "s/'/''/g")

            # Generate INSERT
            echo "INSERT INTO restaurant_read_model (id, name, slug, address, phone, image_url, enabled, opening_time, closing_time, latitude, longitude, rating, review_count, merchant_id, created_at, updated_at) VALUES ('$id', '$name', '$slug', '$address', '$phone', $image_url, $enabled, '$opening_time', '$closing_time', $latitude, $longitude, $rating, $review_count, '$merchant_id', '$created_at', '$updated_at') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address, rating = EXCLUDED.rating, review_count = EXCLUDED.review_count, updated_at = EXCLUDED.updated_at;"
        done < /tmp/restaurant_data.csv
    } | $PSQL -d query_service

    # Update geometry
    echo "  → Updating geometry points..."
    $PSQL -d query_service -c "UPDATE restaurant_read_model SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);"

    # Count result
    COUNT=$($PSQL -d query_service -tA -c "SELECT COUNT(*) FROM restaurant_read_model;")
    echo "  ✓ Synced $COUNT restaurants"
else
    echo "  ⚠ No restaurant data found (run seed-all.sh first)"
fi

rm -f /tmp/restaurant_data.csv

# ===================================================================
# Step 2: Sync product_read_model
# ===================================================================
echo ""
echo "=========================================="
echo "Syncing product_read_model..."
echo "=========================================="

# This is more complex - we need to join data from multiple databases
# We'll use a different approach: query each DB and build the view

echo "  → Building product read model from multiple sources..."

# Step 2a: Get all products with their restaurants
echo "  → Extracting product data..."
$PSQL -d product_service -tA -F "," -c "
    SELECT
        p.id,
        p.product_name as name,
        p.slug,
        p.description,
        p.image_url,
        p.available::text,
        p.category_id,
        p.restaurant_id,
        p.rating,
        p.total_review as review_count,
        p.created_at,
        p.updated_at
    FROM products p
    WHERE p.available = true;
" > /tmp/product_base.csv 2>/dev/null || true

# Step 2b: Get restaurant details for each product
echo "  → Extracting restaurant details..."
$PSQL -d restaurant_service -tA -F "," -c "
    SELECT
        id,
        res_name as name,
        latitude,
        longitude
    FROM restaurants
    WHERE enabled = true;
" > /tmp/restaurant_ref.csv 2>/dev/null || true

# Step 2c: Get category names
echo "  → Extracting category names..."
$PSQL -d catalog_service -tA -F "," -c "
    SELECT
        id,
        cate_name as name
    FROM categories;
" > /tmp/category_ref.csv 2>/dev/null || true

# Step 2d: Get min/max prices
echo "  → Extracting price information..."
$PSQL -d product_service -tA -F "," -c "
    SELECT
        product_id,
        MIN(price)::text as min_price,
        MAX(price)::text as max_price
    FROM product_sizes
    GROUP BY product_id;
" > /tmp/price_ref.csv 2>/dev/null || true

echo "  → Merging and inserting data..."

# Clear existing data
$PSQL -d query_service -c "TRUNCATE TABLE product_read_model RESTART IDENTITY CASCADE;"

# Process each product
if [ -s /tmp/product_base.csv ]; then
    # Create associative arrays (lookup tables) in a temp script
    python3 << 'PYTHON'
import csv

# Load reference data
restaurants = {}
with open('/tmp/restaurant_ref.csv', 'r') as f:
    for row in csv.reader(f):
        if len(row) >= 4:
            restaurants[row[0]] = {'name': row[1], 'lat': row[2], 'lon': row[3]}

categories = {}
with open('/tmp/category_ref.csv', 'r') as f:
    for row in csv.reader(f):
        if len(row) >= 2:
            categories[row[0]] = row[1]

prices = {}
with open('/tmp/price_ref.csv', 'r') as f:
    for row in csv.reader(f):
        if len(row) >= 3:
            prices[row[0]] = {'min': row[1], 'max': row[2]}

# Generate SQL for products
sql_lines = []
with open('/tmp/product_base.csv', 'r') as f:
    for row in csv.reader(f):
        if len(row) < 13:
            continue

        prod_id, name, slug, desc, img, avail, cat_id, rest_id, rating, rev_count, created, updated = row

        # Look up references
        rest = restaurants.get(rest_id, {'name': 'Unknown', 'lat': '0', 'lon': '0'})
        cat_name = categories.get(cat_id, 'Unknown')
        price = prices.get(prod_id, {'min': '0', 'max': '0'})

        # Escape values
        name = name.replace("'", "''")
        slug = slug.replace("'", "''") if slug else ''
        desc = desc.replace("'", "''") if desc else ''
        img = img.replace("'", "''") if img else 'NULL'
        cat_name = cat_name.replace("'", "''")
        rest_name = rest['name'].replace("'", "''")

        sql = f"""INSERT INTO product_read_model (id, name, slug, description, image_url, available, category_id, category_name, restaurant_id, restaurant_name, restaurant_latitude, restaurant_longitude, min_price, max_price, rating, review_count, created_at, updated_at) VALUES ('{prod_id}', '{name}', '{slug}', '{desc}', {img}, {avail}, '{cat_id}', '{cat_name}', '{rest_id}', '{rest_name}', {rest['lat']}, {rest['lon']}, {price['min']}, {price['max']}, {rating}, {rev_count}, '{created}', '{updated}') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, rating = EXCLUDED.rating, review_count = EXCLUDED.review_count, updated_at = EXCLUDED.updated_at;"""
        sql_lines.append(sql)

# Write to temp file
with open('/tmp/product_inserts.sql', 'w') as f:
    f.write('\n'.join(sql_lines))

print(f"Generated {len(sql_lines)} INSERT statements")
PYTHON

    # Execute the generated SQL
    if [ -s /tmp/product_inserts.sql ]; then
        $PSQL -d query_service -f /tmp/product_inserts.sql

        # Update geometry
        echo "  → Updating geometry points..."
        $PSQL -d query_service -c "UPDATE product_read_model SET geom = ST_SetSRID(ST_MakePoint(restaurant_longitude, restaurant_latitude), 4326);"

        # Count result
        COUNT=$($PSQL -d query_service -tA -c "SELECT COUNT(*) FROM product_read_model;")
        echo "  ✓ Synced $COUNT products"
    fi
else
    echo "  ⚠ No product data found (run seed-all.sh first)"
fi

# Cleanup
rm -f /tmp/product_base.csv /tmp/restaurant_ref.csv /tmp/category_ref.csv /tmp/price_ref.csv /tmp/product_inserts.sql

echo ""
echo "=========================================="
echo "✓ Query service sync completed"
echo "=========================================="
