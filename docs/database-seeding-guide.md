# Database Seeding Guide

This guide explains how to populate the database with initial data for the Restaurant Management System.

## Overview

The system uses a **fixed user ID approach** for seeding, which eliminates the need to query Keycloak API during seeding. All seed data uses predictable UUIDs that match the Keycloak realm configuration.

## Prerequisites

- Docker and Docker Compose installed
- All services running (`docker compose up -d`)
- PostgreSQL container healthy

## Quick Start

### Local Development

```bash
# 1. Start all services
docker compose up -d

# 2. Wait for containers to be healthy (~30 seconds)
docker compose ps

# 3. Run the seeding script
./backend/seed-db/seed-all.sh
```

### Verify Seeded Data

```bash
# Check users
docker compose exec -T postgres psql -U postgres -d user_service -c "SELECT id, username FROM users;"

# Check restaurants
docker compose exec -T postgres psql -U postgres -d restaurant_service -c "SELECT id, res_name FROM restaurants;"

# Check products
docker compose exec -T postgres psql -U postgres -d product_service -c "SELECT id, product_name FROM products;"
```

## Architecture

### Fixed User IDs

| Username | Role | Fixed UUID | Password |
|----------|------|------------|----------|
| `merchant` | MERCHANT | `00000000-0000-0000-0000-000000000003` | testmerchant123 |
| `test_user` | USER | `00000000-0000-0000-0000-000000000001` | testuser123 |
| `admin_manager` | ADMIN | `00000000-0000-0000-0000-000000000002` | testadmin123 |

These IDs are defined in:
- `/deploy/realm.json` (Keycloak configuration)
- `/backend/seed-db/seed-all.sh` (Seeding script)

### Entity ID Schema

All seed data uses predictable UUIDs:

| Entity Type | UUID Pattern |
|-------------|--------------|
| Users | `00000000-0000-0000-0000-00000000000X` |
| Restaurants | `00000000-0000-0000-1000-00000000000X` |
| Products | `00000000-0000-0000-2000-00000000000X` |
| Reviews | `00000000-0000-0000-3000-00000000000X` |
| Product Sizes | `00000000-0000-0000-4000-00000000000X` |

## Seeding Process

### What Gets Seeded

1. **Static Reference Data** (via PostgreSQL init)
   - Categories: Gà, Trà sữa, Pizza, Cơm tấm, Bún bò, etc.
   - Sizes: S, M, L, XL

2. **User Data** (via seed-all.sh)
   - 3 users matching Keycloak realm

3. **Restaurants** (via seed-all.sh)
   - Merchant Bistro
   - Tra Sua Ngon
   - Pizza Corner

4. **Products** (via seed-all.sh)
   - Gà Chiên Mắm
   - Trà Sữa Trân Châu
   - Pizza Hải Sản
   - Cơm Tấm Sườn Bì

5. **Product Sizes** (via seed-all.sh)
   - Various sizes with prices for each product

6. **Query Service Read Models** (via sync-query-service.sh)
   - Populated from source databases

7. **Reviews** (via seed-all.sh)
   - 4 sample reviews

### Dependency Order

```
1. catalog_service (categories, sizes) - Static data
2. user_service (users) - Fixed IDs
3. restaurant_service (restaurants) - Requires user IDs
4. product_service (products) - Requires restaurant + category IDs
5. product_sizes - Requires product + size IDs
6. query_service (read models) - Sync from sources
7. review_service (reviews) - Requires user + product/restaurant IDs
```

## Script Details

### seed-all.sh

Main seeding script that orchestrates the entire process.

**Location:** `/backend/seed-db/seed-all.sh`

**Steps:**
1. `wait_for_postgres()` - Waits for PostgreSQL to be ready
2. `wait_for_databases()` - Verifies all databases exist
3. `fetch_reference_ids()` - Gets category and size IDs
4. `seed_user_service()` - Inserts users
5. `seed_restaurants()` - Inserts restaurants
6. `seed_products()` - Inserts products
7. `seed_product_sizes()` - Inserts product sizes
8. `sync_query_service()` - Populates read models
9. `seed_reviews()` - Inserts reviews

### sync-query-service.sh

Populates query service read models from source databases.

**Location:** `/backend/seed-db/sync-query-service.sh`

