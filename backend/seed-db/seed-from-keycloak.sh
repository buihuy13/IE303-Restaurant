#!/bin/bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)

cd "$REPO_ROOT"

ensure_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "$cmd not found" >&2
    exit 1
  fi
}

docker_postgres_available() {
  local container_id

  if ! command -v docker >/dev/null 2>&1; then
    return 1
  fi

  container_id=$(docker compose ps -q postgres 2>/dev/null || true)
  [[ -n "$container_id" ]]
}

determine_db_mode() {
  case "$SEED_DB_MODE" in
    docker)
      DB_MODE="docker"
      ;;
    local)
      DB_MODE="local"
      ;;
    auto)
      if docker_postgres_available; then
        DB_MODE="docker"
      else
        DB_MODE="local"
      fi
      ;;
    *)
      echo "Invalid SEED_DB_MODE: $SEED_DB_MODE (expected: auto|docker|local)" >&2
      exit 1
      ;;
  esac
}

set -a
source "$REPO_ROOT/.env"
set +a

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:9090/auth}"
REALM="${KEYCLOAK_REALM:-restaurant-realm}"
ADMIN_USER="${KEYCLOAK_ADMIN:-admin}"
ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin}"
SEED_DB_MODE="${SEED_DB_MODE:-auto}"

LOCAL_DB_HOST="${LOCAL_DB_HOST:-localhost}"
LOCAL_DB_PORT="${LOCAL_DB_PORT:-5432}"
LOCAL_DB_USER="${LOCAL_DB_USER:-${POSTGRES_USER:-postgres}}"
LOCAL_DB_PASSWORD="${LOCAL_DB_PASSWORD:-${DB_PASSWORD:-1}}"

determine_db_mode

ensure_command curl
ensure_command jq

if [[ "$DB_MODE" == "docker" ]]; then
  ensure_command docker
else
  ensure_command psql
  ensure_command pg_isready
fi

echo "Database mode: $DB_MODE"

declare -a KEYCLOAK_USERNAMES=("test_user" "admin_manager" "merchant")
declare -A USER_IDS
declare -A USER_ROLES
declare -A USER_EMAILS

new_uuid() {
  cat /proc/sys/kernel/random/uuid
}

slugify() {
  printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | tr '_' '-'
}

run_sql() {
  local database_name="$1"

  if [[ "$DB_MODE" == "docker" ]]; then
    docker compose exec -T -u postgres postgres psql -U postgres -d "$database_name" -v ON_ERROR_STOP=1
  else
    if [[ -n "$LOCAL_DB_PASSWORD" ]]; then
      PGPASSWORD="$LOCAL_DB_PASSWORD" psql \
        -h "$LOCAL_DB_HOST" \
        -p "$LOCAL_DB_PORT" \
        -U "$LOCAL_DB_USER" \
        -d "$database_name" \
        -v ON_ERROR_STOP=1
    else
      psql \
        -h "$LOCAL_DB_HOST" \
        -p "$LOCAL_DB_PORT" \
        -U "$LOCAL_DB_USER" \
        -d "$database_name" \
        -v ON_ERROR_STOP=1
    fi
  fi
}

sql_scalar() {
  local database_name="$1"
  local sql_query="$2"

  if [[ "$DB_MODE" == "docker" ]]; then
    printf '%s\n' "$sql_query" | docker compose exec -T -u postgres postgres psql -U postgres -d "$database_name" -tAq -v ON_ERROR_STOP=1 | tr -d '\r'
  else
    if [[ -n "$LOCAL_DB_PASSWORD" ]]; then
      printf '%s\n' "$sql_query" | PGPASSWORD="$LOCAL_DB_PASSWORD" psql \
        -h "$LOCAL_DB_HOST" \
        -p "$LOCAL_DB_PORT" \
        -U "$LOCAL_DB_USER" \
        -d "$database_name" \
        -tAq \
        -v ON_ERROR_STOP=1 | tr -d '\r'
    else
      printf '%s\n' "$sql_query" | psql \
        -h "$LOCAL_DB_HOST" \
        -p "$LOCAL_DB_PORT" \
        -U "$LOCAL_DB_USER" \
        -d "$database_name" \
        -tAq \
        -v ON_ERROR_STOP=1 | tr -d '\r'
    fi
  fi
}

