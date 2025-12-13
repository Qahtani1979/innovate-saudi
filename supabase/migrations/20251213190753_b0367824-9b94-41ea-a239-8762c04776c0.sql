-- P1 HIGH PRIORITY: Add strategic fields to partnerships table
ALTER TABLE public.partnerships
ADD COLUMN IF NOT EXISTS strategic_plan_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS strategic_objective_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS strategy_derivation_date TIMESTAMPTZ;

-- P1: Add campaign links to email_campaigns
ALTER TABLE public.email_campaigns
ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.programs(id),
ADD COLUMN IF NOT EXISTS challenge_id UUID REFERENCES public.challenges(id);

-- P1: Add R&D path to scaling_plans
ALTER TABLE public.scaling_plans
ADD COLUMN IF NOT EXISTS rd_project_id UUID REFERENCES public.rd_projects(id);

-- P1: Add program link to rd_calls
ALTER TABLE public.rd_calls
ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.programs(id);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_partnerships_strategic_plan_ids ON public.partnerships USING GIN(strategic_plan_ids);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_program_id ON public.email_campaigns(program_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_challenge_id ON public.email_campaigns(challenge_id);
CREATE INDEX IF NOT EXISTS idx_scaling_plans_rd_project_id ON public.scaling_plans(rd_project_id);
CREATE INDEX IF NOT EXISTS idx_rd_calls_program_id ON public.rd_calls(program_id);