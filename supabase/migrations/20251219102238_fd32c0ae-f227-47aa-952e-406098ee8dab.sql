-- Fix #1: Add missing indexes on challenges table for performance
-- These are created CONCURRENTLY to avoid locking production tables

CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_sector_id ON public.challenges(sector_id);
CREATE INDEX IF NOT EXISTS idx_challenges_municipality_id ON public.challenges(municipality_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status_published ON public.challenges(status, is_published);
CREATE INDEX IF NOT EXISTS idx_challenges_created_at_desc ON public.challenges(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_is_deleted ON public.challenges(is_deleted);

-- Add indexes to related challenge tables
CREATE INDEX IF NOT EXISTS idx_challenge_proposals_challenge_id ON public.challenge_proposals(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_proposals_status ON public.challenge_proposals(status);
CREATE INDEX IF NOT EXISTS idx_challenge_activities_challenge_id ON public.challenge_activities(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_attachments_challenge_id ON public.challenge_attachments(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_interests_challenge_id ON public.challenge_interests(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_solution_matches_challenge_id ON public.challenge_solution_matches(challenge_id);