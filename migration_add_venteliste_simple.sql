-- Migration: Add venteliste table for course waitlist functionality
-- Simple version without foreign keys (safer, but less referential integrity)
-- You can add foreign keys manually later after checking table structures

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

-- Note: Foreign keys are omitted to avoid charset/collation mismatch issues
-- The application code will handle referential integrity
-- If you want to add foreign keys later, first check the actual table structures:
-- SHOW CREATE TABLE bruker;
-- SHOW CREATE TABLE kurs;
-- Then match the charset/collation and data types exactly

