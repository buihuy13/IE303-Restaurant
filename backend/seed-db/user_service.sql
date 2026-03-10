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
