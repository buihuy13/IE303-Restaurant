#!/bin/bash
# seed-all.sh - Simplified seeding with fixed user IDs
# No Keycloak API calls needed - uses pre-defined UUIDs from realm.json
# IMPORTANT: Run AFTER docker compose up -d and all services are healthy

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)

cd "$REPO_ROOT"

# Load environment variables
set -a
source .env
set +a

# Fixed user IDs (MUST match Keycloak realm.json)
MERCHANT_USER_ID="00000000-0000-0000-0000-000000000003"
CUSTOMER_USER_ID="00000000-0000-0000-0000-000000000001"
ADMIN_USER_ID="00000000-0000-0000-0000-000000000002"

# Predictable entity IDs
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

# Variables for category and size IDs (will be fetched)
CATEGORY_GA_ID=""
CATEGORY_TRA_SUA_ID=""
CATEGORY_PIZZA_ID=""
CATEGORY_COM_TAM_ID=""

SIZE_S_ID=""
SIZE_M_ID=""
SIZE_L_ID=""

# PSQL command
PSQL="docker compose exec -T -u postgres postgres psql -U postgres"

# ===================================================================
# Wait for services to be ready
# ===================================================================
wait_for_postgres() {
    echo "Waiting for postgres to be ready..."
    local max_attempts=60
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
            echo "✓ PostgreSQL is ready."
            return 0
        fi
        attempt=$((attempt + 1))
        echo "  Waiting... ($attempt/$max_attempts)"
        sleep 2
    done

    echo "✗ PostgreSQL failed to start within timeout"
    exit 1
}

wait_for_databases() {
    echo "Waiting for all databases to be created..."

    local databases=("user_service" "catalog_service" "restaurant_service" "product_service" "review_service" "query_service")
    local db

    for db in "${databases[@]}"; do
        local max_attempts=30
        local attempt=0

        while [ $attempt -lt $max_attempts ]; do
            if $PSQL -lqt | cut -d \| -f 1 | grep -qw "$db"; then
                echo "  ✓ Database '$db' exists"
                break
            fi
            attempt=$((attempt + 1))
            sleep 1
        done

        if [ $attempt -ge $max_attempts ]; then
            echo "  ✗ Database '$db' not found!"
            exit 1
        fi
    done

    echo "✓ All databases are ready."
}

# ===================================================================
# Step 0: Fetch reference IDs from catalog_service
# ===================================================================
fetch_reference_ids() {
    echo "=========================================="
    echo "Step 0: Fetching reference IDs"
    echo "=========================================="

    # Fetch category IDs
    CATEGORY_GA_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM categories WHERE cate_name = 'Gà' LIMIT 1;")
    CATEGORY_TRA_SUA_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM categories WHERE cate_name = 'Trà sữa' LIMIT 1;")
    CATEGORY_PIZZA_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM categories WHERE cate_name = 'Pizza' LIMIT 1;")
    CATEGORY_COM_TAM_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM categories WHERE cate_name = 'Cơm tấm' LIMIT 1;")

    # Fetch size IDs
    SIZE_S_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM sizes WHERE name = 'S' LIMIT 1;")
    SIZE_M_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM sizes WHERE name = 'M' LIMIT 1;")
    SIZE_L_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM sizes WHERE name = 'L' LIMIT 1;")

    # Validate all IDs were found
    if [ -z "$CATEGORY_GA_ID" ] || [ -z "$CATEGORY_TRA_SUA_ID" ] || [ -z "$CATEGORY_PIZZA_ID" ] || [ -z "$CATEGORY_COM_TAM_ID" ]; then
        echo "✗ Failed to fetch category IDs. Did catalog_service_data.sql run?"
        exit 1
    fi

    if [ -z "$SIZE_S_ID" ] || [ -z "$SIZE_M_ID" ] || [ -z "$SIZE_L_ID" ]; then
        echo "✗ Failed to fetch size IDs. Did catalog_service_data.sql run?"
        exit 1
    fi

    echo "✓ Category IDs fetched:"
    echo "  Gà: $CATEGORY_GA_ID"
    echo "  Trà sữa: $CATEGORY_TRA_SUA_ID"
    echo "  Pizza: $CATEGORY_PIZZA_ID"
    echo "  Cơm tấm: $CATEGORY_COM_TAM_ID"
    echo "✓ Size IDs fetched:"
    echo "  S: $SIZE_S_ID"
    echo "  M: $SIZE_M_ID"
    echo "  L: $SIZE_L_ID"
}

