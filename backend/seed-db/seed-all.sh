#!/bin/bash
# seed-all.sh - Simplified seeding with fixed user IDs
# IMPORTANT: Run AFTER docker compose up -d

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)

cd "$REPO_ROOT"

# Load environment variables
set -a
source .env 2>/dev/null || true
set +a

# Fixed user IDs (MUST match Keycloak realm.json)
MERCHANT_USER_ID="00000000-0000-0000-0000-000000000003"
CUSTOMER_USER_ID="00000000-0000-0000-0000-000000000001"
ADMIN_USER_ID="00000000-0000-0000-0000-000000000002"

# Entity IDs
RESTAURANT_ID_1="00000000-0000-0000-1000-000000000001"
RESTAURANT_ID_2="00000000-0000-0000-1000-000000000002"
RESTAURANT_ID_3="00000000-0000-0000-1000-000000000003"
RESTAURANT_ID_4="00000000-0000-0000-1000-000000000004"
RESTAURANT_ID_5="00000000-0000-0000-1000-000000000005"
RESTAURANT_ID_6="00000000-0000-0000-1000-000000000006"

PRODUCT_ID_1="00000000-0000-0000-2000-000000000001"
PRODUCT_ID_2="00000000-0000-0000-2000-000000000002"
PRODUCT_ID_3="00000000-0000-0000-2000-000000000003"
PRODUCT_ID_4="00000000-0000-0000-2000-000000000004"
PRODUCT_ID_5="00000000-0000-0000-2000-000000000005"
PRODUCT_ID_6="00000000-0000-0000-2000-000000000006"
PRODUCT_ID_7="00000000-0000-0000-2000-000000000007"
PRODUCT_ID_8="00000000-0000-0000-2000-000000000008"
PRODUCT_ID_9="00000000-0000-0000-2000-000000000009"
PRODUCT_ID_10="00000000-0000-0000-2000-000000000010"
PRODUCT_ID_11="00000000-0000-0000-2000-000000000011"
PRODUCT_ID_12="00000000-0000-0000-2000-000000000012"
PRODUCT_ID_13="00000000-0000-0000-2000-000000000013"
PRODUCT_ID_14="00000000-0000-0000-2000-000000000014"
PRODUCT_ID_15="00000000-0000-0000-2000-000000000015"

REVIEW_ID_1="00000000-0000-0000-3000-000000000001"
REVIEW_ID_2="00000000-0000-0000-3000-000000000002"
REVIEW_ID_3="00000000-0000-0000-3000-000000000003"
REVIEW_ID_4="00000000-0000-0000-3000-000000000004"
REVIEW_ID_5="00000000-0000-0000-3000-000000000005"
REVIEW_ID_6="00000000-0000-0000-3000-000000000006"
REVIEW_ID_7="00000000-0000-0000-3000-000000000007"
REVIEW_ID_8="00000000-0000-0000-3000-000000000008"
REVIEW_ID_9="00000000-0000-0000-3000-000000000009"
REVIEW_ID_10="00000000-0000-0000-3000-000000000010"
REVIEW_ID_11="00000000-0000-0000-3000-000000000011"
REVIEW_ID_12="00000000-0000-0000-3000-000000000012"
REVIEW_ID_13="00000000-0000-0000-3000-000000000013"
REVIEW_ID_14="00000000-0000-0000-3000-000000000014"
REVIEW_ID_15="00000000-0000-0000-3000-000000000015"
REVIEW_ID_16="00000000-0000-0000-3000-000000000016"
REVIEW_ID_17="00000000-0000-0000-3000-000000000017"
REVIEW_ID_18="00000000-0000-0000-3000-000000000018"
REVIEW_ID_19="00000000-0000-0000-3000-000000000019"
REVIEW_ID_20="00000000-0000-0000-3000-000000000020"
REVIEW_ID_21="00000000-0000-0000-3000-000000000021"
REVIEW_ID_22="00000000-0000-0000-3000-000000000022"

ORDER_ID_1="00000000-0000-0000-5000-000000000001"
ORDER_ID_2="00000000-0000-0000-5000-000000000002"
ORDER_ID_3="00000000-0000-0000-5000-000000000003"

MONGO_USER="${MONGO_USER:-admin}"
MONGO_PASSWORD="${MONGO_PASSWORD:-admin}"

# PSQL command
PSQL="docker compose exec -T -u postgres postgres psql -U postgres"
MONGOSH=(docker compose exec -T mongodb mongosh --username "$MONGO_USER" --password "$MONGO_PASSWORD" --authenticationDatabase admin order_db --quiet)

wait_for_postgres() {
    echo "Waiting for postgres..."
    until docker compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; do
        sleep 2
    done
    echo "✓ PostgreSQL ready"
}

