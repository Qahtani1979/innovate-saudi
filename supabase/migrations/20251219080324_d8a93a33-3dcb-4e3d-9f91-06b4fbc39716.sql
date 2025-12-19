-- Fix INSERT policies missing WITH CHECK clauses
-- Fix overly permissive UPDATE/DELETE policies

-- =============================================
-- 1. ACTION_ITEMS - Add WITH CHECK to INSERT
-- =============================================
DROP POLICY IF EXISTS "Users can create action_items" ON public.action_items;
CREATE POLICY "action_items_user_insert"
ON public.action_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 2. ACTION_PLANS - Add WITH CHECK to INSERT
-- =============================================
DROP POLICY IF EXISTS "Users can create action_plans" ON public.action_plans;
CREATE POLICY "action_plans_user_insert"
ON public.action_plans
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (owner_email = auth.email() OR created_by = auth.email())
);

-- =============================================
-- 3. STRATEGIC_PLANS - Add WITH CHECK to INSERT
-- =============================================
DROP POLICY IF EXISTS "Users can create strategic_plans" ON public.strategic_plans;
CREATE POLICY "strategic_plans_user_insert"
ON public.strategic_plans
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND owner_email = auth.email()
);

-- =============================================
-- 4. STRATEGY_BASELINES - Add WITH CHECK to INSERT
-- =============================================
DROP POLICY IF EXISTS "Users can create strategy_baselines" ON public.strategy_baselines;
CREATE POLICY "strategy_baselines_user_insert"
ON public.strategy_baselines
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 5. STRATEGY_INPUTS - Add WITH CHECK to INSERT
-- =============================================
DROP POLICY IF EXISTS "Users can create strategy_inputs" ON public.strategy_inputs;
CREATE POLICY "strategy_inputs_user_insert"
ON public.strategy_inputs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 6. STRATEGY_RISKS - Add WITH CHECK to INSERT
-- =============================================
DROP POLICY IF EXISTS "Users can create strategy_risks" ON public.strategy_risks;
CREATE POLICY "strategy_risks_user_insert"
ON public.strategy_risks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 7. STRATEGY_MILESTONES - Add WITH CHECK to INSERT
-- =============================================
DROP POLICY IF EXISTS "Users can create milestones" ON public.strategy_milestones;
CREATE POLICY "strategy_milestones_user_insert"
ON public.strategy_milestones
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 8. STRATEGY_OWNERSHIP - Add WITH CHECK to INSERT
-- =============================================
DROP POLICY IF EXISTS "Users can create ownership records" ON public.strategy_ownership;
CREATE POLICY "strategy_ownership_user_insert"
ON public.strategy_ownership
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.email());

-- =============================================
-- 9. STRATEGIC_PLAN_CHALLENGE_LINKS - Add WITH CHECK to INSERT
-- =============================================
DROP POLICY IF EXISTS "Users can create strategic_plan_challenge_links" ON public.strategic_plan_challenge_links;
CREATE POLICY "strategic_plan_challenge_links_user_insert"
ON public.strategic_plan_challenge_links
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 10. NATIONAL_STRATEGY_ALIGNMENTS - Add WITH CHECK to INSERT
-- =============================================
DROP POLICY IF EXISTS "Users can create alignments" ON public.national_strategy_alignments;
CREATE POLICY "national_strategy_alignments_user_insert"
ON public.national_strategy_alignments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 11. SECTOR_STRATEGIES - Add WITH CHECK to INSERT
-- =============================================
DROP POLICY IF EXISTS "Users can create sector_strategies" ON public.sector_strategies;
CREATE POLICY "sector_strategies_user_insert"
ON public.sector_strategies
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 12. STRATEGY_SIGNOFFS - Fix overly permissive policies
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can create strategy signoffs" ON public.strategy_signoffs;
DROP POLICY IF EXISTS "Authenticated users can update strategy signoffs" ON public.strategy_signoffs;
DROP POLICY IF EXISTS "Authenticated users can delete strategy signoffs" ON public.strategy_signoffs;
DROP POLICY IF EXISTS "Users can view strategy signoffs" ON public.strategy_signoffs;

-- Admin full access
CREATE POLICY "strategy_signoffs_admin_all"
ON public.strategy_signoffs
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Users can view signoffs for plans they own or are stakeholders of
CREATE POLICY "strategy_signoffs_user_view"
ON public.strategy_signoffs
FOR SELECT
TO authenticated
USING (
  stakeholder_email = auth.email()
  OR delegate_email = auth.email()
  OR created_by = auth.email()
  OR EXISTS (
    SELECT 1 FROM strategic_plans sp
    WHERE sp.id = strategic_plan_id AND sp.owner_email = auth.email()
  )
);

-- Users can create signoffs
CREATE POLICY "strategy_signoffs_user_insert"
ON public.strategy_signoffs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.email());

-- Users can update their own signoffs (stakeholder or delegate)
CREATE POLICY "strategy_signoffs_user_update"
ON public.strategy_signoffs
FOR UPDATE
TO authenticated
USING (
  stakeholder_email = auth.email()
  OR delegate_email = auth.email()
)
WITH CHECK (
  stakeholder_email = auth.email()
  OR delegate_email = auth.email()
);

-- =============================================
-- 13. STRATEGY_VERSIONS - Fix overly permissive policies
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can create strategy versions" ON public.strategy_versions;
DROP POLICY IF EXISTS "Authenticated users can update strategy versions" ON public.strategy_versions;
DROP POLICY IF EXISTS "Users can view strategy versions" ON public.strategy_versions;

-- Admin full access
CREATE POLICY "strategy_versions_admin_all"
ON public.strategy_versions
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Users can view versions for their plans
CREATE POLICY "strategy_versions_user_view"
ON public.strategy_versions
FOR SELECT
TO authenticated
USING (
  created_by = auth.email()
  OR EXISTS (
    SELECT 1 FROM strategic_plans sp
    WHERE sp.id = strategic_plan_id AND sp.owner_email = auth.email()
  )
);

-- Users can create versions
CREATE POLICY "strategy_versions_user_insert"
ON public.strategy_versions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.email());

-- Users can update their own versions
CREATE POLICY "strategy_versions_user_update"
ON public.strategy_versions
FOR UPDATE
TO authenticated
USING (created_by = auth.email())
WITH CHECK (created_by = auth.email());