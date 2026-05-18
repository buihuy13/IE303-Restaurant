#!/bin/bash
# seed-local.sh - Seeding script for local PostgreSQL database
# Set environment variable USE_DOCKER=true to use Docker instead

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)

cd "$REPO_ROOT"

# Load environment variables
set -a
source .env 2>/dev/null || true
set +a

# Check if we should use Docker
USE_DOCKER="${USE_DOCKER:-false}"

# Database connection settings
LOCAL_DB_HOST="${LOCAL_DB_HOST:-localhost}"
LOCAL_DB_PORT="${LOCAL_DB_PORT:-5432}"
LOCAL_DB_USER="${LOCAL_DB_USER:-postgres}"
LOCAL_DB_PASSWORD="${LOCAL_DB_PASSWORD:-1}"

# Fixed user IDs (MUST match Keycloak realm.json)
MERCHANT_USER_ID="00000000-0000-0000-0000-000000000003"
CUSTOMER_USER_ID="00000000-0000-0000-0000-000000000001"
ADMIN_USER_ID="00000000-0000-0000-0000-000000000002"

# Entity IDs
RESTAURANT_ID_1="00000000-0000-0000-1000-000000000001"
RESTAURANT_ID_2="00000000-0000-0000-1000-000000000002"
RESTAURANT_ID_3="00000000-0000-0000-1000-000000000003"

PRODUCT_ID_1="00000000-0000-0000-2000-000000000001"
PRODUCT_ID_2="00000000-0000-0000-2000-000000000002"
PRODUCT_ID_3="00000000-0000-0000-2000-000000000003"
PRODUCT_ID_4="00000000-0000-0000-2000-000000000004"

REVIEW_ID_1="00000000-0000-0000-3000-000000000001"
REVIEW_ID_2="00000000-0000-0000-3000-000000000002"
REVIEW_ID_3="00000000-0000-0000-3000-000000000003"
REVIEW_ID_4="00000000-0000-0000-3000-000000000004"

# Set PSQL command based on mode
if [ "$USE_DOCKER" = "true" ]; then
    echo "Using Docker PostgreSQL..."
    PSQL="docker compose exec -T -u postgres postgres psql -U postgres"
    PG_ISREADY="docker compose exec -T postgres pg_isready -U postgres"
else
    echo "Using local PostgreSQL at $LOCAL_DB_HOST:$LOCAL_DB_PORT..."
    export PGPASSWORD="$LOCAL_DB_PASSWORD"
    PSQL="psql -h $LOCAL_DB_HOST -p $LOCAL_DB_PORT -U $LOCAL_DB_USER"
    PG_ISREADY="pg_isready -h $LOCAL_DB_HOST -p $LOCAL_DB_PORT -U $LOCAL_DB_USER"
fi

wait_for_postgres() {
    echo "Waiting for postgres..."
    until $PG_ISREADY >/dev/null 2>&1; do
        sleep 2
    done
    echo "✓ PostgreSQL ready"
}

