
-- ================================================
-- CHALLENGES SYSTEM DEEP VALIDATION FIXES
-- ================================================

-- 1. FIX CRITICAL: Remove "Allow all" SELECT policy on challenge_solution_matches
-- This is a security vulnerability - anyone can see all matches
DROP POLICY IF EXISTS "Anyone can view challenge solution matches" ON public.challenge_solution_matches;

-- Replace with proper visibility-based policy
CREATE POLICY "Published challenge matches viewable by all" 
ON public.challenge_solution_matches 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM challenges c 
    WHERE c.id = challenge_solution_matches.challenge_id 
    AND c.is_published = true 
    AND c.is_deleted = false
  )
  OR is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND ur.is_active = true
    AND lower(r.name) = ANY(ARRAY['deputyship staff', 'deputyship admin', 'deputyship director', 'deputyship analyst', 'deputyship manager'])
  )
  OR EXISTS (
    SELECT 1 FROM challenges c
    JOIN user_roles ur ON ur.municipality_id = c.municipality_id
    JOIN roles r ON ur.role_id = r.id
    WHERE c.id = challenge_solution_matches.challenge_id
    AND ur.user_id = auth.uid()
    AND ur.is_active = true
    AND lower(r.name) = ANY(ARRAY['municipality staff', 'municipality admin', 'municipality director', 'municipality manager', 'challenge lead', 'challenge reviewer'])
  )
);

-- 2. ADD MISSING INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_challenge_activities_challenge_id 
ON public.challenge_activities(challenge_id);

CREATE INDEX IF NOT EXISTS idx_challenge_attachments_challenge_id 
ON public.challenge_attachments(challenge_id);

CREATE INDEX IF NOT EXISTS idx_challenge_proposals_challenge_id 
ON public.challenge_proposals(challenge_id);

CREATE INDEX IF NOT EXISTS idx_challenge_proposals_organization_id 
ON public.challenge_proposals(organization_id);

CREATE INDEX IF NOT EXISTS idx_challenge_interests_challenge_id 
ON public.challenge_interests(challenge_id);

CREATE INDEX IF NOT EXISTS idx_challenges_created_at 
ON public.challenges(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_challenges_is_published 
ON public.challenges(is_published) WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_challenges_sector_id 
ON public.challenges(sector_id);

-- 3. ADD MISSING updated_at triggers for challenge tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- challenges table trigger
DROP TRIGGER IF EXISTS update_challenges_updated_at ON public.challenges;
CREATE TRIGGER update_challenges_updated_at
BEFORE UPDATE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- challenge_proposals table trigger
DROP TRIGGER IF EXISTS update_challenge_proposals_updated_at ON public.challenge_proposals;
CREATE TRIGGER update_challenge_proposals_updated_at
BEFORE UPDATE ON public.challenge_proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- challenge_solution_matches table trigger
DROP TRIGGER IF EXISTS update_challenge_solution_matches_updated_at ON public.challenge_solution_matches;
CREATE TRIGGER update_challenge_solution_matches_updated_at
BEFORE UPDATE ON public.challenge_solution_matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Add missing foreign key indexes for challenge_solution_matches
CREATE INDEX IF NOT EXISTS idx_challenge_solution_matches_challenge_id 
ON public.challenge_solution_matches(challenge_id);

CREATE INDEX IF NOT EXISTS idx_challenge_solution_matches_solution_id 
ON public.challenge_solution_matches(solution_id);