# ===================================================================
# Step 1: Seed user_service with fixed Keycloak IDs
# ===================================================================
seed_user_service() {
    echo "=========================================="
    echo "Step 1: Seeding user_service"
    echo "=========================================="

    $PSQL -d user_service <<SQL
-- Seed users (must match Keycloak IDs exactly)
INSERT INTO users (id, username, email, phone, slug) VALUES
('$MERCHANT_USER_ID', 'merchant', 'merchant@example.com', '0900000000', 'merchant'),
('$CUSTOMER_USER_ID', 'test_user', 'testuser@example.com', '0900000001', 'test_user'),
('$ADMIN_USER_ID', 'admin_manager', 'manager@example.com', '0900000002', 'admin_manager')
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    slug = EXCLUDED.slug,
    updated_at = CURRENT_TIMESTAMP;

SELECT 'Seeded ' || COUNT(*) || ' users' as result FROM users;
SQL
}

# ===================================================================
# Step 2: Seed restaurants with fixed merchant ID
# ===================================================================
seed_restaurants() {
    echo "=========================================="
    echo "Step 2: Seeding restaurants"
    echo "=========================================="

    $PSQL -d restaurant_service <<SQL
-- Restaurant 1: Merchant Bistro
INSERT INTO restaurants (
    id, res_name, address, longitude, latitude, rating,
    opening_time, closing_time, phone, total_review,
    merchant_id, slug, enabled
) VALUES
('$RESTAURANT_ID_1',
 'Merchant Bistro',
 '123 Nguyen Trai, Quan 1, Ho Chi Minh City',
 106.660172, 10.762622, 4.8,
 '08:00:00', '22:00:00',
 '0900000000', 0,
 '$MERCHANT_USER_ID',
 'merchant-bistro', true)
ON CONFLICT (slug) DO UPDATE SET
    res_name = EXCLUDED.res_name,
    address = EXCLUDED.address,
    longitude = EXCLUDED.longitude,
    latitude = EXCLUDED.latitude,
    merchant_id = EXCLUDED.merchant_id,
    updated_at = CURRENT_TIMESTAMP;

-- Restaurant 2: Tra Sua Ngon
INSERT INTO restaurants (
    id, res_name, address, longitude, latitude, rating,
    opening_time, closing_time, phone, total_review,
    merchant_id, slug, enabled
) VALUES
('$RESTAURANT_ID_2',
 'Tra Sua Ngon',
 '456 Hai Ba Trung, Quan 1, Ho Chi Minh City',
 106.692403, 10.779769, 4.5,
 '09:00:00', '23:00:00',
 '0900000001', 0,
 '$MERCHANT_USER_ID',
 'tra-sua-ngon', true)
ON CONFLICT (slug) DO UPDATE SET
    res_name = EXCLUDED.res_name,
    address = EXCLUDED.address,
    longitude = EXCLUDED.longitude,
    latitude = EXCLUDED.latitude,
    merchant_id = EXCLUDED.merchant_id,
    updated_at = CURRENT_TIMESTAMP;

-- Restaurant 3: Pizza Corner
INSERT INTO restaurants (
    id, res_name, address, longitude, latitude, rating,
    opening_time, closing_time, phone, total_review,
    merchant_id, slug, enabled
) VALUES
('$RESTAURANT_ID_3',
 'Pizza Corner',
 '789 Le Loi, Quan 1, Ho Chi Minh City',
 106.700981, 10.776889, 4.7,
 '10:00:00', '23:00:00',
 '0900000002', 0,
 '$MERCHANT_USER_ID',
 'pizza-corner', true)
ON CONFLICT (slug) DO UPDATE SET
    res_name = EXCLUDED.res_name,
    address = EXCLUDED.address,
    longitude = EXCLUDED.longitude,
    latitude = EXCLUDED.latitude,
    merchant_id = EXCLUDED.merchant_id,
    updated_at = CURRENT_TIMESTAMP;

SELECT 'Seeded ' || COUNT(*) || ' restaurants' as result FROM restaurants;
SQL
}

