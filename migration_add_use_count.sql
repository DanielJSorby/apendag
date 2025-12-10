-- Migration: Add use_count column to magic_link table
-- This allows tokens to be used multiple times (e.g., for email scanner + user)
-- Run this migration to fix the issue where Microsoft email clients consume tokens
-- 
-- Usage: Run this SQL script against your database to add the use_count column
-- 
-- Note: If the column already exists, you'll get an error - that's OK, just continue
-- with the UPDATE statements below.

-- Add use_count column (will error if column already exists - that's fine)
ALTER TABLE magic_link ADD COLUMN use_count INT DEFAULT 0;

-- Update existing records: if used = TRUE, set use_count = 1, otherwise keep 0
UPDATE magic_link 
SET use_count = CASE WHEN used = TRUE THEN 1 ELSE 0 END
WHERE use_count IS NULL OR (used = TRUE AND use_count = 0);

-- Add index for better query performance
-- (Drop first if it exists - will error if it doesn't exist, that's fine)
DROP INDEX idx_magic_link_use_count ON magic_link;
CREATE INDEX idx_magic_link_use_count ON magic_link(use_count);

-- Verify the migration
SELECT 
    COUNT(*) as total_links,
    SUM(CASE WHEN use_count IS NULL THEN 1 ELSE 0 END) as null_count,
    SUM(CASE WHEN used = TRUE AND use_count = 0 THEN 1 ELSE 0 END) as inconsistent_count
FROM magic_link;

