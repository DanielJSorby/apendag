-- Migration: Add venteliste table for course waitlist functionality
-- This version creates the table first, then adds foreign keys to avoid charset/collation issues

-- Step 1: Create table without foreign keys
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

-- Step 2: Check table structures first (run these manually to see the actual structure):
-- SHOW CREATE TABLE bruker;
-- SHOW CREATE TABLE kurs;

-- Step 3: Add foreign keys with explicit character set matching
-- If the above tables use utf8mb4_unicode_ci, these should work:
-- If they use a different charset/collation, adjust accordingly

-- Try adding foreign key for bruker_id
-- If this fails, check the actual charset/collation of bruker.id column
ALTER TABLE venteliste 
    ADD CONSTRAINT fk_venteliste_bruker 
    FOREIGN KEY (bruker_id) REFERENCES bruker(id) ON DELETE CASCADE;

-- Try adding foreign key for kurs_id  
-- If this fails, check the actual data type of kurs.id column
ALTER TABLE venteliste 
    ADD CONSTRAINT fk_venteliste_kurs 
    FOREIGN KEY (kurs_id) REFERENCES kurs(id) ON DELETE CASCADE;

