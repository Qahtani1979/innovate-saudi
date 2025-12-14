-- Phase 4: Strategy Governance Tables

-- Strategy Sign-offs Table
CREATE TABLE public.strategy_signoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id uuid REFERENCES strategic_plans(id) ON DELETE CASCADE,
  stakeholder_name text NOT NULL,
  stakeholder_role text NOT NULL,
  stakeholder_email text,
  requested_date timestamptz DEFAULT now(),
  due_date timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  signed_date timestamptz,
  comments text,
  reminder_count integer DEFAULT 0,
  conditions text[],
  delegate_email text,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Strategy Versions Table
CREATE TABLE public.strategy_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id uuid REFERENCES strategic_plans(id) ON DELETE CASCADE,
  version_number text NOT NULL,
  version_label text,
  change_summary text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'superseded')),
  changes jsonb DEFAULT '[]',
  snapshot_data jsonb,
  created_by text,
  created_at timestamptz DEFAULT now()
);

-- Committee Decisions Table
CREATE TABLE public.committee_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_name text NOT NULL,
  meeting_date timestamptz,
  strategic_plan_id uuid REFERENCES strategic_plans(id),
  decision_type text CHECK (decision_type IN ('approval', 'direction', 'deferral', 'rejection')),
  subject text NOT NULL,
  decision_text text,
  conditions text[],
  vote_for integer DEFAULT 0,
  vote_against integer DEFAULT 0,
  vote_abstain integer DEFAULT 0,
  rationale text,
  action_items jsonb DEFAULT '[]',
  related_entity_type text,
  related_entity_id uuid,
  responsible_email text,
  due_date timestamptz,
  created_by text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.strategy_signoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_decisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for strategy_signoffs
CREATE POLICY "Users can view strategy signoffs" ON public.strategy_signoffs
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create strategy signoffs" ON public.strategy_signoffs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update strategy signoffs" ON public.strategy_signoffs
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete strategy signoffs" ON public.strategy_signoffs
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for strategy_versions
CREATE POLICY "Users can view strategy versions" ON public.strategy_versions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create strategy versions" ON public.strategy_versions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update strategy versions" ON public.strategy_versions
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for committee_decisions
CREATE POLICY "Users can view committee decisions" ON public.committee_decisions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create committee decisions" ON public.committee_decisions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update committee decisions" ON public.committee_decisions
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Indexes for performance
CREATE INDEX idx_strategy_signoffs_plan ON public.strategy_signoffs(strategic_plan_id);
CREATE INDEX idx_strategy_signoffs_status ON public.strategy_signoffs(status);
CREATE INDEX idx_strategy_versions_plan ON public.strategy_versions(strategic_plan_id);
CREATE INDEX idx_strategy_versions_status ON public.strategy_versions(status);
CREATE INDEX idx_committee_decisions_plan ON public.committee_decisions(strategic_plan_id);