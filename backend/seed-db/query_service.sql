CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE product_read_model (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    slug VARCHAR(255),
    description TEXT,
    image_url VARCHAR(500),
    available BOOLEAN,
    category_id UUID,
    category_name VARCHAR(100),
    restaurant_id UUID,
    restaurant_name VARCHAR(255),
    restaurant_latitude DECIMAL(10, 8),
    restaurant_longitude DECIMAL(11, 8),
    min_price DECIMAL(10, 2),
    max_price DECIMAL(10, 2),
    rating DECIMAL(3, 2),
    review_count INTEGER,
    geom GEOMETRY(Point, 4326), -- PostGIS geometry column
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE restaurant_read_model (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    slug VARCHAR(255),
    address VARCHAR(500),
    phone VARCHAR(20),
    image_url VARCHAR(500),
    enabled BOOLEAN,
    opening_time TIME,
    closing_time TIME,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(3, 2),
    review_count INTEGER,
    merchant_id UUID,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    geom GEOMETRY(Point, 4326)
);

CREATE INDEX idx_product_geom ON product_read_model
    USING GIST((geom::geography));

CREATE INDEX idx_restaurant_geom ON restaurant_read_model
    USING GIST((geom::geography));

-- Search & Filter indexes
CREATE INDEX idx_product_available ON product_read_model(available);
CREATE INDEX idx_product_category ON product_read_model(category_id);
CREATE INDEX idx_product_name ON product_read_model(name);
CREATE INDEX idx_product_restaurant_id ON product_read_model(restaurant_id);
CREATE INDEX idx_product_search ON product_read_model(available, name);
CREATE INDEX idx_product_price_range ON product_read_model(min_price, max_price);

CREATE INDEX idx_restaurant_enabled ON restaurant_read_model(enabled);
CREATE INDEX idx_restaurant_name ON restaurant_read_model(name);
CREATE INDEX idx_restaurant_search ON restaurant_read_model(enabled, name);
CREATE INDEX idx_restaurant_merchant ON restaurant_read_model(merchant_id);

-- Trigger to auto-update geom from lat/lon
CREATE OR REPLACE FUNCTION update_product_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.restaurant_longitude, NEW.restaurant_latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_geom_trigger
BEFORE INSERT OR UPDATE OF restaurant_longitude, restaurant_latitude ON product_read_model
FOR EACH ROW
EXECUTE FUNCTION update_product_geom();

CREATE OR REPLACE FUNCTION update_restaurant_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restaurants_geom_trigger
BEFORE INSERT OR UPDATE OF longitude, latitude ON restaurant_read_model
FOR EACH ROW
EXECUTE FUNCTION update_restaurant_geom();


