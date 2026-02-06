-- Tạo db user_service trước
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

-- Tạo db auth_service trước
\c auth_service;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

create table users (
    id UUID DEFAULT gen_random_uuid() primary key,
    username varchar(255) not null,
    email varchar(255) unique,
    password varchar(255),
    verification_code UUID,
    auth_provider varchar(25) not null CHECK (auth_provider IN ('LOCAL', 'FACEBOOK', 'GOOGLE', 'KEYCLOAK')),
    role varchar(25) not null CHECK (role IN ('ADMIN', 'USER', 'MERCHANT')),
    enabled boolean default false,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    activated_at timestamp
);

create index idx_email on users(email);
create index idx_username on users(username);
CREATE INDEX idx_auth_provider ON users(auth_provider);
CREATE INDEX idx_role ON users(role);