-- Add deleted_at column to the payments tables
ALTER TABLE payments ADD COLUMN deleted_at timestamp;
ALTER TABLE dev_payments ADD COLUMN deleted_at timestamp;
