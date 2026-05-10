CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cate_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE size (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_size_name ON size(name);
CREATE INDEX idx_categories_name ON categories(cate_name);
