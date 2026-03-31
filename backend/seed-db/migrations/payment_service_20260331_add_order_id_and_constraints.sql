-- Idempotent migration for existing payment_service databases.
-- Safe to run multiple times.

ALTER TABLE payment_transactions
    ADD COLUMN IF NOT EXISTS order_id UUID;

-- Keep nullable for legacy rows created before order_id was introduced.
-- New rows are validated at API layer and created with order_id populated.

ALTER TABLE payment_transactions
    ALTER COLUMN amount TYPE BIGINT;

ALTER TABLE payment_transactions
    ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';

ALTER TABLE payment_transactions
    ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_payment_transactions_status'
    ) THEN
        ALTER TABLE payment_transactions
            ADD CONSTRAINT chk_payment_transactions_status
                CHECK (status IN ('PENDING', 'PAID', 'CANCELLED'));
    END IF;
END $$;