wait_for_postgres() {
  echo "Waiting for postgres to be ready..."

  if [[ "$DB_MODE" == "docker" ]]; then
    until docker compose exec -T -u postgres postgres pg_isready -U postgres -d postgres >/dev/null 2>&1; do
      sleep 2
    done
  else
    if [[ -n "$LOCAL_DB_PASSWORD" ]]; then
      until PGPASSWORD="$LOCAL_DB_PASSWORD" pg_isready \
        -h "$LOCAL_DB_HOST" \
        -p "$LOCAL_DB_PORT" \
        -U "$LOCAL_DB_USER" \
        -d postgres >/dev/null 2>&1; do
        sleep 2
      done
    else
      until pg_isready \
        -h "$LOCAL_DB_HOST" \
        -p "$LOCAL_DB_PORT" \
        -U "$LOCAL_DB_USER" \
        -d postgres >/dev/null 2>&1; do
        sleep 2
      done
    fi
  fi
}

get_admin_token() {
  curl -fsS -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=password" \
    -d "client_id=admin-cli" \
    -d "username=$ADMIN_USER" \
    -d "password=$ADMIN_PASSWORD" | jq -r '.access_token'
}

get_keycloak_user_json() {
  local token="$1"
  local username="$2"
  curl -fsS "$KEYCLOAK_URL/admin/realms/$REALM/users?username=$username&exact=true" \
    -H "Authorization: Bearer $token"
}

get_keycloak_user_role() {
  local token="$1"
  local user_id="$2"
  local roles

  roles=$(curl -fsS "$KEYCLOAK_URL/admin/realms/$REALM/users/$user_id/role-mappings/realm" \
    -H "Authorization: Bearer $token" | jq -r '.[].name' | tr '\n' ' ')

  if [[ "$roles" == *"ADMIN"* ]]; then
    printf 'ADMIN'
  elif [[ "$roles" == *"MERCHANT"* ]]; then
    printf 'MERCHANT'
  else
    printf 'USER'
  fi
}

seed_user_service() {
  local user_id="$1"
  local username="$2"
  local email="$3"
  local slug

  slug=$(slugify "$username")

  cat <<SQL | run_sql user_service
INSERT INTO users (id, username, email, phone, slug)
VALUES ('$user_id', '$username', '$email', NULL, '$slug')
ON CONFLICT (id) DO UPDATE
SET username = EXCLUDED.username,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    slug = EXCLUDED.slug,
    updated_at = CURRENT_TIMESTAMP;
SQL
}

ensure_category() {
  local category_name="$1"

  cat <<SQL | run_sql restaurant_service
INSERT INTO categories (cate_name)
VALUES ('$category_name')
ON CONFLICT (cate_name) DO NOTHING;
SQL
}

ensure_size() {
  local size_name="$1"

  cat <<SQL | run_sql restaurant_service
INSERT INTO size (name)
VALUES ('$size_name')
ON CONFLICT (name) DO NOTHING;
SQL
}

upsert_product_size() {
  local product_id="$1"
  local size_id="$2"
  local price="$3"

  cat <<SQL | run_sql restaurant_service
UPDATE product_sizes
SET price = $price
WHERE product_id = '$product_id' AND size_id = '$size_id';

INSERT INTO product_sizes (id, product_id, size_id, price)
SELECT gen_random_uuid(), '$product_id', '$size_id', $price
WHERE NOT EXISTS (
  SELECT 1 FROM product_sizes
  WHERE product_id = '$product_id' AND size_id = '$size_id'
);
SQL
}

