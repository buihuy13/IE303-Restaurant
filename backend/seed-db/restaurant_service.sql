CREATE EXTENSION IF NOT EXISTS postgis;


CREATE TABLE restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    res_name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326), -- PostGIS geometry column
    rating REAL,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    image_url VARCHAR(255),
    public_id VARCHAR(255),
    phone VARCHAR(15),
    total_review INTEGER DEFAULT 0,
    merchant_id UUID NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    enabled BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index for geom (CRITICAL for performance!)
CREATE INDEX idx_restaurants_geom_geog 
ON restaurants 
USING GIST ((geom::geography));

-- Other indexes
CREATE INDEX idx_restaurants_rating ON restaurants(rating);
CREATE INDEX idx_restaurants_merchant ON restaurants(merchant_id);
CREATE INDEX idx_restaurants_enabled ON restaurants(enabled);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);

-- Trigger to auto-update geom from lat/lon
CREATE OR REPLACE FUNCTION update_restaurant_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restaurants_geom_trigger
BEFORE INSERT OR UPDATE OF longitude, latitude ON restaurants
FOR EACH ROW
EXECUTE FUNCTION update_restaurant_geom();

CREATE TABLE restaurant_categories (
    restaurant_id UUID NOT NULL,
    category_id UUID NOT NULL,
    PRIMARY KEY (restaurant_id, category_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE INDEX idx_restaurant_categories_restaurant ON restaurant_categories(restaurant_id);
CREATE INDEX idx_restaurant_categories_category ON restaurant_categories(category_id);

CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    image_url VARCHAR(255),
    public_id VARCHAR(255),
    category_id UUID NOT NULL,
    total_review INTEGER DEFAULT 0,
    rating REAL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    available BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for products
CREATE INDEX idx_products_restaurant ON products(restaurant_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_products_available ON products(available);
CREATE INDEX idx_products_slug ON products(slug);


CREATE TABLE product_sizes (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL,
    size_id UUID NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (size_id) REFERENCES size(id) ON DELETE CASCADE,
    CONSTRAINT unique_product_size UNIQUE (product_id, size_id)
);

CREATE INDEX idx_product_sizes_product ON product_sizes(product_id);
CREATE INDEX idx_product_sizes_size ON product_sizes(size_id);

CREATE TABLE reviews (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    rating REAL,
    review_id UUID NOT NULL,
    review_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_review INTEGER,
    user_id UUID NOT NULL
);

CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_review ON reviews(review_id);
CREATE INDEX idx_reviews_type ON reviews(review_type);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Helper function: Get nearby restaurants
CREATE OR REPLACE FUNCTION get_nearby_restaurants(
    user_latitude DOUBLE PRECISION,
    user_longitude DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 5000,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id VARCHAR,
    res_name VARCHAR,
    address VARCHAR,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    rating REAL,
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.res_name,
        r.address,
        r.latitude,
        r.longitude,
        r.rating,
        ST_Distance(
            r.geom::geography,
            ST_SetSRID(ST_MakePoint(user_longitude, user_latitude), 4326)::geography
        ) AS distance_meters
    FROM restaurants r
    WHERE 
        r.enabled = true
        AND ST_DWithin(
            r.geom::geography,
            ST_SetSRID(ST_MakePoint(user_longitude, user_latitude), 4326)::geography,
            radius_meters
        )
    ORDER BY distance_meters
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;