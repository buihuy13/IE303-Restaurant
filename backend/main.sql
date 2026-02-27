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

create table address (
    id UUID DEFAULT gen_random_uuid() primary key,
    location varchar(255) not null,
    longitude DOUBLE PRECISION not null,
    latitude DOUBLE PRECISION not null,
    user_id UUID not null references users(id)
);

create index idx_userid on address(user_id);

-- Tạo db chat_service trước
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