seed_restaurant_service() {
  local merchant_user_id="$1"
  local admin_user_id="$2"
  local customer_user_id="$3"

  local category_main_id category_drink_id category_dessert_id
  local size_s_id size_m_id size_l_id
  local restaurant_main_id restaurant_pho_id restaurant_pizza_id
  local product_rice_id product_milk_id product_pho_id product_coffee_id product_pizza_id product_tiramisu_id
  local review_restaurant_id review_product_id

  ensure_category "Mon chinh"
  ensure_category "Do uong"
  ensure_category "Trang mieng"
  ensure_size "S"
  ensure_size "M"
  ensure_size "L"

  category_main_id=$(sql_scalar restaurant_service "SELECT id FROM categories WHERE cate_name = 'Mon chinh' LIMIT 1;")
  category_drink_id=$(sql_scalar restaurant_service "SELECT id FROM categories WHERE cate_name = 'Do uong' LIMIT 1;")
  category_dessert_id=$(sql_scalar restaurant_service "SELECT id FROM categories WHERE cate_name = 'Trang mieng' LIMIT 1;")
  size_s_id=$(sql_scalar restaurant_service "SELECT id FROM size WHERE name = 'S' LIMIT 1;")
  size_m_id=$(sql_scalar restaurant_service "SELECT id FROM size WHERE name = 'M' LIMIT 1;")
  size_l_id=$(sql_scalar restaurant_service "SELECT id FROM size WHERE name = 'L' LIMIT 1;")

  restaurant_main_id=$(new_uuid)
  restaurant_pho_id=$(new_uuid)
  restaurant_pizza_id=$(new_uuid)

  product_rice_id=$(new_uuid)
  product_milk_id=$(new_uuid)
  product_pho_id=$(new_uuid)
  product_coffee_id=$(new_uuid)
  product_pizza_id=$(new_uuid)
  product_tiramisu_id=$(new_uuid)

  review_restaurant_id=$(new_uuid)
  review_product_id=$(new_uuid)

  cat <<SQL | run_sql restaurant_service
INSERT INTO restaurants (
  id, res_name, address, longitude, latitude, rating,
  opening_time, closing_time, image_url, public_id,
  phone, total_review, merchant_id, slug, enabled
)
VALUES (
  '$restaurant_main_id',
  'Merchant Bistro',
  '123 Nguyen Trai, Ho Chi Minh City',
  106.660172,
  10.762622,
  4.8,
  '08:00:00',
  '22:00:00',
  NULL,
  NULL,
  '0900000000',
  0,
  '$merchant_user_id',
  'merchant-bistro',
  TRUE
)
ON CONFLICT (slug) DO UPDATE
SET res_name = EXCLUDED.res_name,
    address = EXCLUDED.address,
    longitude = EXCLUDED.longitude,
    latitude = EXCLUDED.latitude,
    rating = EXCLUDED.rating,
    opening_time = EXCLUDED.opening_time,
    closing_time = EXCLUDED.closing_time,
    phone = EXCLUDED.phone,
    merchant_id = EXCLUDED.merchant_id,
    enabled = EXCLUDED.enabled,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO restaurants (
  id, res_name, address, longitude, latitude, rating,
  opening_time, closing_time, image_url, public_id,
  phone, total_review, merchant_id, slug, enabled
)
VALUES (
  '$restaurant_pho_id',
  'Pho Corner',
  '88 Le Loi, Ho Chi Minh City',
  106.700981,
  10.776889,
  4.5,
  '06:30:00',
  '21:30:00',
  NULL,
  NULL,
  '0900000011',
  0,
  '$merchant_user_id',
  'pho-corner',
  TRUE
)
ON CONFLICT (slug) DO UPDATE
SET res_name = EXCLUDED.res_name,
    address = EXCLUDED.address,
    longitude = EXCLUDED.longitude,
    latitude = EXCLUDED.latitude,
    rating = EXCLUDED.rating,
    opening_time = EXCLUDED.opening_time,
    closing_time = EXCLUDED.closing_time,
    phone = EXCLUDED.phone,
    merchant_id = EXCLUDED.merchant_id,
    enabled = EXCLUDED.enabled,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO restaurants (
  id, res_name, address, longitude, latitude, rating,
  opening_time, closing_time, image_url, public_id,
  phone, total_review, merchant_id, slug, enabled
)
VALUES (
  '$restaurant_pizza_id',
  'Pizza Garden',
  '45 Vo Van Tan, Ho Chi Minh City',
  106.690215,
  10.782116,
  4.7,
  '10:00:00',
  '23:00:00',
  NULL,
  NULL,
  '0900000022',
  0,
  '$merchant_user_id',
  'pizza-garden',
  TRUE
)
ON CONFLICT (slug) DO UPDATE
SET res_name = EXCLUDED.res_name,
    address = EXCLUDED.address,
    longitude = EXCLUDED.longitude,
    latitude = EXCLUDED.latitude,
    rating = EXCLUDED.rating,
    opening_time = EXCLUDED.opening_time,
    closing_time = EXCLUDED.closing_time,
    phone = EXCLUDED.phone,
    merchant_id = EXCLUDED.merchant_id,
    enabled = EXCLUDED.enabled,
    updated_at = CURRENT_TIMESTAMP;
SQL

  restaurant_main_id=$(sql_scalar restaurant_service "SELECT id FROM restaurants WHERE slug = 'merchant-bistro' LIMIT 1;")
  restaurant_pho_id=$(sql_scalar restaurant_service "SELECT id FROM restaurants WHERE slug = 'pho-corner' LIMIT 1;")
  restaurant_pizza_id=$(sql_scalar restaurant_service "SELECT id FROM restaurants WHERE slug = 'pizza-garden' LIMIT 1;")

  cat <<SQL | run_sql restaurant_service
INSERT INTO restaurant_categories (restaurant_id, category_id)
VALUES ('$restaurant_main_id', '$category_main_id')
ON CONFLICT DO NOTHING;

INSERT INTO restaurant_categories (restaurant_id, category_id)
VALUES ('$restaurant_main_id', '$category_drink_id')
ON CONFLICT DO NOTHING;

INSERT INTO restaurant_categories (restaurant_id, category_id)
VALUES ('$restaurant_pho_id', '$category_main_id')
ON CONFLICT DO NOTHING;

INSERT INTO restaurant_categories (restaurant_id, category_id)
VALUES ('$restaurant_pho_id', '$category_drink_id')
ON CONFLICT DO NOTHING;

INSERT INTO restaurant_categories (restaurant_id, category_id)
VALUES ('$restaurant_pizza_id', '$category_main_id')
ON CONFLICT DO NOTHING;

INSERT INTO restaurant_categories (restaurant_id, category_id)
VALUES ('$restaurant_pizza_id', '$category_dessert_id')
ON CONFLICT DO NOTHING;
SQL

  cat <<SQL | run_sql restaurant_service
INSERT INTO products (
  id, product_name, description, restaurant_id,
  image_url, public_id, category_id, total_review,
  rating, slug, available
)
VALUES (
  '$product_rice_id',
  'Com ga chien',
  'Mon chinh dau bep de xuat',
  '$restaurant_main_id',
  NULL,
  NULL,
  '$category_main_id',
  0,
  4.7,
  'com-ga-chien',
  TRUE
)
ON CONFLICT (slug) DO UPDATE
SET product_name = EXCLUDED.product_name,
    description = EXCLUDED.description,
    restaurant_id = EXCLUDED.restaurant_id,
    category_id = EXCLUDED.category_id,
    rating = EXCLUDED.rating,
    available = EXCLUDED.available,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO products (
  id, product_name, description, restaurant_id,
  image_url, public_id, category_id, total_review,
  rating, slug, available
)
VALUES (
  '$product_milk_id',
  'Tra sua truyen thong',
  'Do uong ban chay cua quan',
  '$restaurant_main_id',
  NULL,
  NULL,
  '$category_drink_id',
  0,
  4.6,
  'tra-sua-truyen-thong',
  TRUE
)
ON CONFLICT (slug) DO UPDATE
SET product_name = EXCLUDED.product_name,
    description = EXCLUDED.description,
    restaurant_id = EXCLUDED.restaurant_id,
    category_id = EXCLUDED.category_id,
    rating = EXCLUDED.rating,
    available = EXCLUDED.available,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO products (
  id, product_name, description, restaurant_id,
  image_url, public_id, category_id, total_review,
  rating, slug, available
)
VALUES (
  '$product_pho_id',
  'Pho bo tai',
  'Pho bo tai nuoc trong, phuc vu nong',
  '$restaurant_pho_id',
  NULL,
  NULL,
  '$category_main_id',
  0,
  4.8,
  'pho-bo-tai',
  TRUE
)
ON CONFLICT (slug) DO UPDATE
SET product_name = EXCLUDED.product_name,
    description = EXCLUDED.description,
    restaurant_id = EXCLUDED.restaurant_id,
    category_id = EXCLUDED.category_id,
    rating = EXCLUDED.rating,
    available = EXCLUDED.available,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO products (
  id, product_name, description, restaurant_id,
  image_url, public_id, category_id, total_review,
  rating, slug, available
)
VALUES (
  '$product_coffee_id',
  'Cafe sua da',
  'Cafe sua da dam vi truyen thong',
  '$restaurant_pho_id',
  NULL,
  NULL,
  '$category_drink_id',
  0,
  4.4,
  'cafe-sua-da',
  TRUE
)
ON CONFLICT (slug) DO UPDATE
SET product_name = EXCLUDED.product_name,
    description = EXCLUDED.description,
    restaurant_id = EXCLUDED.restaurant_id,
    category_id = EXCLUDED.category_id,
    rating = EXCLUDED.rating,
    available = EXCLUDED.available,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO products (
  id, product_name, description, restaurant_id,
  image_url, public_id, category_id, total_review,
  rating, slug, available
)
VALUES (
  '$product_pizza_id',
  'Pizza hai san',
  'Pizza de mo phong du lieu menu da dang',
  '$restaurant_pizza_id',
  NULL,
  NULL,
  '$category_main_id',
  0,
  4.9,
  'pizza-hai-san',
  TRUE
)
ON CONFLICT (slug) DO UPDATE
SET product_name = EXCLUDED.product_name,
    description = EXCLUDED.description,
    restaurant_id = EXCLUDED.restaurant_id,
    category_id = EXCLUDED.category_id,
    rating = EXCLUDED.rating,
    available = EXCLUDED.available,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO products (
  id, product_name, description, restaurant_id,
  image_url, public_id, category_id, total_review,
  rating, slug, available
)
VALUES (
  '$product_tiramisu_id',
  'Tiramisu',
  'Ban ngot trang mieng phu hop sau bua an',
  '$restaurant_pizza_id',
  NULL,
  NULL,
  '$category_dessert_id',
  0,
  4.6,
  'tiramisu',
  TRUE
)
ON CONFLICT (slug) DO UPDATE
SET product_name = EXCLUDED.product_name,
    description = EXCLUDED.description,
    restaurant_id = EXCLUDED.restaurant_id,
    category_id = EXCLUDED.category_id,
    rating = EXCLUDED.rating,
    available = EXCLUDED.available,
    updated_at = CURRENT_TIMESTAMP;
SQL

  # Resolve persisted product IDs after UPSERT by slug to avoid FK mismatch.
  product_rice_id=$(sql_scalar restaurant_service "SELECT id FROM products WHERE slug = 'com-ga-chien' LIMIT 1;")
  product_milk_id=$(sql_scalar restaurant_service "SELECT id FROM products WHERE slug = 'tra-sua-truyen-thong' LIMIT 1;")
  product_pho_id=$(sql_scalar restaurant_service "SELECT id FROM products WHERE slug = 'pho-bo-tai' LIMIT 1;")
  product_coffee_id=$(sql_scalar restaurant_service "SELECT id FROM products WHERE slug = 'cafe-sua-da' LIMIT 1;")
  product_pizza_id=$(sql_scalar restaurant_service "SELECT id FROM products WHERE slug = 'pizza-hai-san' LIMIT 1;")
  product_tiramisu_id=$(sql_scalar restaurant_service "SELECT id FROM products WHERE slug = 'tiramisu' LIMIT 1;")

  upsert_product_size "$product_rice_id" "$size_m_id" 49000
  upsert_product_size "$product_rice_id" "$size_l_id" 59000
  upsert_product_size "$product_milk_id" "$size_s_id" 29000
  upsert_product_size "$product_milk_id" "$size_m_id" 35000
  upsert_product_size "$product_pho_id" "$size_m_id" 65000
  upsert_product_size "$product_coffee_id" "$size_s_id" 25000
  upsert_product_size "$product_pizza_id" "$size_m_id" 129000
  upsert_product_size "$product_pizza_id" "$size_l_id" 169000
  upsert_product_size "$product_tiramisu_id" "$size_s_id" 45000

  cat <<SQL | run_sql restaurant_service
DELETE FROM reviews
WHERE user_id = '$customer_user_id'
  AND review_id = '$restaurant_main_id'
  AND review_type = 'RESTAURANT';

INSERT INTO reviews (id, user_id, review_id, review_type, title, content, rating)
VALUES (
  '$review_restaurant_id',
  '$customer_user_id',
  '$restaurant_main_id',
  'RESTAURANT',
  'Quan an ngon',
  'Mon an va khong gian phu hop de tra nghiem.',
  4.8
);

DELETE FROM reviews
WHERE user_id = '$admin_user_id'
  AND review_id = '$restaurant_pizza_id'
  AND review_type = 'RESTAURANT';

INSERT INTO reviews (id, user_id, review_id, review_type, title, content, rating)
VALUES (
  gen_random_uuid(),
  '$admin_user_id',
  '$restaurant_pizza_id',
  'RESTAURANT',
  'Khong gian tot',
  'Quan dong nhung phuc vu nhanh, menu da dang.',
  4.6
);

DELETE FROM reviews
WHERE user_id = '$admin_user_id'
  AND review_id = '$product_rice_id'
  AND review_type = 'PRODUCT';

INSERT INTO reviews (id, user_id, review_id, review_type, title, content, rating)
VALUES (
  '$review_product_id',
  '$admin_user_id',
  '$product_rice_id',
  'PRODUCT',
  'San pham on dinh',
  'Gia hop ly, chat luong phu hop cho seed demo.',
  4.5
);

DELETE FROM reviews
WHERE user_id = '$customer_user_id'
  AND review_id = '$product_pizza_id'
  AND review_type = 'PRODUCT';

INSERT INTO reviews (id, user_id, review_id, review_type, title, content, rating)
VALUES (
  gen_random_uuid(),
  '$customer_user_id',
  '$product_pizza_id',
  'PRODUCT',
  'Pizza de an',
  'De an va nhieu topping, phu hop an nhom.',
  4.7
);
SQL
}

wait_for_postgres

ADMIN_TOKEN=$(get_admin_token)
echo "Got Keycloak admin token"

for username in "${KEYCLOAK_USERNAMES[@]}"; do
  user_json=$(get_keycloak_user_json "$ADMIN_TOKEN" "$username")
  user_id=$(printf '%s' "$user_json" | jq -r '.[0].id // empty')
  user_email=$(printf '%s' "$user_json" | jq -r '.[0].email // empty')

  if [[ -z "$user_id" ]]; then
    echo "Cannot find Keycloak user: $username" >&2
    exit 1
  fi

  USER_IDS["$username"]="$user_id"
  USER_EMAILS["$username"]="$user_email"
  USER_ROLES["$username"]=$(get_keycloak_user_role "$ADMIN_TOKEN" "$user_id")

  echo "Seed user_service for $username ($user_id, ${USER_ROLES[$username]})"
  seed_user_service "$user_id" "$username" "$user_email"
done

seed_restaurant_service \
  "${USER_IDS[merchant]}" \
  "${USER_IDS[admin_manager]}" \
  "${USER_IDS[test_user]}"

echo "Seed from Keycloak completed successfully."