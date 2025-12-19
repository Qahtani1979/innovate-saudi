-- Drop duplicate/redundant indexes on challenges table
DROP INDEX IF EXISTS idx_challenges_created_at;
DROP INDEX IF EXISTS idx_challenges_municipality;