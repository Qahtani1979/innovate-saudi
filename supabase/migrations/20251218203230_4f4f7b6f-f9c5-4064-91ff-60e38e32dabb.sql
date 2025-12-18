
-- =============================================
-- PHASE 4.5 (Part 0): UPDATE RLS POLICIES TO USE has_role_by_name
-- =============================================

-- 1. Drop and recreate challenges policy
DROP POLICY IF EXISTS "Municipality staff can manage own challenges" ON public.challenges;
CREATE POLICY "Municipality staff can manage own challenges" ON public.challenges
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND ur.is_active = true
        AND LOWER(r.name) = 'municipality staff'
        AND ur.municipality_id = challenges.municipality_id
    )
  );

-- 2. Drop and recreate municipalities policy
DROP POLICY IF EXISTS "Municipality staff can update own municipality" ON public.municipalities;
CREATE POLICY "Municipality staff can update own municipality" ON public.municipalities
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND ur.is_active = true
        AND LOWER(r.name) = 'municipality staff'
        AND ur.municipality_id = municipalities.id
    )
  );

-- 3. Drop and recreate pilots policy
DROP POLICY IF EXISTS "Municipality staff can manage own pilots" ON public.pilots;
CREATE POLICY "Municipality staff can manage own pilots" ON public.pilots
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND ur.is_active = true
        AND LOWER(r.name) = 'municipality staff'
        AND ur.municipality_id = pilots.municipality_id
    )
  );

-- 4. Drop and recreate rd_projects policy
DROP POLICY IF EXISTS "Researchers can manage own projects" ON public.rd_projects;
CREATE POLICY "Researchers can manage own projects" ON public.rd_projects
  FOR ALL TO authenticated
  USING (
    principal_investigator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND ur.is_active = true
        AND LOWER(r.name) = 'researcher'
    )
  );

-- 5. Drop and recreate solutions policy
DROP POLICY IF EXISTS "Providers can manage own solutions" ON public.solutions;
CREATE POLICY "Providers can manage own solutions" ON public.solutions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND ur.is_active = true
        AND LOWER(r.name) = 'provider'
        AND ur.organization_id = solutions.provider_id
    )
  );
