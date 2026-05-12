CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    restaurant_id UUID NOT NULL,
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
    CONSTRAINT unique_product_size UNIQUE (product_id, size_id)
);

CREATE INDEX idx_product_sizes_product ON product_sizes(product_id);
CREATE INDEX idx_product_sizes_size ON product_sizes(size_id);