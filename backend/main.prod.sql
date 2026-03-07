CREATE DATABASE user_service;
CREATE DATABASE blog_service;
CREATE DATABASE chat_service;
CREATE DATABASE payment_service;
\connect user_service;

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

\connect blog_service;
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

-- Tạo db chat_service trước
\connect chat_service;
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