**What it does:**
- Truncates existing read models
- Copies data from restaurant_service and product_service
- Updates PostGIS geometry points
- Calculates min/max prices for products

### catalog_service_data.sql

Static reference data seeded during PostgreSQL initialization.

**Location:** `/backend/seed-db/catalog_service_data.sql`

**Contents:**
- Vietnamese food categories
- Standard product sizes

## Production Deployment

### Automatic Seeding

For production, seeding is integrated into the deployment process:

```bash
# In /deploy/update-containers.sh (end of script)
sleep 60  # Wait for init scripts
bash ./seed-db/seed-all.sh
```

### Manual Seeding (Production)

If automatic seeding fails:

```bash
# SSH into production server
ssh user@production-server

# Navigate to deployment directory
cd /home/user/restaurant/v1.0.0

# Run seeding
./seed-db/seed-all.sh
```

## Troubleshooting

### Issue: "Database does not exist"

**Cause:** PostgreSQL init scripts haven't finished running.

**Solution:**
```bash
# Wait longer before running seed-all.sh
docker compose logs postgres | grep "database system is ready"
```

### Issue: "Category ID not found"

**Cause:** `catalog_service_data.sql` didn't run or category name doesn't match.

**Solution:**
```bash
# Check if categories exist
docker compose exec -T postgres psql -U postgres -d catalog_service \
  -c "SELECT * FROM categories;"

# Re-run init if needed
docker compose down -v
docker compose up -d
```

### Issue: "Foreign key violation"

**Cause:** Dependency order violated.

**Solution:**
1. Ensure `seed-all.sh` runs completely
2. Don't skip steps
3. Check logs for which step failed

### Issue: "Cross-database query fails"

**Cause:** Attempting to query across PostgreSQL databases without FDW.

**Solution:** Use the updated `seed-all.sh` which connects to each database separately.

## Resetting Data

### Complete Reset

```bash
# Stop and remove all volumes
docker compose down -v

# Start fresh
docker compose up -d

# Re-seed
./backend/seed-db/seed-all.sh
```

### Partial Reset

```bash
# Reset specific database
docker compose exec -T postgres psql -U postgres -d restaurant_service \
  -c "TRUNCATE TABLE restaurants CASCADE;"

# Re-run seeding
./backend/seed-db/seed-all.sh
```

## Adding New Seed Data

### Adding a New Restaurant

Edit `/backend/seed-db/seed-all.sh`:

```bash
# Add new ID variable
RESTAURANT_ID_4="00000000-0000-0000-1000-000000000004"

# Add to seed_restaurants()
INSERT INTO restaurants (
    id, res_name, address, longitude, latitude, rating,
    opening_time, closing_time, phone, total_review,
    merchant_id, slug, enabled
) VALUES
('$RESTAURANT_ID_4',
 'New Restaurant',
 'New Address',
 106.xxx, 10.xxx, 4.5,
 '10:00:00', '22:00:00',
 '0900000003', 0,
 '$MERCHANT_USER_ID',
 'new-restaurant', true)
ON CONFLICT (slug) DO UPDATE SET ...
```

### Adding a New Category

1. Edit `/backend/seed-db/catalog_service_data.sql`:
```sql
INSERT INTO categories (cate_name) VALUES
('New Category')
ON CONFLICT (cate_name) DO NOTHING;
```

2. Edit `/backend/seed-db/seed-all.sh` to fetch the new category:
```bash
CATEGORY_NEW_ID=$($PSQL -d catalog_service -tA -c "SELECT id FROM categories WHERE cate_name = 'New Category' LIMIT 1;")
```

## Best Practices

1. **Always use fixed IDs** for seed data to ensure consistency
2. **Use `ON CONFLICT` clauses** to make scripts idempotent
3. **Validate data exists** before using its ID
4. **Log each step** for easy debugging
5. **Test locally** before deploying to production
6. **Keep seed data minimal** - only what's needed for testing

## Security Considerations

- Seed scripts contain admin credentials
- Don't commit production data to repository
- Use separate seed realm for development
- Fixed IDs should only be used for seed data
- Production users will have normal random UUIDs

## Related Documentation

- [Database Schema Validation](../database-schema-validation-report.md)
- [Database Seeding Plan](../database-seeding-plan.md)
- [Docker Deployment](./docker-deployment.md)
