-- COMPREHENSIVE SYSTEM VALIDATION FIXES - PART 2: RLS POLICIES
-- Adding RLS policies for Sandboxes, Living Labs, Innovation Proposals

-- =============================================
-- 1. RLS POLICIES FOR SANDBOXES
-- =============================================

-- Drop existing policies safely
DROP POLICY IF EXISTS "Admins can manage sandboxes" ON public.sandboxes;
DROP POLICY IF EXISTS "Anyone can view active sandboxes" ON public.sandboxes;
DROP POLICY IF EXISTS "Staff can manage sandboxes" ON public.sandboxes;
DROP POLICY IF EXISTS "Staff can manage own municipality sandboxes" ON public.sandboxes;
DROP POLICY IF EXISTS "Deputyship staff can view all sandboxes" ON public.sandboxes;

-- Create new policies
CREATE POLICY "Admins can manage sandboxes" ON public.sandboxes
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Deputyship staff can view all sandboxes" ON public.sandboxes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND ur.is_active = true
      AND lower(r.name) = ANY(ARRAY['deputyship staff', 'deputyship admin', 'deputyship director', 'deputyship analyst', 'deputyship manager'])
    )
  );

CREATE POLICY "Staff can manage own municipality sandboxes" ON public.sandboxes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND ur.municipality_id = sandboxes.municipality_id
      AND lower(r.name) = ANY(ARRAY['municipality staff', 'municipality admin', 'municipality director', 'municipality manager', 'sandbox manager'])
    )
  );

CREATE POLICY "Anyone can view active sandboxes" ON public.sandboxes
  FOR SELECT USING (
    status IN ('active', 'operational') AND (is_deleted = false OR is_deleted IS NULL)
  );

-- =============================================
-- 2. RLS POLICIES FOR LIVING LABS
-- =============================================

DROP POLICY IF EXISTS "Admins can manage living_labs" ON public.living_labs;
DROP POLICY IF EXISTS "Anyone can view active living_labs" ON public.living_labs;
DROP POLICY IF EXISTS "Staff can manage living_labs" ON public.living_labs;
DROP POLICY IF EXISTS "Staff can manage own municipality living_labs" ON public.living_labs;
DROP POLICY IF EXISTS "Deputyship staff can view all living_labs" ON public.living_labs;

CREATE POLICY "Admins can manage living_labs" ON public.living_labs
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Deputyship staff can view all living_labs" ON public.living_labs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND ur.is_active = true
      AND lower(r.name) = ANY(ARRAY['deputyship staff', 'deputyship admin', 'deputyship director', 'deputyship analyst', 'deputyship manager'])
    )
  );

CREATE POLICY "Staff can manage own municipality living_labs" ON public.living_labs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND ur.municipality_id = living_labs.municipality_id
      AND lower(r.name) = ANY(ARRAY['municipality staff', 'municipality admin', 'municipality director', 'municipality manager', 'living lab manager'])
    )
  );

CREATE POLICY "Anyone can view active living_labs" ON public.living_labs
  FOR SELECT USING (
    status IN ('active', 'operational') AND (is_deleted = false OR is_deleted IS NULL)
  );

-- =============================================
-- 3. RLS POLICIES FOR INNOVATION PROPOSALS
-- =============================================

DROP POLICY IF EXISTS "Admins can manage innovation_proposals" ON public.innovation_proposals;
DROP POLICY IF EXISTS "Submitters can view own proposals" ON public.innovation_proposals;
DROP POLICY IF EXISTS "Submitters can manage own proposals" ON public.innovation_proposals;
DROP POLICY IF EXISTS "Staff can view proposals" ON public.innovation_proposals;
DROP POLICY IF EXISTS "Staff can view all proposals" ON public.innovation_proposals;
DROP POLICY IF EXISTS "Anyone can submit proposals" ON public.innovation_proposals;

CREATE POLICY "Admins can manage innovation_proposals" ON public.innovation_proposals
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Submitters can manage own proposals" ON public.innovation_proposals
  FOR ALL USING (
    submitter_id = auth.uid()
    OR submitter_email = auth.email()
  );

CREATE POLICY "Staff can view all proposals" ON public.innovation_proposals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND ur.is_active = true
      AND lower(r.name) = ANY(ARRAY[
        'deputyship staff', 'deputyship admin', 'deputyship director', 'deputyship analyst', 'deputyship manager',
        'municipality staff', 'municipality admin', 'municipality director', 'municipality manager'
      ])
    )
  );

CREATE POLICY "Anyone can submit proposals" ON public.innovation_proposals
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 4. ENABLE REALTIME
-- =============================================

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.sandboxes;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.innovation_proposals;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;