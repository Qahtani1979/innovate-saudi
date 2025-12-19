-- Fix #1: Make title_ar NOT NULL
-- First update any NULL values to copy from title_en
UPDATE challenges 
SET title_ar = title_en 
WHERE title_ar IS NULL;

-- Then add NOT NULL constraint
ALTER TABLE challenges 
ALTER COLUMN title_ar SET NOT NULL;

-- Fix #2: Add missing indexes (without CONCURRENTLY for migration context)
CREATE INDEX IF NOT EXISTS idx_challenges_status 
ON challenges(status);

CREATE INDEX IF NOT EXISTS idx_challenges_sector_id 
ON challenges(sector_id);

CREATE INDEX IF NOT EXISTS idx_challenges_status_published 
ON challenges(status, is_published) 
WHERE is_deleted = false;