-- Migration: Add venteliste table for course waitlist functionality
-- This table stores users who want to be on the waitlist when a course is full

-- First, create the table without foreign keys
CREATE TABLE IF NOT EXISTS venteliste (
    id VARCHAR(255) PRIMARY KEY,
    bruker_id VARCHAR(255) NOT NULL,
    kurs_id INT NOT NULL,
    tidspunkt_tekst VARCHAR(255) NOT NULL,
    studiesuppe VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_kurs_tidspunkt (kurs_id, tidspunkt_tekst),
    INDEX idx_created_at (created_at),
    INDEX idx_bruker_id (bruker_id),
    INDEX idx_kurs_id (kurs_id),
    UNIQUE KEY unique_user_kurs_tidspunkt (bruker_id, kurs_id, tidspunkt_tekst)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign keys separately (this allows us to see specific errors if they occur)
-- Note: If these fail, the table will still work without foreign key constraints
-- You can check the actual table structures with: SHOW CREATE TABLE bruker; and SHOW CREATE TABLE kurs;

-- Add foreign key for bruker_id (only if bruker table exists and id column matches)
-- Uncomment and adjust if needed:
-- ALTER TABLE venteliste 
--     ADD CONSTRAINT fk_venteliste_bruker 
--     FOREIGN KEY (bruker_id) REFERENCES bruker(id) ON DELETE CASCADE;

-- Add foreign key for kurs_id (only if kurs table exists and id column matches)
-- Uncomment and adjust if needed:
-- ALTER TABLE venteliste 
--     ADD CONSTRAINT fk_venteliste_kurs 
--     FOREIGN KEY (kurs_id) REFERENCES kurs(id) ON DELETE CASCADE;