wait_for_databases() {
    echo "Waiting for databases..."
    local dbs=("user_service" "catalog_service" "restaurant_service" "product_service" "review_service" "query_service")

    if [ "$USE_DOCKER" = "true" ]; then
        for db in "${dbs[@]}"; do
            while ! $PSQL -lqt | cut -d \| -f 1 | grep -qw "$db"; do
                sleep 1
            done
        done
    else
        # For local PostgreSQL, databases might already exist
        echo "Checking databases exist..."
        local missing=()
        for db in "${dbs[@]}"; do
            if ! $PSQL -lqt | cut -d \| -f 1 | grep -qw "$db"; then
                missing+=("$db")
            fi
        done

        if [ ${#missing[@]} -gt 0 ]; then
            echo "⚠️  Missing databases: ${missing[*]}"
            echo "Please create them first:"
            echo "  for db in user_service catalog_service restaurant_service product_service review_service query_service; do"
            echo "    createdb -h $LOCAL_DB_HOST -p $LOCAL_DB_PORT -U $LOCAL_DB_USER \$db"
            echo "  done"
            exit 1
        fi
    fi
    echo "✓ All databases ready"
}

fetch_reference_ids() {
    echo "Fetching reference IDs..."
    CATEGORY_GA_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM categories WHERE cate_name = 'Gà' LIMIT 1;")
    CATEGORY_TRA_SUA_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM categories WHERE cate_name = 'Trà sữa' LIMIT 1;")
    CATEGORY_PIZZA_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM categories WHERE cate_name = 'Pizza' LIMIT 1;")
    CATEGORY_COM_TAM_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM categories WHERE cate_name = 'Cơm tấm' LIMIT 1;")
    SIZE_S_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM sizes WHERE name = 'S' LIMIT 1;")
    SIZE_M_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM sizes WHERE name = 'M' LIMIT 1;")
    SIZE_L_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM sizes WHERE name = 'L' LIMIT 1;")

    [ -n "$CATEGORY_GA_ID" ] && [ -n "$SIZE_S_ID" ] && echo "✓ Reference IDs fetched"
}

seed_user_service() {
    echo "Seeding users..."
    $PSQL -d user_service >/dev/null 2>&1 <<SQL
INSERT INTO users (id, username, email, phone, slug, bank_number, bank, bank_name) VALUES
('$MERCHANT_USER_ID', 'merchant', 'merchant@example.com', '0900000000', 'merchant', '123456789', 'VCB', 'Ngân hàng TMCP Ngoại Thương Việt Nam'),
('$CUSTOMER_USER_ID', 'test_user', 'testuser@example.com', '0900000001', 'test_user', NULL, NULL, NULL),
('$ADMIN_USER_ID', 'admin_manager', 'manager@example.com', '0900000002', 'admin_manager', NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, email = EXCLUDED.email, phone = EXCLUDED.phone, bank_number = EXCLUDED.bank_number, bank = EXCLUDED.bank, bank_name = EXCLUDED.bank_name;
SQL
    echo "✓ 3 users seeded"
}

seed_restaurants() {
    echo "Seeding restaurants..."
    $PSQL -d restaurant_service >/dev/null 2>&1 <<SQL
INSERT INTO restaurants (id, res_name, address, longitude, latitude, rating, opening_time, closing_time, phone, total_review, merchant_id, slug, enabled) VALUES
('$RESTAURANT_ID_1', 'Merchant Bistro', '123 Nguyen Trai, Quan 1, HCMC', 106.660172, 10.762622, 4.8, '08:00:00', '22:00:00', '0900000000', 0, '$MERCHANT_USER_ID', 'merchant-bistro', true),
('$RESTAURANT_ID_2', 'Tra Sua Ngon', '456 Hai Ba Trung, Quan 1, HCMC', 106.692403, 10.779769, 4.5, '09:00:00', '23:00:00', '0900000001', 0, '$MERCHANT_USER_ID', 'tra-sua-ngon', true),
('$RESTAURANT_ID_3', 'Pizza Corner', '789 Le Loi, Quan 1, HCMC', 106.700981, 10.776889, 4.7, '10:00:00', '23:00:00', '0900000002', 0, '$MERCHANT_USER_ID', 'pizza-corner', true)
ON CONFLICT (slug) DO UPDATE SET res_name = EXCLUDED.res_name, merchant_id = EXCLUDED.merchant_id;
SQL
    echo "✓ 3 restaurants seeded"
}

seed_products() {
    echo "Seeding products..."
    $PSQL -d product_service >/dev/null 2>&1 <<SQL
INSERT INTO products (id, product_name, description, restaurant_id, category_id, slug, available, rating, total_review) VALUES
('$PRODUCT_ID_1', 'Gà Chiên Mắm', 'Gà chiên nước mắm đậm đà', '$RESTAURANT_ID_1', '$CATEGORY_GA_ID', 'ga-chien-mam', true, 4.5, 0),
('$PRODUCT_ID_2', 'Trà Sữa Trân Châu', 'Trà sữa đặc biệt', '$RESTAURANT_ID_2', '$CATEGORY_TRA_SUA_ID', 'tra-sua-tran-chau', true, 4.6, 0),
('$PRODUCT_ID_3', 'Pizza Hải Sản', 'Pizza hải sản tươi ngon', '$RESTAURANT_ID_3', '$CATEGORY_PIZZA_ID', 'pizza-hai-san', true, 4.8, 0),
('$PRODUCT_ID_4', 'Cơm Tấm Sườn Bì', 'Cơm tấm sườn bì chả', '$RESTAURANT_ID_1', '$CATEGORY_COM_TAM_ID', 'com-tam-suon-bi', true, 4.7, 0)
ON CONFLICT (slug) DO UPDATE SET product_name = EXCLUDED.product_name, category_id = EXCLUDED.category_id;
SQL
    echo "✓ 4 products seeded"
}

seed_product_sizes() {
    echo "Seeding product sizes..."
    $PSQL -d product_service >/dev/null 2>&1 <<SQL
INSERT INTO product_sizes (id, product_id, size_id, price) VALUES
('00000000-0000-0000-4000-000000000001', '$PRODUCT_ID_1', '$SIZE_S_ID', 45000),
('00000000-0000-0000-4000-000000000002', '$PRODUCT_ID_1', '$SIZE_M_ID', 55000),
('00000000-0000-0000-4000-000000000003', '$PRODUCT_ID_1', '$SIZE_L_ID', 65000),
('00000000-0000-0000-4000-000000000004', '$PRODUCT_ID_2', '$SIZE_S_ID', 30000),
('00000000-0000-0000-4000-000000000005', '$PRODUCT_ID_2', '$SIZE_M_ID', 35000),
('00000000-0000-0000-4000-000000000006', '$PRODUCT_ID_2', '$SIZE_L_ID', 40000),
('00000000-0000-0000-4000-000000000007', '$PRODUCT_ID_3', '$SIZE_M_ID', 120000),
('00000000-0000-0000-4000-000000000008', '$PRODUCT_ID_3', '$SIZE_L_ID', 180000),
('00000000-0000-0000-4000-000000000009', '$PRODUCT_ID_4', '$SIZE_S_ID', 40000),
('00000000-0000-0000-4000-000000000010', '$PRODUCT_ID_4', '$SIZE_M_ID', 50000)
ON CONFLICT DO NOTHING;
SQL
    echo "✓ 10 product sizes seeded"
}

seed_query_service() {
    echo "Seeding query service read models..."
    $PSQL -d query_service >/dev/null 2>&1 <<SQL
-- Clear existing
TRUNCATE TABLE restaurant_read_model, product_read_model RESTART IDENTITY CASCADE;

-- Restaurants read model
INSERT INTO restaurant_read_model (id, name, slug, address, phone, image_url, enabled, opening_time, closing_time, latitude, longitude, rating, review_count, merchant_id, created_at, updated_at) VALUES
('$RESTAURANT_ID_1', 'Merchant Bistro', 'merchant-bistro', '123 Nguyen Trai, Quan 1, HCMC', '0900000000', NULL, true, '08:00:00', '22:00:00', 10.762622, 106.660172, 4.8, 0, '$MERCHANT_USER_ID', NOW(), NOW()),
('$RESTAURANT_ID_2', 'Tra Sua Ngon', 'tra-sua-ngon', '456 Hai Ba Trung, Quan 1, HCMC', '0900000001', NULL, true, '09:00:00', '23:00:00', 10.779769, 106.692403, 4.5, 0, '$MERCHANT_USER_ID', NOW(), NOW()),
('$RESTAURANT_ID_3', 'Pizza Corner', 'pizza-corner', '789 Le Loi, Quan 1, HCMC', '0900000002', NULL, true, '10:00:00', '23:00:00', 10.776889, 106.700981, 4.7, 0, '$MERCHANT_USER_ID', NOW(), NOW());

-- Update geometry for restaurants
UPDATE restaurant_read_model SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);

-- Products read model
INSERT INTO product_read_model (id, name, slug, description, image_url, available, category_id, category_name, restaurant_id, restaurant_name, restaurant_latitude, restaurant_longitude, min_price, max_price, rating, review_count, created_at, updated_at) VALUES
('$PRODUCT_ID_1', 'Gà Chiên Mắm', 'ga-chien-mam', 'Gà chiên nước mắm đậm đà', NULL, true, '$CATEGORY_GA_ID', 'Gà', '$RESTAURANT_ID_1', 'Merchant Bistro', 10.762622, 106.660172, 45000, 65000, 4.5, 0, NOW(), NOW()),
('$PRODUCT_ID_2', 'Trà Sữa Trân Châu', 'tra-sua-tran-chau', 'Trà sữa đặc biệt', NULL, true, '$CATEGORY_TRA_SUA_ID', 'Trà sữa', '$RESTAURANT_ID_2', 'Tra Sua Ngon', 10.779769, 106.692403, 30000, 40000, 4.6, 0, NOW(), NOW()),
('$PRODUCT_ID_3', 'Pizza Hải Sản', 'pizza-hai-san', 'Pizza hải sản tươi ngon', NULL, true, '$CATEGORY_PIZZA_ID', 'Pizza', '$RESTAURANT_ID_3', 'Pizza Corner', 10.776889, 106.700981, 120000, 180000, 4.8, 0, NOW(), NOW()),
('$PRODUCT_ID_4', 'Cơm Tấm Sườn Bì', 'com-tam-suon-bi', 'Cơm tấm sườn bì chả', NULL, true, '$CATEGORY_COM_TAM_ID', 'Cơm tấm', '$RESTAURANT_ID_1', 'Merchant Bistro', 10.762622, 106.660172, 40000, 50000, 4.7, 0, NOW(), NOW());

-- Update geometry for products
UPDATE product_read_model SET geom = ST_SetSRID(ST_MakePoint(restaurant_longitude, restaurant_latitude), 4326);
SQL
    echo "✓ Query service seeded (3 restaurants, 4 products)"
}

seed_reviews() {
    echo "Seeding reviews..."
    $PSQL -d review_service >/dev/null 2>&1 <<SQL
INSERT INTO reviews (id, user_id, review_id, review_type, title, content, rating) VALUES
('$REVIEW_ID_1', '$CUSTOMER_USER_ID', '$RESTAURANT_ID_1', 'RESTAURANT', 'Quán rất ngon', 'Món ăn ngon, không gian thoải mái.', 4.8),
('$REVIEW_ID_2', '$ADMIN_USER_ID', '$RESTAURANT_ID_2', 'RESTAURANT', 'Tra sữa tuyệt vời', 'Trà sữa đậm đà, trân châu dai.', 4.5),
('$REVIEW_ID_3', '$ADMIN_USER_ID', '$PRODUCT_ID_1', 'PRODUCT', 'Gà chiên giòn ngon', 'Gà chiên nước mắm đậm đà, vỏ giòn.', 4.5),
('$REVIEW_ID_4', '$CUSTOMER_USER_ID', '$PRODUCT_ID_4', 'PRODUCT', 'Cơm tấm chuẩn vị', 'Cơm tấm sườn bì chả đầy đặn.', 4.7)
ON CONFLICT DO NOTHING;
SQL
    echo "✓ 4 reviews seeded"
}

main() {
    echo "=========================================="
    echo "Database Seeding (Local/Docker Hybrid)"
    echo "=========================================="
    echo "Mode: $([ "$USE_DOCKER" = "true" ] && echo "Docker" || echo "Local PostgreSQL at $LOCAL_DB_HOST:$LOCAL_DB_PORT")"
    echo ""

    wait_for_postgres
    wait_for_databases
    fetch_reference_ids
    seed_user_service
    seed_restaurants
    seed_products
    seed_product_sizes
    seed_query_service
    seed_reviews

    echo ""
    echo "=========================================="
    echo "✓ Seeding complete!"
    echo "=========================================="
    echo "Users: merchant / testmerchant123"
    echo "       test_user / testuser123"
    echo "       admin_manager / testadmin123"
}

main
