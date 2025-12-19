
-- Fix RLS policies for strategy tables

-- =============================================
-- 1. strategy_baselines - Replace overly permissive policy
-- =============================================
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.strategy_baselines;

-- Admin full access
CREATE POLICY "Admins can manage strategy_baselines"
ON public.strategy_baselines
FOR ALL
USING (is_admin(auth.uid()));

-- Users can view baselines for plans they can access
CREATE POLICY "Users can view strategy_baselines"
ON public.strategy_baselines
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.strategic_plans sp
    WHERE sp.id = strategy_baselines.strategic_plan_id
    AND (sp.owner_email = auth.email() OR sp.status = 'active')
  )
);

-- Users can create baselines for their plans
CREATE POLICY "Users can create strategy_baselines"
ON public.strategy_baselines
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.strategic_plans sp
    WHERE sp.id = strategic_plan_id
    AND sp.owner_email = auth.email()
  )
);

-- Users can update baselines for their plans
CREATE POLICY "Users can update strategy_baselines"
ON public.strategy_baselines
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.strategic_plans sp
    WHERE sp.id = strategy_baselines.strategic_plan_id
    AND sp.owner_email = auth.email()
  )
);

-- =============================================
-- 2. strategy_inputs - Replace overly permissive policy
-- =============================================
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.strategy_inputs;

-- Admin full access
CREATE POLICY "Admins can manage strategy_inputs"
ON public.strategy_inputs
FOR ALL
USING (is_admin(auth.uid()));

-- Users can view inputs for accessible plans
CREATE POLICY "Users can view strategy_inputs"
ON public.strategy_inputs
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.strategic_plans sp
    WHERE sp.id = strategy_inputs.strategic_plan_id
    AND (sp.owner_email = auth.email() OR sp.status = 'active')
  )
);

-- Users can create inputs for their plans
CREATE POLICY "Users can create strategy_inputs"
ON public.strategy_inputs
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.strategic_plans sp
    WHERE sp.id = strategic_plan_id
    AND sp.owner_email = auth.email()
  )
);

-- Users can update inputs for their plans
CREATE POLICY "Users can update strategy_inputs"
ON public.strategy_inputs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.strategic_plans sp
    WHERE sp.id = strategy_inputs.strategic_plan_id
    AND sp.owner_email = auth.email()
  )
);

-- =============================================
-- 3. strategy_risks - Replace overly permissive policy
-- =============================================
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.strategy_risks;

-- Admin full access
CREATE POLICY "Admins can manage strategy_risks"
ON public.strategy_risks
FOR ALL
USING (is_admin(auth.uid()));

-- Users can view risks they own or for accessible plans
CREATE POLICY "Users can view strategy_risks"
ON public.strategy_risks
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    owner_email = auth.email()
    OR EXISTS (
      SELECT 1 FROM public.strategic_plans sp
      WHERE sp.id = strategy_risks.strategic_plan_id
      AND (sp.owner_email = auth.email() OR sp.status = 'active')
    )
  )
);

-- Users can create risks
CREATE POLICY "Users can create strategy_risks"
ON public.strategy_risks
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own risks or risks for their plans
CREATE POLICY "Users can update strategy_risks"
ON public.strategy_risks
FOR UPDATE
USING (
  owner_email = auth.email()
  OR EXISTS (
    SELECT 1 FROM public.strategic_plans sp
    WHERE sp.id = strategy_risks.strategic_plan_id
    AND sp.owner_email = auth.email()
  )
);

-- =============================================
-- 4. strategic_plans - Add INSERT/UPDATE for non-admins
-- =============================================
-- Users can create strategic plans
CREATE POLICY "Users can create strategic_plans"
ON public.strategic_plans
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own strategic plans
CREATE POLICY "Users can update their strategic_plans"
ON public.strategic_plans
FOR UPDATE
USING (owner_email = auth.email());

-- Users can view their own plans (including drafts)
CREATE POLICY "Users can view their own strategic_plans"
ON public.strategic_plans
FOR SELECT
USING (owner_email = auth.email());

-- =============================================
-- 5. strategic_plan_challenge_links - Add user policies
-- =============================================
-- Users can view links for accessible plans
CREATE POLICY "Users can view strategic_plan_challenge_links"
ON public.strategic_plan_challenge_links
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.strategic_plans sp
    WHERE sp.id = strategic_plan_challenge_links.strategic_plan_id
    AND (sp.owner_email = auth.email() OR sp.status = 'active')
  )
);

-- Users can create links for their plans
CREATE POLICY "Users can create strategic_plan_challenge_links"
ON public.strategic_plan_challenge_links
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.strategic_plans sp
    WHERE sp.id = strategic_plan_id
    AND sp.owner_email = auth.email()
  )
);

-- Users can delete links for their plans
CREATE POLICY "Users can delete strategic_plan_challenge_links"
ON public.strategic_plan_challenge_links
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.strategic_plans sp
    WHERE sp.id = strategic_plan_challenge_links.strategic_plan_id
    AND sp.owner_email = auth.email()
  )
);
