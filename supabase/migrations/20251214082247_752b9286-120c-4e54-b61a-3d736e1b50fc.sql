-- Phase 2: Strategy Creation Database Tables

-- 1. Strategy Milestones
CREATE TABLE public.strategy_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id uuid REFERENCES strategic_plans(id) ON DELETE CASCADE,
  objective_id uuid,
  title_en text NOT NULL,
  title_ar text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  dependencies uuid[] DEFAULT '{}',
  owner_email text,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'delayed', 'cancelled')),
  deliverables text[] DEFAULT '{}',
  resources_required text[] DEFAULT '{}',
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Strategy Ownership (RACI)
CREATE TABLE public.strategy_ownership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id uuid REFERENCES strategic_plans(id) ON DELETE CASCADE,
  objective_id uuid,
  objective_title text,
  responsible_email text,
  accountable_email text,
  consulted_emails text[] DEFAULT '{}',
  informed_emails text[] DEFAULT '{}',
  delegation_allowed boolean DEFAULT false,
  escalation_path text,
  notifications_enabled boolean DEFAULT true,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Action Plans
CREATE TABLE public.action_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id uuid REFERENCES strategic_plans(id) ON DELETE CASCADE,
  objective_id uuid,
  objective_title text,
  title_en text NOT NULL,
  title_ar text,
  total_budget numeric DEFAULT 0,
  currency text DEFAULT 'SAR',
  start_date date,
  end_date date,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'in_progress', 'completed', 'cancelled')),
  owner_email text,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Action Items
CREATE TABLE public.action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_plan_id uuid REFERENCES action_plans(id) ON DELETE CASCADE,
  title_en text NOT NULL,
  title_ar text,
  description text,
  owner_email text,
  start_date date,
  end_date date,
  budget numeric DEFAULT 0,
  dependencies uuid[] DEFAULT '{}',
  deliverables text[] DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'cancelled')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. National Strategy Alignments
CREATE TABLE public.national_strategy_alignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id uuid REFERENCES strategic_plans(id) ON DELETE CASCADE,
  objective_id uuid,
  national_strategy_type text CHECK (national_strategy_type IN ('vision_2030', 'sdg', 'national_innovation', 'sector_specific')),
  national_goal_code text,
  national_goal_name_en text,
  national_goal_name_ar text,
  alignment_score integer CHECK (alignment_score >= 0 AND alignment_score <= 100),
  alignment_notes text,
  contribution_type text CHECK (contribution_type IN ('direct', 'indirect', 'enabling')),
  created_by text,
  created_at timestamptz DEFAULT now()
);

-- 6. Sector Strategies
CREATE TABLE public.sector_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_plan_id uuid REFERENCES strategic_plans(id) ON DELETE CASCADE,
  sector_id uuid REFERENCES sectors(id),
  name_en text NOT NULL,
  name_ar text,
  vision_en text,
  vision_ar text,
  objectives jsonb DEFAULT '[]',
  kpis jsonb DEFAULT '[]',
  owner_email text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'archived')),
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.strategy_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.national_strategy_alignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sector_strategies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for strategy_milestones
CREATE POLICY "Admins can manage strategy_milestones" ON public.strategy_milestones
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own milestones" ON public.strategy_milestones
  FOR SELECT USING (auth.email() = owner_email OR auth.email() = created_by);

CREATE POLICY "Users can create milestones" ON public.strategy_milestones
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own milestones" ON public.strategy_milestones
  FOR UPDATE USING (auth.email() = owner_email OR auth.email() = created_by);

-- RLS Policies for strategy_ownership
CREATE POLICY "Admins can manage strategy_ownership" ON public.strategy_ownership
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view ownership records" ON public.strategy_ownership
  FOR SELECT USING (
    auth.email() = responsible_email OR 
    auth.email() = accountable_email OR 
    auth.email() = ANY(consulted_emails) OR
    auth.email() = ANY(informed_emails) OR
    auth.email() = created_by
  );

CREATE POLICY "Users can create ownership records" ON public.strategy_ownership
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update ownership records" ON public.strategy_ownership
  FOR UPDATE USING (auth.email() = created_by);

-- RLS Policies for action_plans
CREATE POLICY "Admins can manage action_plans" ON public.action_plans
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their action_plans" ON public.action_plans
  FOR SELECT USING (auth.email() = owner_email OR auth.email() = created_by);

CREATE POLICY "Users can create action_plans" ON public.action_plans
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their action_plans" ON public.action_plans
  FOR UPDATE USING (auth.email() = owner_email OR auth.email() = created_by);

-- RLS Policies for action_items
CREATE POLICY "Admins can manage action_items" ON public.action_items
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view action_items" ON public.action_items
  FOR SELECT USING (auth.email() = owner_email);

CREATE POLICY "Users can create action_items" ON public.action_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their action_items" ON public.action_items
  FOR UPDATE USING (auth.email() = owner_email);

-- RLS Policies for national_strategy_alignments
CREATE POLICY "Admins can manage national_strategy_alignments" ON public.national_strategy_alignments
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view alignments" ON public.national_strategy_alignments
  FOR SELECT USING (true);

CREATE POLICY "Users can create alignments" ON public.national_strategy_alignments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for sector_strategies
CREATE POLICY "Admins can manage sector_strategies" ON public.sector_strategies
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view sector_strategies" ON public.sector_strategies
  FOR SELECT USING (auth.email() = owner_email OR auth.email() = created_by OR status = 'active');

CREATE POLICY "Users can create sector_strategies" ON public.sector_strategies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their sector_strategies" ON public.sector_strategies
  FOR UPDATE USING (auth.email() = owner_email OR auth.email() = created_by);

-- Triggers for updated_at
CREATE TRIGGER update_strategy_milestones_updated_at
  BEFORE UPDATE ON public.strategy_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategy_ownership_updated_at
  BEFORE UPDATE ON public.strategy_ownership
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_action_plans_updated_at
  BEFORE UPDATE ON public.action_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_action_items_updated_at
  BEFORE UPDATE ON public.action_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sector_strategies_updated_at
  BEFORE UPDATE ON public.sector_strategies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();