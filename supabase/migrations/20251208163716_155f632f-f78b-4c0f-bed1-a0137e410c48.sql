-- Add missing columns to solution_cases table
ALTER TABLE public.solution_cases ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Add missing columns to policy_documents table  
ALTER TABLE public.policy_documents ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Now create policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Admins can manage solution cases" ON public.solution_cases;
DROP POLICY IF EXISTS "Anyone can view published solution cases" ON public.solution_cases;
DROP POLICY IF EXISTS "Admins can manage scaling plans" ON public.scaling_plans;
DROP POLICY IF EXISTS "Admins can manage program applications" ON public.program_applications;
DROP POLICY IF EXISTS "Admins can manage user invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Admins can manage teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can manage policy documents" ON public.policy_documents;
DROP POLICY IF EXISTS "Anyone can view published policy docs" ON public.policy_documents;
DROP POLICY IF EXISTS "Admins can manage pilot expenses" ON public.pilot_expenses;
DROP POLICY IF EXISTS "Admins can manage stakeholder feedback" ON public.stakeholder_feedback;
DROP POLICY IF EXISTS "Users can submit feedback" ON public.stakeholder_feedback;
DROP POLICY IF EXISTS "Admins can manage scaling readiness" ON public.scaling_readiness;
DROP POLICY IF EXISTS "Admins can manage strategic plan links" ON public.strategic_plan_challenge_links;
DROP POLICY IF EXISTS "Admins can manage program mentorships" ON public.program_mentorships;

-- Enable RLS
ALTER TABLE public.solution_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scaling_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholder_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scaling_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_plan_challenge_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_mentorships ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage solution cases" ON public.solution_cases FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view published solution cases" ON public.solution_cases FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage scaling plans" ON public.scaling_plans FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage program applications" ON public.program_applications FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage user invitations" ON public.user_invitations FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage teams" ON public.teams FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage policy documents" ON public.policy_documents FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view published policy docs" ON public.policy_documents FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage pilot expenses" ON public.pilot_expenses FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage stakeholder feedback" ON public.stakeholder_feedback FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can submit feedback" ON public.stakeholder_feedback FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage scaling readiness" ON public.scaling_readiness FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage strategic plan links" ON public.strategic_plan_challenge_links FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage program mentorships" ON public.program_mentorships FOR ALL USING (is_admin(auth.uid()));