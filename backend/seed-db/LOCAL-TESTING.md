# Local Database Testing Guide

This guide helps you set up and seed databases for local testing without Docker.

## Prerequisites

1. **PostgreSQL installed** with PostGIS extension
   - Ubuntu/Debian: `sudo apt install postgresql postgresql-contrib postgis`
   - macOS: `brew install postgresql postgis`

2. **Ensure PostGIS extension is available**
   ```bash
   # Check if PostGIS is installed
   psql -U postgres -c "SELECT PostGIS_Version();"
   ```

## Quick Start

### 1. Create Databases

```bash
cd backend/seed-db
chmod +x setup-local-db.sh init-local-schemas.sh seed-local.sh
./setup-local-db.sh
```

### 2. Initialize Schemas (Create Tables)

```bash
./init-local-schemas.sh
```

**Note:** This uses the SQL schema files in `seed-db/` to create the table structures.

### 3. Seed Data

```bash
./seed-local.sh
```

This creates the following databases:
- `user_service`
- `catalog_service`
- `restaurant_service`
- `product_service`
- `review_service`
- `query_service`

### 2. Seed Databases

```bash
chmod +x seed-local.sh
./seed-local.sh
```

### 3. Run Services

Set your database connection in each service's `application.properties` or as environment variables:

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/<database_name>
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=your_password
```

Or modify `application.properties` for each service:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/<database_name>
spring.datasource.username=postgres
spring.datasource.password=your_password
```

## Environment Variables

You can customize the connection by setting these in your `.env` file or as environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `LOCAL_DB_HOST` | `localhost` | PostgreSQL host |
| `LOCAL_DB_PORT` | `5432` | PostgreSQL port |
| `LOCAL_DB_USER` | `postgres` | PostgreSQL username |
| `LOCAL_DB_PASSWORD` | `postgres` | PostgreSQL password |
| `USE_DOCKER` | `false` | Set to `true` to use Docker instead |

## Seeded Data

After running `seed-local.sh`, you'll have:

### Users
| Username | Password | Email |
|----------|----------|-------|
| merchant | testmerchant123 | merchant@example.com |
| test_user | testuser123 | testuser@example.com |
| admin_manager | testadmin123 | manager@example.com |

### Restaurants (3)
- Merchant Bistro
- Tra Sua Ngon
- Pizza Corner

### Products (4)
- Gà Chiên Mắm
- Trà Sữa Trân Châu
- Pizza Hải Sản
- Cơm Tấm Sườn Bì

### Reviews (4)

### Product Sizes (10)

## Enabling PostGIS for Each Database

After creating databases, enable PostGIS:

```bash
for db in user_service catalog_service restaurant_service product_service review_service query_service; do
    psql -U postgres -d $db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
done
```

## Troubleshooting

### Connection Refused
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Start PostgreSQL if needed
sudo service postgresql start  # Linux
brew services start postgresql  # macOS
```

### Permission Denied
```bash
# Ensure your user has access
sudo -u postgres psql

# Or modify pg_hba.conf to allow trust/local connections
```

### PostGIS Extension Not Found
```bash
# Install PostGIS
sudo apt install postgis postgresql-15-postgis-postgis  # Ubuntu
brew install postgis  # macOS

# Enable extension for each database
psql -U postgres -d <database_name> -c "CREATE EXTENSION postgis;"
```

## Using with Docker Services

If you want to run some services in Docker but use local PostgreSQL:

```bash
# Start only PostgreSQL in Docker
docker compose up -d postgres

# Seed using Docker mode
cd backend/seed-db
USE_DOCKER=true ./seed-local.sh
```
