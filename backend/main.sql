-- Tạo các db trước nếu chưa có
CREATE DATABASE user_service;
CREATE DATABASE blog_service;
CREATE DATABASE chat_service;
CREATE DATABASE payment_service;
CREATE DATABASE restaurant_service;
\c user_service;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

create table users (
    id UUID DEFAULT gen_random_uuid() primary key,
    username varchar(255) not null,
    email varchar(255) unique,
    phone varchar(15),
    slug varchar(255) not null unique,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

create index idx_email on users(email);
create index idx_slug on users(slug);

create table address (
    id UUID DEFAULT gen_random_uuid() primary key,
    location varchar(255) not null,
    longitude DOUBLE PRECISION not null,
    latitude DOUBLE PRECISION not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    user_id UUID not null references users(id)
);

create index idx_userid on address(user_id);

\c blog_service;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

create table blog_posts (
    id UUID DEFAULT gen_random_uuid() primary key,
    author_id UUID not null,
    title varchar(255) not null,
    slug varchar(300) not null unique,
    content text not null,
    cover_image_url text,
    public_id varchar(255),
    status varchar(20) not null default 'DRAFT',
    published_at timestamp,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    constraint chk_blog_posts_status check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);

create index idx_blog_posts_author_id on blog_posts(author_id);
create index idx_blog_posts_status on blog_posts(status);
create index idx_blog_posts_created_at on blog_posts(created_at desc);
create index idx_blog_posts_published_at on blog_posts(published_at desc);

\c chat_service;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

create table chat_rooms (
    id UUID DEFAULT gen_random_uuid() primary key,
    user1_id UUID not null,
    user2_id UUID not null,
    last_message_time timestamp default current_timestamp,
    last_message text
);

create index idx_chat_rooms_user1 on chat_rooms(user1_id);
create index idx_chat_rooms_user2 on chat_rooms(user2_id);

create table messages (
    id UUID DEFAULT gen_random_uuid() primary key,
    sender_id UUID not null,
    receiver_id UUID not null,
    content text not null,
    room_id UUID not null references chat_rooms(id),
    timestamp timestamp default current_timestamp,
    is_read boolean default false
);

create index idx_roomid on messages(room_id);
create index idx_senderid on messages(sender_id);
create index idx_receiverid on messages(receiver_id);

-- Hiệu quả khi truy vấn tin nhắn trong một phòng theo thời gian gần nhất
CREATE INDEX idx_messages_room_timestamp ON messages(room_id, timestamp DESC);

\c restaurant_service;
CREATE EXTENSION IF NOT EXISTS postgis;
-- Categories table
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cate_name VARCHAR(100) NOT NULL UNIQUE
);

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
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_restaurant_categories_restaurant ON restaurant_categories(restaurant_id);
CREATE INDEX idx_restaurant_categories_category ON restaurant_categories(category_id);

CREATE TABLE size (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    image_url VARCHAR(255),
    public_id VARCHAR(255),
    category_id UUID NOT NULL REFERENCES categories(id),
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