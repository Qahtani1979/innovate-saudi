
-- Fix Experts System Database & RLS Gaps

-- GAP: Add expert_email column to expert_assignments (code uses this)
ALTER TABLE public.expert_assignments ADD COLUMN IF NOT EXISTS expert_email text;

-- GAP db-6: Add is_deleted column to expert_profiles
ALTER TABLE public.expert_profiles ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;

-- GAP db-9: Add performance indexes
CREATE INDEX IF NOT EXISTS idx_expert_profiles_user_email ON public.expert_profiles(user_email);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_user_id ON public.expert_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_assignments_entity ON public.expert_assignments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_expert_assignments_expert ON public.expert_assignments(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_evaluations_entity ON public.expert_evaluations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_expert_evaluations_evaluator ON public.expert_evaluations(evaluator_email);

-- GAP rls-7: Policy for experts to manage their own profile
CREATE POLICY "Experts can insert their own profile"
ON public.expert_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Experts can update their own profile"
ON public.expert_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- GAP rls-8: Policy for experts to view their own evaluations
CREATE POLICY "Experts can view their own evaluations"
ON public.expert_evaluations
FOR SELECT
USING (evaluator_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- GAP rls-9: Policy for experts to view their assignments (by expert_id)
CREATE POLICY "Experts can view their assignments"
ON public.expert_assignments
FOR SELECT
USING (expert_id = auth.uid() OR expert_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
