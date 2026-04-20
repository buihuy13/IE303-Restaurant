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
