-- Payment service PostgreSQL schema (matches JPA entity PaymentTransaction).
-- Usage:
--   1) Create DB (once): psql -U postgres -d postgres -f scripts/create-database.sql
--   2) Tables:          psql -U postgres -d payment_service -f scripts/init-payment-db.sql

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    order_id UUID NOT NULL,
    order_code BIGINT NOT NULL,
    amount BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    payment_link_id VARCHAR(255),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    CONSTRAINT uk_payment_transactions_order_code UNIQUE (order_code)
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions (order_id);

CREATE TABLE IF NOT EXISTS merchant_wallets (
    id UUID PRIMARY KEY,
    merchant_id UUID NOT NULL,
    restaurant_id UUID,
    available_balance BIGINT NOT NULL DEFAULT 0,
    pending_withdrawal BIGINT NOT NULL DEFAULT 0,
    total_earned BIGINT NOT NULL DEFAULT 0,
    total_withdrawn BIGINT NOT NULL DEFAULT 0,
    version BIGINT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    CONSTRAINT uk_merchant_wallets_merchant_id UNIQUE (merchant_id)
);

CREATE TABLE IF NOT EXISTS merchant_bank_accounts (
    id UUID PRIMARY KEY,
    merchant_id UUID NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    bank_bin VARCHAR(32) NOT NULL,
    account_number VARCHAR(255) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES merchant_wallets(id),
    merchant_id UUID NOT NULL,
    restaurant_id UUID,
    order_id UUID,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    amount BIGINT NOT NULL,
    description VARCHAR(255),
    reference_key VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    CONSTRAINT uk_wallet_transactions_reference_key UNIQUE (reference_key)
);

CREATE TABLE IF NOT EXISTS payout_batches (
    id UUID PRIMARY KEY,
    status VARCHAR(20) NOT NULL,
    total_amount BIGINT NOT NULL,
    item_count INTEGER NOT NULL,
    requested_by_admin_id UUID NOT NULL,
    provider_batch_id VARCHAR(255),
    provider_reference_id VARCHAR(255),
    provider_response_json TEXT,
    created_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS payout_requests (
    id UUID PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES merchant_wallets(id),
    merchant_id UUID NOT NULL,
    amount BIGINT NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    bank_bin VARCHAR(32) NOT NULL,
    account_number VARCHAR(255) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    note VARCHAR(255),
    rejection_reason VARCHAR(255),
    processed_by_admin_id UUID,
    provider VARCHAR(255),
    provider_reference_id VARCHAR(255),
    provider_payout_id VARCHAR(255),
    provider_response_json TEXT,
    payout_batch_id UUID REFERENCES payout_batches(id),
    wallet_transaction_id UUID REFERENCES wallet_transactions(id),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_merchant_wallets_merchant_id ON merchant_wallets (merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_bank_accounts_merchant_id ON merchant_bank_accounts (merchant_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_merchant_created ON wallet_transactions (merchant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_order_id ON wallet_transactions (order_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status_created ON payout_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payout_requests_merchant_id ON payout_requests (merchant_id);
