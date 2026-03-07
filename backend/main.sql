-- Tạo các db trước nếu chưa có
-- CREATE DATABASE IF user_service;
-- CREATE DATABASE IF chat_service;

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
    user_id UUID not null references users(id)
);

create index idx_userid on address(user_id);

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
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

create table restaurants (
    id varchar(255) primary key,
    res_name varchar(255) not null,
    address varchar(255),
    longitude double precision,
    latitude double precision,
    rating real default 0,
    opening_time time not null,
    closing_time time not null,
    phone varchar(25),
    image_url text,
    public_id varchar(255),
    merchant_id varchar(255) not null,
    enabled boolean default false,
    total_review int default 0,
    slug varchar(255),
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    geom geometry(Point,4326)
);

create unique index idx_restaurants_slug on restaurants(slug);
create index idx_restaurants_merchant on restaurants(merchant_id);
create index idx_restaurants_enabled on restaurants(enabled);

create table categories (
    id varchar(255) primary key,
    cate_name varchar(255) not null unique
);

create table restaurant_categories (
    restaurant_id varchar(255) not null references restaurants(id) on delete cascade,
    category_id varchar(255) not null references categories(id) on delete cascade,
    primary key (restaurant_id, category_id)
);

create table products (
    id varchar(255) primary key,
    product_name varchar(255) not null,
    description text,
    image_url text,
    public_id varchar(255),
    category_id varchar(255) not null references categories(id),
    available boolean default true,
    rating real default 0,
    total_review int default 0,
    restaurant_id varchar(255) not null references restaurants(id) on delete cascade,
    slug varchar(255),
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

create unique index idx_products_slug on products(slug);
create index idx_products_restaurant on products(restaurant_id);
create index idx_products_category on products(category_id);

create table size (
    id varchar(255) primary key,
    name varchar(255) not null
);

create table product_sizes (
    id varchar(255) primary key,
    product_id varchar(255) not null references products(id) on delete cascade,
    size_id varchar(255) not null references size(id),
    price numeric(12,2) not null,
    unique (product_id, size_id)
);

create index idx_product_sizes_product on product_sizes(product_id);
create index idx_product_sizes_size on product_sizes(size_id);

create table reviews (
    id varchar(255) primary key,
    user_id varchar(255) not null,
    review_id varchar(255),
    review_type varchar(25),
    title varchar(255),
    content text,
    rating real,
    created_at timestamp default current_timestamp
);

create index idx_reviews_review on reviews(review_type, review_id);