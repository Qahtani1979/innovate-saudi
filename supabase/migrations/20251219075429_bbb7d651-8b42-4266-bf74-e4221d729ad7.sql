-- Fix budgets RLS policies - all IDs are UUID type
-- Drop any policies that were partially created
DROP POLICY IF EXISTS "budgets_admin_full_access" ON public.budgets;
DROP POLICY IF EXISTS "budgets_staff_view_own_municipality" ON public.budgets;
DROP POLICY IF EXISTS "budgets_staff_insert" ON public.budgets;
DROP POLICY IF EXISTS "budgets_staff_update" ON public.budgets;
DROP POLICY IF EXISTS "budgets_deputyship_view_all" ON public.budgets;

-- 1. Admin full access
CREATE POLICY "budgets_admin_full_access"
ON public.budgets
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
      AND ur.is_active = true
      AND LOWER(r.name) = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
      AND ur.is_active = true
      AND LOWER(r.name) = 'admin'
  )
);

-- 2. Staff can view budgets for their municipality entities
CREATE POLICY "budgets_staff_view_own_municipality"
ON public.budgets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND ur.municipality_id IS NOT NULL
      AND LOWER(r.name) IN ('municipality staff', 'municipality admin', 'municipality director', 'municipality manager')
  )
  AND (
    -- Budget is linked to user's municipality via strategic_plan
    strategic_plan_id IN (
      SELECT sp.id FROM public.strategic_plans sp
      WHERE sp.municipality_id IN (
        SELECT ur.municipality_id FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.is_active = true AND ur.municipality_id IS NOT NULL
      )
    )
    OR
    -- Budget entity_id matches user's municipality (both are UUID)
    entity_id IN (
      SELECT ur.municipality_id FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.is_active = true AND ur.municipality_id IS NOT NULL
    )
  )
);

-- 3. Staff can insert budgets
CREATE POLICY "budgets_staff_insert"
ON public.budgets
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND ur.municipality_id IS NOT NULL
      AND LOWER(r.name) IN ('municipality staff', 'municipality admin', 'municipality director', 'municipality manager')
  )
);

-- 4. Staff can update their municipality budgets
CREATE POLICY "budgets_staff_update"
ON public.budgets
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND ur.municipality_id IS NOT NULL
      AND LOWER(r.name) IN ('municipality staff', 'municipality admin', 'municipality director', 'municipality manager')
  )
  AND (
    strategic_plan_id IN (
      SELECT sp.id FROM public.strategic_plans sp
      WHERE sp.municipality_id IN (
        SELECT ur2.municipality_id FROM public.user_roles ur2
        WHERE ur2.user_id = auth.uid() AND ur2.is_active = true AND ur2.municipality_id IS NOT NULL
      )
    )
    OR
    entity_id IN (
      SELECT ur3.municipality_id FROM public.user_roles ur3
      WHERE ur3.user_id = auth.uid() AND ur3.is_active = true AND ur3.municipality_id IS NOT NULL
    )
  )
);

-- 5. Deputyship staff can view all budgets (national oversight)
CREATE POLICY "budgets_deputyship_view_all"
ON public.budgets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND LOWER(r.name) IN ('deputyship staff', 'deputyship admin', 'deputyship director', 'deputyship analyst', 'deputyship manager')
  )
);