# ===================================================================
# Step 3: Seed products
# ===================================================================
seed_products() {
    echo "=========================================="
    echo "Step 3: Seeding products"
    echo "=========================================="

    $PSQL -d product_service <<SQL
-- Product 1: Gà chiên (at Merchant Bistro)
INSERT INTO products (
    id, product_name, description, restaurant_id, category_id,
    slug, available, rating, total_review
) VALUES
('$PRODUCT_ID_1',
 'Gà Chiên Mắm',
 'Gà chiên nước mắm đậm đà, giòn ngon',
 '$RESTAURANT_ID_1',
 '$CATEGORY_GA_ID',
 'ga-chien-mam', true, 4.5, 0)
ON CONFLICT (slug) DO UPDATE SET
    product_name = EXCLUDED.product_name,
    description = EXCLUDED.description,
    restaurant_id = EXCLUDED.restaurant_id,
    category_id = EXCLUDED.category_id,
    updated_at = CURRENT_TIMESTAMP;

-- Product 2: Trà sữa (at Tra Sua Ngon)
INSERT INTO products (
    id, product_name, description, restaurant_id, category_id,
    slug, available, rating, total_review
) VALUES
('$PRODUCT_ID_2',
 'Trà Sữa Trân Châu',
 'Trà sữa đặc biệt, trân châu dai ngon',
 '$RESTAURANT_ID_2',
 '$CATEGORY_TRA_SUA_ID',
 'tra-sua-tran-chau', true, 4.6, 0)
ON CONFLICT (slug) DO UPDATE SET
    product_name = EXCLUDED.product_name,
    description = EXCLUDED.description,
    restaurant_id = EXCLUDED.restaurant_id,
    category_id = EXCLUDED.category_id,
    updated_at = CURRENT_TIMESTAMP;

-- Product 3: Pizza (at Pizza Corner)
INSERT INTO products (
    id, product_name, description, restaurant_id, category_id,
    slug, available, rating, total_review
) VALUES
('$PRODUCT_ID_3',
 'Pizza Hải Sản',
 'Pizza hải sản tươi ngon, đầy đặn',
 '$RESTAURANT_ID_3',
 '$CATEGORY_PIZZA_ID',
 'pizza-hai-san', true, 4.8, 0)
ON CONFLICT (slug) DO UPDATE SET
    product_name = EXCLUDED.product_name,
    description = EXCLUDED.description,
    restaurant_id = EXCLUDED.restaurant_id,
    category_id = EXCLUDED.category_id,
    updated_at = CURRENT_TIMESTAMP;

-- Product 4: Cơm tấm (at Merchant Bistro)
INSERT INTO products (
    id, product_name, description, restaurant_id, category_id,
    slug, available, rating, total_review
) VALUES
('$PRODUCT_ID_4',
 'Cơm Tấm Sườn Bì',
 'Cơm tấm sườn bì chả, đậm đà hương vị miền Nam',
 '$RESTAURANT_ID_1',
 '$CATEGORY_COM_TAM_ID',
 'com-tam-suon-bi', true, 4.7, 0)
ON CONFLICT (slug) DO UPDATE SET
    product_name = EXCLUDED.product_name,
    description = EXCLUDED.description,
    restaurant_id = EXCLUDED.restaurant_id,
    category_id = EXCLUDED.category_id,
    updated_at = CURRENT_TIMESTAMP;

SELECT 'Seeded ' || COUNT(*) || ' products' as result FROM products;
SQL
}

# ===================================================================
# Step 4: Seed product sizes with prices
# ===================================================================
seed_product_sizes() {
    echo "=========================================="
    echo "Step 4: Seeding product sizes"
    echo "=========================================="

    $PSQL -d product_service <<SQL
-- Gà Chiên Mắm sizes
INSERT INTO product_sizes (id, product_id, size_id, price) VALUES
('00000000-0000-0000-4000-000000000001', '$PRODUCT_ID_1', '$SIZE_S_ID', 45000),
('00000000-0000-0000-4000-000000000002', '$PRODUCT_ID_1', '$SIZE_M_ID', 55000),
('00000000-0000-0000-4000-000000000003', '$PRODUCT_ID_1', '$SIZE_L_ID', 65000)
ON CONFLICT DO NOTHING;

-- Trà Sữa sizes
INSERT INTO product_sizes (id, product_id, size_id, price) VALUES
('00000000-0000-0000-4000-000000000004', '$PRODUCT_ID_2', '$SIZE_S_ID', 30000),
('00000000-0000-0000-4000-000000000005', '$PRODUCT_ID_2', '$SIZE_M_ID', 35000),
('00000000-0000-0000-4000-000000000006', '$PRODUCT_ID_2', '$SIZE_L_ID', 40000)
ON CONFLICT DO NOTHING;

-- Pizza sizes
INSERT INTO product_sizes (id, product_id, size_id, price) VALUES
('00000000-0000-0000-4000-000000000007', '$PRODUCT_ID_3', '$SIZE_M_ID', 120000),
('00000000-0000-0000-4000-000000000008', '$PRODUCT_ID_3', '$SIZE_L_ID', 180000)
ON CONFLICT DO NOTHING;

-- Cơm Tấm sizes
INSERT INTO product_sizes (id, product_id, size_id, price) VALUES
('00000000-0000-0000-4000-000000000009', '$PRODUCT_ID_4', '$SIZE_S_ID', 40000),
('00000000-0000-0000-4000-000000000010', '$PRODUCT_ID_4', '$SIZE_M_ID', 50000)
ON CONFLICT DO NOTHING;

SELECT 'Seeded ' || COUNT(*) || ' product sizes' as result FROM product_sizes;
SQL
}

