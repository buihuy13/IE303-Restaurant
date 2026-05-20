CREATE EXTENSION IF NOT EXISTS pgcrypto;

create table payment_transactions (
    id UUID DEFAULT gen_random_uuid() primary key,
    user_id UUID not null,
    order_id UUID not null,
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

create table if not exists merchant_wallets (
    id UUID DEFAULT gen_random_uuid() primary key,
    merchant_id UUID not null unique,
    restaurant_id UUID,
    available_balance BIGINT not null default 0,
    pending_withdrawal BIGINT not null default 0,
    total_earned BIGINT not null default 0,
    total_withdrawn BIGINT not null default 0,
    version BIGINT,
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

create table if not exists merchant_bank_accounts (
    id UUID DEFAULT gen_random_uuid() primary key,
    merchant_id UUID not null,
    bank_name varchar(255) not null,
    bank_bin varchar(32) not null,
    account_number varchar(255) not null,
    account_holder_name varchar(255) not null,
    is_default boolean not null default false,
    is_active boolean not null default true,
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

create table if not exists wallet_transactions (
    id UUID DEFAULT gen_random_uuid() primary key,
    wallet_id UUID not null references merchant_wallets(id),
    merchant_id UUID not null,
    restaurant_id UUID,
    order_id UUID,
    type varchar(20) not null check (type in ('EARN', 'WITHDRAW')),
    status varchar(20) not null check (status in ('PENDING', 'COMPLETED', 'REJECTED', 'FAILED')),
    amount BIGINT not null,
    description varchar(255),
    reference_key varchar(255) not null unique,
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

create table if not exists payout_batches (
    id UUID DEFAULT gen_random_uuid() primary key,
    status varchar(20) not null check (status in ('PROCESSING', 'COMPLETED', 'FAILED')),
    total_amount BIGINT not null,
    item_count integer not null,
    requested_by_admin_id UUID not null,
    provider_batch_id varchar(255),
    provider_reference_id varchar(255),
    provider_response_json text,
    created_at timestamptz default current_timestamp,
    completed_at timestamptz
);

create table if not exists payout_requests (
    id UUID DEFAULT gen_random_uuid() primary key,
    wallet_id UUID not null references merchant_wallets(id),
    merchant_id UUID not null,
    amount BIGINT not null,
    bank_name varchar(255) not null,
    bank_bin varchar(32) not null,
    account_number varchar(255) not null,
    account_holder_name varchar(255) not null,
    status varchar(20) not null check (status in ('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'FAILED')),
    note varchar(255),
    rejection_reason varchar(255),
    processed_by_admin_id UUID,
    provider varchar(255),
    provider_reference_id varchar(255),
    provider_payout_id varchar(255),
    provider_response_json text,
    payout_batch_id UUID references payout_batches(id),
    wallet_transaction_id UUID references wallet_transactions(id),
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp,
    processed_at timestamptz
);

create index if not exists idx_merchant_wallets_merchant_id on merchant_wallets(merchant_id);
create index if not exists idx_merchant_bank_accounts_merchant_id on merchant_bank_accounts(merchant_id);
create index if not exists idx_wallet_transactions_merchant_created on wallet_transactions(merchant_id, created_at desc);
create index if not exists idx_payout_requests_status_created on payout_requests(status, created_at desc);
create index if not exists idx_payout_requests_merchant_id on payout_requests(merchant_id);
