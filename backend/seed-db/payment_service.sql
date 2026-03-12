CREATE EXTENSION IF NOT EXISTS pgcrypto;

create table payment_transactions (
    id UUID DEFAULT gen_random_uuid() primary key,
    user_id UUID not null,
    order_code BIGINT not null unique,
    amount BIGINT not null,
    status varchar(20) not null default 'PENDING',
    payment_link_id varchar(255),
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp,
    constraint chk_payment_transactions_status
        check (status in ('PENDING', 'PAID', 'CANCELLED'))
);

create index idx_payment_transactions_user_id on payment_transactions(user_id);
create index idx_payment_transactions_order_code on payment_transactions(order_code);
