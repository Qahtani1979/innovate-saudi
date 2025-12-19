-- ============================================
-- CHALLENGES SYSTEM RLS FIXES (Corrected)
-- ============================================

-- 1. FIX: challenge_proposals - Add provider INSERT and staff SELECT policies

CREATE POLICY "Providers can submit proposals"
ON public.challenge_proposals
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view own proposals"
ON public.challenge_proposals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
      AND (
        up.user_email = challenge_proposals.reviewed_by
        OR up.organization_id = challenge_proposals.organization_id
      )
  )
);

CREATE POLICY "Users can update own proposals"
ON public.challenge_proposals
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
      AND up.organization_id = challenge_proposals.organization_id
  )
  AND status IN ('draft', 'submitted')
);

CREATE POLICY "Staff can view proposals for own municipality challenges"
ON public.challenge_proposals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM challenges c
    JOIN user_roles ur ON ur.municipality_id = c.municipality_id
    JOIN roles r ON ur.role_id = r.id
    WHERE c.id = challenge_proposals.challenge_id
      AND ur.user_id = auth.uid()
      AND ur.is_active = true
      AND lower(r.name) IN ('municipality staff', 'municipality admin', 'municipality director', 'municipality manager', 'challenge lead', 'challenge reviewer')
  )
);

CREATE POLICY "Staff can update proposals for own municipality challenges"
ON public.challenge_proposals
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM challenges c
    JOIN user_roles ur ON ur.municipality_id = c.municipality_id
    JOIN roles r ON ur.role_id = r.id
    WHERE c.id = challenge_proposals.challenge_id
      AND ur.user_id = auth.uid()
      AND ur.is_active = true
      AND lower(r.name) IN ('municipality staff', 'municipality admin', 'municipality director', 'municipality manager', 'challenge lead', 'challenge reviewer')
  )
);

-- 2. FIX: challenge_solution_matches - Add staff management policies

CREATE POLICY "Staff can manage matches for own municipality challenges"
ON public.challenge_solution_matches
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM challenges c
    JOIN user_roles ur ON ur.municipality_id = c.municipality_id
    JOIN roles r ON ur.role_id = r.id
    WHERE c.id = challenge_solution_matches.challenge_id
      AND ur.user_id = auth.uid()
      AND ur.is_active = true
      AND lower(r.name) IN ('municipality staff', 'municipality admin', 'municipality director', 'municipality manager', 'challenge lead', 'challenge reviewer', 'matchmaker manager')
  )
);

-- 3. FIX: challenges table - Expand staff policy to include more roles

DROP POLICY IF EXISTS "Municipality staff can manage own challenges" ON public.challenges;

CREATE POLICY "Municipality staff can manage own challenges"
ON public.challenges
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND ur.municipality_id = challenges.municipality_id
      AND lower(r.name) IN (
        'municipality staff', 'municipality admin', 'municipality director', 
        'municipality manager', 'municipality coordinator', 'municipality innovation officer',
        'challenge lead', 'challenge reviewer'
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND ur.municipality_id = challenges.municipality_id
      AND lower(r.name) IN (
        'municipality staff', 'municipality admin', 'municipality director', 
        'municipality manager', 'municipality coordinator', 'municipality innovation officer',
        'challenge lead', 'challenge reviewer'
      )
  )
);

-- 4. Add Deputyship staff view policy for challenges
CREATE POLICY "Deputyship staff can view all challenges"
ON public.challenges
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND lower(r.name) IN ('deputyship staff', 'deputyship admin', 'deputyship director', 'deputyship analyst', 'deputyship manager')
  )
);

-- 5. Add Deputyship staff view policy for challenge_proposals
CREATE POLICY "Deputyship staff can view all proposals"
ON public.challenge_proposals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND lower(r.name) IN ('deputyship staff', 'deputyship admin', 'deputyship director', 'deputyship analyst', 'deputyship manager')
  )
);