wait_for_databases() {
    echo "Waiting for databases..."
    local dbs=("user_service" "catalog_service" "restaurant_service" "product_service" "review_service" "query_service" "payment_service")
    for db in "${dbs[@]}"; do
        while ! $PSQL -lqt | cut -d \| -f 1 | grep -qw "$db"; do
            sleep 1
        done
    done
    echo "✓ All databases ready"
}

wait_for_mongo() {
    echo "Waiting for MongoDB..."
    until docker compose exec -T mongodb mongosh --username "$MONGO_USER" --password "$MONGO_PASSWORD" --authenticationDatabase admin --quiet --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
        sleep 2
    done
    echo "✓ MongoDB ready"
}

fetch_reference_ids() {
    echo "Fetching reference IDs..."
    CATEGORY_GA_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM categories WHERE cate_name = 'Gà' LIMIT 1;")
    CATEGORY_TRA_SUA_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM categories WHERE cate_name = 'Trà sữa' LIMIT 1;")
    CATEGORY_PIZZA_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM categories WHERE cate_name = 'Pizza' LIMIT 1;")
    CATEGORY_COM_TAM_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM categories WHERE cate_name = 'Cơm tấm' LIMIT 1;")
    CATEGORY_BUN_BO_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM categories WHERE cate_name = 'Bún bò' LIMIT 1;")
    CATEGORY_BANH_MI_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM categories WHERE cate_name = 'Bánh mì' LIMIT 1;")
    CATEGORY_PHO_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM categories WHERE cate_name = 'Phở' LIMIT 1;")
    CATEGORY_GOI_CUON_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM categories WHERE cate_name = 'Bánh cuốn' LIMIT 1;")
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
INSERT INTO restaurants (id, res_name, address, longitude, latitude, rating, opening_time, closing_time, phone, total_review, merchant_id, slug, enabled, image_url) VALUES
('$RESTAURANT_ID_1', 'Merchant Bistro', '123 Nguyen Trai, Quan 1, HCMC', 106.660172, 10.762622, 4.8, '00:01:00', '23:59:00', '0900000000', 0, '$MERCHANT_USER_ID', 'merchant-bistro', true, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'),
('$RESTAURANT_ID_2', 'Tra Sua Ngon', '456 Hai Ba Trung, Quan 1, HCMC', 106.692403, 10.779769, 4.5, '00:01:00', '23:59:00', '0900000001', 0, '$MERCHANT_USER_ID', 'tra-sua-ngon', true, 'https://images.unsplash.com/photo-1558857563-b37103326038?w=800'),
('$RESTAURANT_ID_3', 'Pizza Corner', '789 Le Loi, Quan 1, HCMC', 106.700981, 10.776889, 4.7, '00:01:00', '23:59:00', '0900000002', 0, '$MERCHANT_USER_ID', 'pizza-corner', true, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'),
('$RESTAURANT_ID_4', 'Bun Bo Hue Ngon', '321 Le Duan, Quan 1, HCMC', 106.681172, 10.772622, 4.6, '00:01:00', '23:59:00', '0900000003', 0, '$MERCHANT_USER_ID', 'bun-bo-hue-ngon', true, 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=800'),
('$RESTAURANT_ID_5', 'Banh Mi Huynh Hoa', '555 Thu Khoa Huan, Quan 1, HCMC', 106.695403, 10.779769, 4.9, '00:01:00', '23:59:00', '0900000004', 0, '$MERCHANT_USER_ID', 'banh-mi-huynh-hoa', true, 'https://images.unsplash.com/photo-1563245836-60d4b910c67a?w=800'),
('$RESTAURANT_ID_6', 'Pho 24', '888 Dong Khoi, Quan 1, HCMC', 106.700981, 10.770889, 4.7, '00:01:00', '23:59:00', '0900000005', 0, '$MERCHANT_USER_ID', 'pho-24', true, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800')
ON CONFLICT (slug) DO UPDATE SET res_name = EXCLUDED.res_name, merchant_id = EXCLUDED.merchant_id, image_url = EXCLUDED.image_url;
SQL
    echo "✓ 6 restaurants seeded"
}

seed_products() {
    echo "Seeding products..."
    $PSQL -d product_service >/dev/null 2>&1 <<SQL
INSERT INTO products (id, product_name, description, restaurant_id, category_id, slug, available, rating, total_review, image_url) VALUES
('$PRODUCT_ID_1', 'Gà Chiên Mắm', 'Gà chiên nước mắm đậm đà', '$RESTAURANT_ID_1', '$CATEGORY_GA_ID', 'ga-chien-mam', true, 4.5, 0, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800'),
('$PRODUCT_ID_2', 'Trà Sữa Trân Châu', 'Trà sữa đặc biệt', '$RESTAURANT_ID_2', '$CATEGORY_TRA_SUA_ID', 'tra-sua-tran-chau', true, 4.6, 0, 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=800'),
('$PRODUCT_ID_3', 'Pizza Hải Sản', 'Pizza hải sản tươi ngon', '$RESTAURANT_ID_3', '$CATEGORY_PIZZA_ID', 'pizza-hai-san', true, 4.8, 0, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'),
('$PRODUCT_ID_4', 'Cơm Tấm Sườn Bì', 'Cơm tấm sườn bì chả', '$RESTAURANT_ID_1', '$CATEGORY_COM_TAM_ID', 'com-tam-suon-bi', true, 4.7, 0, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800'),
('$PRODUCT_ID_5', 'Bún Bò Huế', 'Bún bò Huế đậm đà', '$RESTAURANT_ID_4', '$CATEGORY_BUN_BO_ID', 'bun-bo-hue', true, 4.6, 0, 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800'),
('$PRODUCT_ID_6', 'Bánh Mì Thịt', 'Bánh mì thịt đặc biệt', '$RESTAURANT_ID_5', '$CATEGORY_BANH_MI_ID', 'banh-mi-thit', true, 4.9, 0, 'https://images.unsplash.com/photo-1623246123320-0d6636755792?w=800'),
('$PRODUCT_ID_7', 'Phở Bò Tái', 'Phở bò tái ngon', '$RESTAURANT_ID_6', '$CATEGORY_PHO_ID', 'pho-bo-tai', true, 4.7, 0, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800'),
('$PRODUCT_ID_8', 'Bánh Cuốn Tôm Thịt', 'Bánh cuốn tôm thịt tươi ngon', '$RESTAURANT_ID_1', '$CATEGORY_GOI_CUON_ID', 'banh-cuon-tom-thit', true, 4.4, 0, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800'),
('$PRODUCT_ID_9', 'Gà Quay', 'Gà quay da giòn', '$RESTAURANT_ID_1', '$CATEGORY_GA_ID', 'ga-quay', true, 4.5, 0, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800'),
('$PRODUCT_ID_10', 'Trà Sữa Matcha', 'Trà sữa matcha Nhật Bản', '$RESTAURANT_ID_2', '$CATEGORY_TRA_SUA_ID', 'tra-sua-matcha', true, 4.3, 0, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800'),
('$PRODUCT_ID_11', 'Bún Riêu Cua', 'Bún riêu cua đồng tươi ngon', '$RESTAURANT_ID_1', '$CATEGORY_BUN_BO_ID', 'bun-rieu-cua', true, 4.6, 0, 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800'),
('$PRODUCT_ID_12', 'Gỏi Cuốn Tôm Thịt', 'Gỏi cuốn tôm thịt tươi', '$RESTAURANT_ID_4', '$CATEGORY_BUN_BO_ID', 'goi-cuon-tom-thit', true, 4.7, 0, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800'),
('$PRODUCT_ID_13', 'Cơm Tấm Sườn Chả', 'Cơm tấm sườn chả đầy đặn', '$RESTAURANT_ID_1', '$CATEGORY_COM_TAM_ID', 'com-tam-suon-cha', true, 4.8, 0, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800'),
('$PRODUCT_ID_14', 'Phở Tái Chín', 'Phở bò tái chín đậm đà', '$RESTAURANT_ID_6', '$CATEGORY_PHO_ID', 'pho-tai-chin', true, 4.5, 0, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800'),
('$PRODUCT_ID_15', 'Pizza Bò Nướng', 'Pizza bò nướng Hàn Quốc', '$RESTAURANT_ID_3', '$CATEGORY_PIZZA_ID', 'pizza-bo-nuong', true, 4.9, 0, 'https://images.unsplash.com/photo-1520201163981-8cc95007dd2a?w=800')
ON CONFLICT (slug) DO UPDATE SET product_name = EXCLUDED.product_name, category_id = EXCLUDED.category_id, image_url = EXCLUDED.image_url;
SQL
    echo "✓ 15 products seeded"
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
('00000000-0000-0000-4000-000000000010', '$PRODUCT_ID_4', '$SIZE_M_ID', 50000),
('00000000-0000-0000-4000-000000000011', '$PRODUCT_ID_5', '$SIZE_M_ID', 45000),
('00000000-0000-0000-4000-000000000012', '$PRODUCT_ID_5', '$SIZE_L_ID', 55000),
('00000000-0000-0000-4000-000000000013', '$PRODUCT_ID_6', '$SIZE_S_ID', 35000),
('00000000-0000-0000-4000-000000000014', '$PRODUCT_ID_6', '$SIZE_M_ID', 40000),
('00000000-0000-0000-4000-000000000015', '$PRODUCT_ID_7', '$SIZE_M_ID', 50000),
('00000000-0000-0000-4000-000000000016', '$PRODUCT_ID_7', '$SIZE_L_ID', 60000),
('00000000-0000-0000-4000-000000000017', '$PRODUCT_ID_8', '$SIZE_S_ID', 25000),
('00000000-0000-0000-4000-000000000018', '$PRODUCT_ID_8', '$SIZE_M_ID', 30000),
('00000000-0000-0000-4000-000000000019', '$PRODUCT_ID_9', '$SIZE_S_ID', 48000),
('00000000-0000-0000-4000-000000000020', '$PRODUCT_ID_9', '$SIZE_M_ID', 58000),
('00000000-0000-0000-4000-000000000021', '$PRODUCT_ID_9', '$SIZE_L_ID', 68000),
('00000000-0000-0000-4000-000000000022', '$PRODUCT_ID_10', '$SIZE_S_ID', 32000),
('00000000-0000-0000-4000-000000000023', '$PRODUCT_ID_10', '$SIZE_M_ID', 37000),
('00000000-0000-0000-4000-000000000024', '$PRODUCT_ID_11', '$SIZE_M_ID', 42000),
('00000000-0000-0000-4000-000000000025', '$PRODUCT_ID_11', '$SIZE_L_ID', 52000),
('00000000-0000-0000-4000-000000000026', '$PRODUCT_ID_12', '$SIZE_S_ID', 28000),
('00000000-0000-0000-4000-000000000027', '$PRODUCT_ID_12', '$SIZE_M_ID', 32000),
('00000000-0000-0000-4000-000000000028', '$PRODUCT_ID_13', '$SIZE_S_ID', 45000),
('00000000-0000-0000-4000-000000000029', '$PRODUCT_ID_13', '$SIZE_M_ID', 55000),
('00000000-0000-0000-4000-000000000030', '$PRODUCT_ID_14', '$SIZE_M_ID', 48000),
('00000000-0000-0000-4000-000000000031', '$PRODUCT_ID_14', '$SIZE_L_ID', 58000),
('00000000-0000-0000-4000-000000000032', '$PRODUCT_ID_15', '$SIZE_M_ID', 150000),
('00000000-0000-0000-4000-000000000033', '$PRODUCT_ID_15', '$SIZE_L_ID', 220000)
ON CONFLICT DO NOTHING;
SQL
    echo "✓ 33 product sizes seeded"
}

seed_query_service() {
    echo "Seeding query service read models..."
    $PSQL -d query_service >/dev/null 2>&1 <<SQL
-- Clear existing
TRUNCATE TABLE restaurant_read_model, product_read_model RESTART IDENTITY CASCADE;

-- Restaurants read model
INSERT INTO restaurant_read_model (id, name, slug, address, phone, image_url, enabled, opening_time, closing_time, latitude, longitude, rating, review_count, merchant_id, created_at, updated_at) VALUES
('$RESTAURANT_ID_1', 'Merchant Bistro', 'merchant-bistro', '123 Nguyen Trai, Quan 1, HCMC', '0900000000', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', true, '00:01:00', '23:59:00', 10.762622, 106.660172, 4.8, 0, '$MERCHANT_USER_ID', NOW(), NOW()),
('$RESTAURANT_ID_2', 'Tra Sua Ngon', 'tra-sua-ngon', '456 Hai Ba Trung, Quan 1, HCMC', '0900000001', 'https://images.unsplash.com/photo-1558857563-b37103326038?w=800', true, '00:01:00', '23:59:00', 10.779769, 106.692403, 4.5, 0, '$MERCHANT_USER_ID', NOW(), NOW()),
('$RESTAURANT_ID_3', 'Pizza Corner', 'pizza-corner', '789 Le Loi, Quan 1, HCMC', '0900000002', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800', true, '00:01:00', '23:59:00', 10.776889, 106.700981, 4.7, 0, '$MERCHANT_USER_ID', NOW(), NOW()),
('$RESTAURANT_ID_4', 'Bun Bo Hue Ngon', 'bun-bo-hue-ngon', '321 Le Duan, Quan 1, HCMC', '0900000003', 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=800', true, '00:01:00', '23:59:00', 10.772622, 106.681172, 4.6, 0, '$MERCHANT_USER_ID', NOW(), NOW()),
('$RESTAURANT_ID_5', 'Banh Mi Huynh Hoa', 'banh-mi-huynh-hoa', '555 Thu Khoa Huan, Quan 1, HCMC', '0900000004', 'https://images.unsplash.com/photo-1563245836-60d4b910c67a?w=800', true, '00:01:00', '23:59:00', 10.779769, 106.695403, 4.9, 0, '$MERCHANT_USER_ID', NOW(), NOW()),
('$RESTAURANT_ID_6', 'Pho 24', 'pho-24', '888 Dong Khoi, Quan 1, HCMC', '0900000005', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800', true, '00:01:00', '23:59:00', 10.770889, 106.700981, 4.7, 0, '$MERCHANT_USER_ID', NOW(), NOW());

-- Update geometry for restaurants
UPDATE restaurant_read_model SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);

-- Products read model
INSERT INTO product_read_model (id, name, slug, description, image_url, available, category_id, category_name, restaurant_id, restaurant_name, restaurant_latitude, restaurant_longitude, min_price, max_price, rating, review_count, created_at, updated_at) VALUES
('$PRODUCT_ID_1', 'Gà Chiên Mắm', 'ga-chien-mam', 'Gà chiên nước mắm đậm đà', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800', true, '$CATEGORY_GA_ID', 'Gà', '$RESTAURANT_ID_1', 'Merchant Bistro', 10.762622, 106.660172, 45000, 65000, 4.5, 0, NOW(), NOW()),
('$PRODUCT_ID_2', 'Trà Sữa Trân Châu', 'tra-sua-tran-chau', 'Trà sữa đặc biệt', 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=800', true, '$CATEGORY_TRA_SUA_ID', 'Trà sữa', '$RESTAURANT_ID_2', 'Tra Sua Ngon', 10.779769, 106.692403, 30000, 40000, 4.6, 0, NOW(), NOW()),
('$PRODUCT_ID_3', 'Pizza Hải Sản', 'pizza-hai-san', 'Pizza hải sản tươi ngon', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', true, '$CATEGORY_PIZZA_ID', 'Pizza', '$RESTAURANT_ID_3', 'Pizza Corner', 10.776889, 106.700981, 120000, 180000, 4.8, 0, NOW(), NOW()),
('$PRODUCT_ID_4', 'Cơm Tấm Sườn Bì', 'com-tam-suon-bi', 'Cơm tấm sườn bì chả', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800', true, '$CATEGORY_COM_TAM_ID', 'Cơm tấm', '$RESTAURANT_ID_1', 'Merchant Bistro', 10.762622, 106.660172, 40000, 50000, 4.7, 0, NOW(), NOW()),
('$PRODUCT_ID_5', 'Bún Bò Huế', 'bun-bo-hue', 'Bún bò Huế đậm đà', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800', true, '$CATEGORY_BUN_BO_ID', 'Bún bò', '$RESTAURANT_ID_4', 'Bun Bo Hue Ngon', 10.772622, 106.681172, 45000, 55000, 4.6, 0, NOW(), NOW()),
('$PRODUCT_ID_6', 'Bánh Mì Thịt', 'banh-mi-thit', 'Bánh mì thịt đặc biệt', 'https://images.unsplash.com/photo-1623246123320-0d6636755792?w=800', true, '$CATEGORY_BANH_MI_ID', 'Bánh mì', '$RESTAURANT_ID_5', 'Banh Mi Huynh Hoa', 10.779769, 106.695403, 35000, 40000, 4.9, 0, NOW(), NOW()),
('$PRODUCT_ID_7', 'Phở Bò Tái', 'pho-bo-tai', 'Phở bò tái ngon', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800', true, '$CATEGORY_PHO_ID', 'Phở', '$RESTAURANT_ID_6', 'Pho 24', 10.770889, 106.700981, 50000, 60000, 4.7, 0, NOW(), NOW()),
('$PRODUCT_ID_8', 'Bánh Cuốn Tôm Thịt', 'banh-cuon-tom-thit', 'Bánh cuốn tôm thịt tươi ngon', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800', true, '$CATEGORY_GOI_CUON_ID', 'Bánh cuốn', '$RESTAURANT_ID_1', 'Merchant Bistro', 10.762622, 106.660172, 25000, 30000, 4.4, 0, NOW(), NOW()),
('$PRODUCT_ID_9', 'Gà Quay', 'ga-quay', 'Gà quay da giòn', 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800', true, '$CATEGORY_GA_ID', 'Gà', '$RESTAURANT_ID_1', 'Merchant Bistro', 10.762622, 106.660172, 48000, 68000, 4.5, 0, NOW(), NOW()),
('$PRODUCT_ID_10', 'Trà Sữa Matcha', 'tra-sua-matcha', 'Trà sữa matcha Nhật Bản', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800', true, '$CATEGORY_TRA_SUA_ID', 'Trà sữa', '$RESTAURANT_ID_2', 'Tra Sua Ngon', 10.779769, 106.692403, 32000, 37000, 4.3, 0, NOW(), NOW()),
('$PRODUCT_ID_11', 'Bún Riêu Cua', 'bun-rieu-cua', 'Bún riêu cua đồng tươi ngon', 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800', true, '$CATEGORY_BUN_BO_ID', 'Bún bò', '$RESTAURANT_ID_1', 'Merchant Bistro', 10.762622, 106.660172, 42000, 52000, 4.6, 0, NOW(), NOW()),
('$PRODUCT_ID_12', 'Gỏi Cuốn Tôm Thịt', 'goi-cuon-tom-thit', 'Gỏi cuốn tôm thịt tươi', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800', true, '$CATEGORY_BUN_BO_ID', 'Bún bò', '$RESTAURANT_ID_4', 'Bun Bo Hue Ngon', 10.772622, 106.681172, 28000, 32000, 4.7, 0, NOW(), NOW()),
('$PRODUCT_ID_13', 'Cơm Tấm Sườn Chả', 'com-tam-suon-cha', 'Cơm tấm sườn chả đầy đặn', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800', true, '$CATEGORY_COM_TAM_ID', 'Cơm tấm', '$RESTAURANT_ID_1', 'Merchant Bistro', 10.762622, 106.660172, 45000, 55000, 4.8, 0, NOW(), NOW()),
('$PRODUCT_ID_14', 'Phở Tái Chín', 'pho-tai-chin', 'Phở bò tái chín đậm đà', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800', true, '$CATEGORY_PHO_ID', 'Phở', '$RESTAURANT_ID_6', 'Pho 24', 10.770889, 106.700981, 48000, 58000, 4.5, 0, NOW(), NOW()),
('$PRODUCT_ID_15', 'Pizza Bò Nướng', 'pizza-bo-nuong', 'Pizza bò nướng Hàn Quốc', 'https://images.unsplash.com/photo-1520201163981-8cc95007dd2a?w=800', true, '$CATEGORY_PIZZA_ID', 'Pizza', '$RESTAURANT_ID_3', 'Pizza Corner', 10.776889, 106.700981, 150000, 220000, 4.9, 0, NOW(), NOW());

-- Update geometry for products
UPDATE product_read_model SET geom = ST_SetSRID(ST_MakePoint(restaurant_longitude, restaurant_latitude), 4326);
SQL
    echo "✓ Query service seeded (6 restaurants, 15 products)"
}

seed_reviews() {
    echo "Seeding reviews..."
    $PSQL -d review_service >/dev/null 2>&1 <<SQL
INSERT INTO reviews (id, user_id, review_id, review_type, title, content, rating) VALUES
-- Restaurant reviews
('$REVIEW_ID_1', '$CUSTOMER_USER_ID', '$RESTAURANT_ID_1', 'RESTAURANT', 'Quán rất ngon', 'Món ăn ngon, không gian thoải mái.', 4.8),
('$REVIEW_ID_2', '$ADMIN_USER_ID', '$RESTAURANT_ID_2', 'RESTAURANT', 'Tra sữa tuyệt vời', 'Trà sữa đậm đà, trân châu dai.', 4.5),
('$REVIEW_ID_3', '$CUSTOMER_USER_ID', '$RESTAURANT_ID_3', 'RESTAURANT', 'Pizza ngon', 'Pizza nhiều topping, giá hợp lý.', 4.7),
('$REVIEW_ID_4', '$ADMIN_USER_ID', '$RESTAURANT_ID_4', 'RESTAURANT', 'Bún bò đậm đà', 'Hương vị Huế chính gốc, rất hợp khẩu vị.', 4.6),
('$REVIEW_ID_5', '$CUSTOMER_USER_ID', '$RESTAURANT_ID_5', 'RESTAURANT', 'Bánh mì đặc biệt', 'Bánh mì đầy topping, nhân generosity.', 4.9),
('$REVIEW_ID_6', '$ADMIN_USER_ID', '$RESTAURANT_ID_6', 'RESTAURANT', 'Phở ngon', 'Nước dùng ngọt, thịt bò tươi.', 4.7),
-- Product reviews
('$REVIEW_ID_7', '$ADMIN_USER_ID', '$PRODUCT_ID_1', 'PRODUCT', 'Gà chiên giòn ngon', 'Gà chiên nước mắm đậm đà, vỏ giòn.', 4.5),
('$REVIEW_ID_8', '$CUSTOMER_USER_ID', '$PRODUCT_ID_4', 'PRODUCT', 'Cơm tấm chuẩn vị', 'Cơm tấm sườn bì chả đầy đặn.', 4.7),
('$REVIEW_ID_9', '$ADMIN_USER_ID', '$PRODUCT_ID_5', 'PRODUCT', 'Bún bòHuế tuyệt vời', 'Nước lèo đậm đà, thịt bò mềm.', 4.6),
('$REVIEW_ID_10', '$CUSTOMER_USER_ID', '$PRODUCT_ID_6', 'PRODUCT', 'Bánh mì ngon nhất', 'Pate bơ thơm, đồ ăn tươi.', 4.9),
('$REVIEW_ID_11', '$ADMIN_USER_ID', '$PRODUCT_ID_7', 'PRODUCT', 'Phở bò tươi', 'Nước dùng trong, thái bò mỏng.', 4.7),
('$REVIEW_ID_12', '$CUSTOMER_USER_ID', '$PRODUCT_ID_9', 'PRODUCT', 'Gà quay giòn', 'Da giòn ruột mềm, nước chấm ngon.', 4.5),
-- More reviews for PRODUCT_ID_1 (Gà Chiên Mắm)
('$REVIEW_ID_13', '$CUSTOMER_USER_ID', '$PRODUCT_ID_1', 'PRODUCT', 'Gà chiên ngon tuyệt', 'Món gà chiên nước mắm rất đậm đà, thịt mềm.', 5.0),
('$REVIEW_ID_14', '$ADMIN_USER_ID', '$PRODUCT_ID_1', 'PRODUCT', 'Hương vị tuyệt vời', 'Nước mắm vừa phải, gà không bị khô.', 4.5),
('$REVIEW_ID_15', '$CUSTOMER_USER_ID', '$PRODUCT_ID_1', 'PRODUCT', 'Sẽ order lại', 'Món này rất hợp với cơm trắng.', 4.8),
('$REVIEW_ID_16', '$ADMIN_USER_ID', '$PRODUCT_ID_1', 'PRODUCT', 'Gà tươi ngon', 'Gà tươi, chiên giòn, nước mắm đậm đà.', 4.7),
('$REVIEW_ID_17', '$CUSTOMER_USER_ID', '$PRODUCT_ID_1', 'PRODUCT', 'Quá ngon!', 'Món ăn tuyệt vời, phục vụ nhanh.', 5.0),
('$REVIEW_ID_18', '$ADMIN_USER_ID', '$PRODUCT_ID_1', 'PRODUCT', 'Đáng thử', 'Hương vị độc đáo, giá hợp lý.', 4.4),
('$REVIEW_ID_19', '$CUSTOMER_USER_ID', '$PRODUCT_ID_1', 'PRODUCT', 'Gà chiên nước mắm', 'Món ăn truyền thống được làm rất tốt.', 4.6),
('$REVIEW_ID_20', '$ADMIN_USER_ID', '$PRODUCT_ID_1', 'PRODUCT', 'Ngon lắm', 'Thịt gà mềm, nước mắm đậm đà.', 4.8),
('$REVIEW_ID_21', '$CUSTOMER_USER_ID', '$PRODUCT_ID_1', 'PRODUCT', 'Khuyến nghị', 'Món này rất ngon, nên thử!', 4.9),
('$REVIEW_ID_22', '$ADMIN_USER_ID', '$PRODUCT_ID_1', 'PRODUCT', 'Gà chiên', 'Chiên giòn, không bị ngấy.', 4.5)
ON CONFLICT DO NOTHING;
SQL
    echo "✓ 22 reviews seeded (10 for PRODUCT_ID_1)"
}

seed_order_service() {
        echo "Seeding order service (cart + orders)..."
        "${MONGOSH[@]}" <<'MONGO'
const customerId = UUID('00000000-0000-0000-0000-000000000001');
const merchantId = UUID('00000000-0000-0000-0000-000000000003');
const adminId = UUID('00000000-0000-0000-0000-000000000002');

const restaurant1Id = UUID('00000000-0000-0000-1000-000000000001');
const restaurant2Id = UUID('00000000-0000-0000-1000-000000000002');
const restaurant3Id = UUID('00000000-0000-0000-1000-000000000003');

const product1Id = UUID('00000000-0000-0000-2000-000000000001');
const product2Id = UUID('00000000-0000-0000-2000-000000000002');
const product3Id = UUID('00000000-0000-0000-2000-000000000003');
const product4Id = UUID('00000000-0000-0000-2000-000000000004');

const product1SizeM = UUID('00000000-0000-0000-4000-000000000002');
const product2SizeM = UUID('00000000-0000-0000-4000-000000000005');
const product3SizeL = UUID('00000000-0000-0000-4000-000000000008');
const product4SizeS = UUID('00000000-0000-0000-4000-000000000009');

const now = new Date('2026-05-22T08:00:00Z');
const later = new Date('2026-05-22T09:00:00Z');

db.carts.updateOne(
    { _id: customerId.toString() },
    {
        $set: {
            userId: customerId,
            restaurants: [
                {
                    restaurantId: restaurant1Id,
                    restaurantName: 'Merchant Bistro',
                    items: [
                        {
                            productId: product1Id,
                            productSizeId: product1SizeM,
                            productName: 'Gà Chiên Mắm',
                            sizeName: 'M',
                            price: NumberDecimal('55000'),
                            quantity: 2,
                            imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800'
                        },
                        {
                            productId: product4Id,
                            productSizeId: product4SizeS,
                            productName: 'Cơm Tấm Sườn Bì',
                            sizeName: 'S',
                            price: NumberDecimal('40000'),
                            quantity: 1,
                            imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800'
                        }
                    ]
                },
                {
                    restaurantId: restaurant2Id,
                    restaurantName: 'Tra Sua Ngon',
                    items: [
                        {
                            productId: product2Id,
                            productSizeId: product2SizeM,
                            productName: 'Trà Sữa Trân Châu',
                            sizeName: 'M',
                            price: NumberDecimal('35000'),
                            quantity: 1,
                            imageUrl: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=800'
                        }
                    ]
                }
            ],
            updatedAt: later
        }
    },
    { upsert: true }
);

db.orders.deleteMany({
    _id: {
        $in: [UUID('00000000-0000-0000-5000-000000000001'), UUID('00000000-0000-0000-5000-000000000002'), UUID('00000000-0000-0000-5000-000000000003')]
    }
});

db.orders.insertMany([
    {
        _id: UUID('00000000-0000-0000-5000-000000000001'),
        userId: customerId,
        restaurantId: restaurant1Id,
        merchantId: merchantId,
        restaurantName: 'Merchant Bistro',
        items: [
            {
                productId: product1Id,
                productSizeId: product1SizeM,
                productName: 'Gà Chiên Mắm',
                sizeName: 'M',
                price: NumberDecimal('55000'),
                quantity: 1
            },
            {
                productId: product4Id,
                productSizeId: product4SizeS,
                productName: 'Cơm Tấm Sườn Bì',
                sizeName: 'S',
                price: NumberDecimal('40000'),
                quantity: 1
            }
        ],
        totalPrice: NumberDecimal('95000'),
        deliveryAddress: '123 Nguyen Trai, Quan 1, HCMC',
        note: 'Giao buổi tối',
        cancelReason: null,
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        orderCode: NumberLong('100000000001'),
        paymentLinkId: 'pay_100000000001',
        createdAt: now,
        updatedAt: later
    },
    {
        _id: UUID('00000000-0000-0000-5000-000000000002'),
        userId: customerId,
        restaurantId: restaurant2Id,
        merchantId: merchantId,
        restaurantName: 'Tra Sua Ngon',
        items: [
            {
                productId: product2Id,
                productSizeId: product2SizeM,
                productName: 'Trà Sữa Trân Châu',
                sizeName: 'M',
                price: NumberDecimal('35000'),
                quantity: 2
            }
        ],
        totalPrice: NumberDecimal('70000'),
        deliveryAddress: '456 Hai Ba Trung, Quan 1, HCMC',
        note: 'Không đá',
        cancelReason: null,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        orderCode: NumberLong('100000000002'),
        paymentLinkId: null,
        createdAt: now,
        updatedAt: now
    },
    {
        _id: UUID('00000000-0000-0000-5000-000000000003'),
        userId: adminId,
        restaurantId: restaurant3Id,
        merchantId: merchantId,
        restaurantName: 'Pizza Corner',
        items: [
            {
                productId: product3Id,
                productSizeId: product3SizeL,
                productName: 'Pizza Hải Sản',
                sizeName: 'L',
                price: NumberDecimal('180000'),
                quantity: 1
            }
        ],
        totalPrice: NumberDecimal('180000'),
        deliveryAddress: '789 Le Loi, Quan 1, HCMC',
        note: 'Gọi trước khi giao',
        cancelReason: null,
        status: 'DELIVERING',
        paymentStatus: 'PAID',
        orderCode: NumberLong('100000000003'),
        paymentLinkId: 'pay_100000000003',
        createdAt: now,
        updatedAt: later
    }
]);

print('✓ 1 cart and 3 orders seeded');
MONGO
        echo "✓ Order service seeded"
}

seed_payment_service() {
    echo "Seeding payment service..."
    $PSQL -d payment_service >/dev/null 2>&1 <<SQL
INSERT INTO payment_transactions (id, user_id, order_id, order_code, amount, status, payment_link_id, created_at, updated_at) VALUES
('00000000-0000-0000-6000-000000000001', '$CUSTOMER_USER_ID', '$ORDER_ID_1', 100000000001, 95000, 'PAID', 'pay_100000000001', NOW() - INTERVAL '1 hour', NOW()),
('00000000-0000-0000-6000-000000000002', '$ADMIN_USER_ID', '$ORDER_ID_3', 100000000003, 180000, 'PAID', 'pay_100000000003', NOW() - INTERVAL '30 minutes', NOW())
ON CONFLICT (order_code) DO NOTHING;
SQL
    echo "✓ 2 payment transactions seeded"
}

main() {
    echo "=========================================="
    echo "Database Seeding"
    echo "=========================================="
    echo ""

    wait_for_postgres
    wait_for_databases
    wait_for_mongo
    fetch_reference_ids
    seed_user_service
    seed_restaurants
    seed_products
    seed_product_sizes
    seed_query_service
    seed_reviews
    seed_order_service
    seed_payment_service

    echo ""
    echo "=========================================="
    echo "✓ Seeding complete!"
    echo "=========================================="
    echo "Users: merchant / testmerchant123"
    echo "       test_user / testuser123"
    echo "       admin_manager / testadmin123"
}

main