# ===================================================================
# Step 5: Sync query-service read models
# ===================================================================
sync_query_service() {
    echo "=========================================="
    echo "Step 5: Syncing query-service read models"
    echo "=========================================="

    bash "$SCRIPT_DIR/sync-query-service.sh"
}

# ===================================================================
# Step 6: Seed reviews with fixed user IDs
# ===================================================================
seed_reviews() {
    echo "=========================================="
    echo "Step 6: Seeding reviews"
    echo "=========================================="

    $PSQL -d review_service <<SQL
-- Review for restaurant 1 (by customer)
INSERT INTO reviews (
    id, user_id, review_id, review_type, title, content, rating
) VALUES
('$REVIEW_ID_1',
 '$CUSTOMER_USER_ID',
 '$RESTAURANT_ID_1',
 'RESTAURANT',
 'Quán rất ngon',
 'Món ăn ngon, không gian thoải mái, giá cả hợp lý.',
 4.8)
ON CONFLICT DO NOTHING;

-- Review for restaurant 2 (by admin)
INSERT INTO reviews (
    id, user_id, review_id, review_type, title, content, rating
) VALUES
('$REVIEW_ID_2',
 '$ADMIN_USER_ID',
 '$RESTAURANT_ID_2',
 'RESTAURANT',
 'Tra sữa tuyệt vời',
 'Tra sữa đậm đà, trân châu dai, sẽ quay lại.',
 4.5)
ON CONFLICT DO NOTHING;

-- Review for product 1 (by admin)
INSERT INTO reviews (
    id, user_id, review_id, review_type, title, content, rating
) VALUES
('$REVIEW_ID_3',
 '$ADMIN_USER_ID',
 '$PRODUCT_ID_1',
 'PRODUCT',
 'Gà chiên giòn ngon',
 'Gà chiên nước mắm đậm đà, vỏ giòn, thịt mềm.',
 4.5)
ON CONFLICT DO NOTHING;

-- Review for product 4 (by customer)
INSERT INTO reviews (
    id, user_id, review_id, review_type, title, content, rating
) VALUES
('$REVIEW_ID_4',
 '$CUSTOMER_USER_ID',
 '$PRODUCT_ID_4',
 'PRODUCT',
 'Cơm tấm chuẩn vị',
 'Cơm tấm sườn bì chả đầy đặn, nước mắm đậm đà.',
 4.7)
ON CONFLICT DO NOTHING;

SELECT 'Seeded ' || COUNT(*) || ' reviews' as result FROM reviews;
SQL
}

# ===================================================================
# Main execution
# ===================================================================
main() {
    echo "=========================================="
    echo "Database Seeding Script"
    echo "=========================================="
    echo ""

    wait_for_postgres
    wait_for_databases
    fetch_reference_ids
    seed_user_service
    seed_restaurants
    seed_products
    seed_product_sizes
    sync_query_service
    seed_reviews

    echo ""
    echo "=========================================="
    echo "✓ Seeding completed successfully!"
    echo "=========================================="
    echo ""
    echo "User credentials:"
    echo "  merchant     / testmerchant123"
    echo "  test_user    / testuser123"
    echo "  admin_manager / testadmin123"
    echo ""
    echo "Test accounts:"
    echo "  3 restaurants seeded"
    echo "  4 products seeded"
    echo "  4 reviews seeded"
}

main
