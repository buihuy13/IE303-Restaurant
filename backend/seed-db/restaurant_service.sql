CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    res_name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
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

-- Other indexes
CREATE INDEX idx_restaurants_rating ON restaurants(rating);
CREATE INDEX idx_restaurants_merchant ON restaurants(merchant_id);
CREATE INDEX idx_restaurants_enabled ON restaurants(enabled);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);