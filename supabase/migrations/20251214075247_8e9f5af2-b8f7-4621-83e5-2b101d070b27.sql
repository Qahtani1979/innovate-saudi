-- ==========================================
-- PHASE 1: PRE-PLANNING DATABASE TABLES
-- ==========================================

-- 1. SWOT Analysis Storage
CREATE TABLE public.swot_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id uuid REFERENCES strategic_plans(id) ON DELETE CASCADE,
  quadrant text NOT NULL CHECK (quadrant IN ('strength', 'weakness', 'opportunity', 'threat')),
  title_en text NOT NULL,
  title_ar text,
  description_en text,
  description_ar text,
  impact_level text CHECK (impact_level IN ('high', 'medium', 'low')),
  priority text CHECK (priority IN ('high', 'medium', 'low')),
  source text CHECK (source IN ('ai', 'manual', 'stakeholder')),
  related_entity_ids uuid[],
  created_by_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Stakeholder Analysis Storage
CREATE TABLE public.stakeholder_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id uuid REFERENCES strategic_plans(id) ON DELETE CASCADE,
  stakeholder_name_en text NOT NULL,
  stakeholder_name_ar text,
  stakeholder_type text CHECK (stakeholder_type IN ('government', 'private', 'academic', 'ngo', 'citizen', 'international')),
  power_level integer CHECK (power_level BETWEEN 0 AND 100),
  interest_level integer CHECK (interest_level BETWEEN 0 AND 100),
  current_engagement text CHECK (current_engagement IN ('champion', 'supporter', 'neutral', 'critic', 'blocker')),
  influence_description text,
  expectations text,
  engagement_strategy text,
  contact_info text,
  created_by_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Strategy Risk Registry
CREATE TABLE public.strategy_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id uuid REFERENCES strategic_plans(id) ON DELETE CASCADE,
  name_en text NOT NULL,
  name_ar text,
  description text,
  category text CHECK (category IN ('strategic', 'operational', 'financial', 'compliance', 'reputational', 'technology', 'political', 'environmental')),
  probability integer CHECK (probability BETWEEN 1 AND 5),
  impact integer CHECK (impact BETWEEN 1 AND 5),
  status text DEFAULT 'identified' CHECK (status IN ('identified', 'analyzing', 'mitigating', 'monitoring', 'closed')),
  owner_email text,
  mitigation_strategy text,
  contingency_plan text,
  triggers text,
  residual_probability integer CHECK (residual_probability BETWEEN 1 AND 5),
  residual_impact integer CHECK (residual_impact BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Environmental Scan Factors (PESTLE)
CREATE TABLE public.environmental_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id uuid REFERENCES strategic_plans(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('political', 'economic', 'social', 'technological', 'legal', 'environmental')),
  title_en text NOT NULL,
  title_ar text,
  description_en text,
  description_ar text,
  impact_type text CHECK (impact_type IN ('opportunity', 'threat')),
  impact_level text CHECK (impact_level IN ('high', 'medium', 'low')),
  trend text CHECK (trend IN ('increasing', 'stable', 'decreasing')),
  source text,
  date_identified date DEFAULT CURRENT_DATE,
  created_by_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Strategy Inputs Collection
CREATE TABLE public.strategy_inputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id uuid REFERENCES strategic_plans(id) ON DELETE CASCADE,
  source_type text CHECK (source_type IN ('municipality', 'department', 'citizen', 'expert', 'stakeholder', 'survey')),
  source_entity_id uuid,
  source_name text,
  input_title text,
  input_text text NOT NULL,
  theme text,
  sentiment text CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  priority_votes integer DEFAULT 0,
  ai_extracted_themes text[],
  status text DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'incorporated', 'rejected')),
  created_by_email text,
  created_at timestamptz DEFAULT now()
);

-- 6. Baseline Data Collection
CREATE TABLE public.strategy_baselines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id uuid REFERENCES strategic_plans(id) ON DELETE CASCADE,
  category text CHECK (category IN ('innovation', 'challenges', 'pilots', 'partnerships', 'budget', 'pipeline')),
  kpi_name_en text NOT NULL,
  kpi_name_ar text,
  baseline_value numeric NOT NULL,
  unit text CHECK (unit IN ('percentage', 'score', 'count', 'currency', 'days')),
  target_value numeric,
  collection_date date DEFAULT CURRENT_DATE,
  source text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'outdated')),
  notes text,
  created_by_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.swot_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholder_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_baselines ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all operations for authenticated users (strategy management access)
CREATE POLICY "Allow all for authenticated users" ON public.swot_analyses FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.stakeholder_analyses FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.strategy_risks FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.environmental_factors FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.strategy_inputs FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.strategy_baselines FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_swot_strategic_plan ON public.swot_analyses(strategic_plan_id);
CREATE INDEX idx_swot_quadrant ON public.swot_analyses(quadrant);
CREATE INDEX idx_stakeholder_strategic_plan ON public.stakeholder_analyses(strategic_plan_id);
CREATE INDEX idx_risks_strategic_plan ON public.strategy_risks(strategic_plan_id);
CREATE INDEX idx_risks_status ON public.strategy_risks(status);
CREATE INDEX idx_env_factors_strategic_plan ON public.environmental_factors(strategic_plan_id);
CREATE INDEX idx_env_factors_category ON public.environmental_factors(category);
CREATE INDEX idx_strategy_inputs_strategic_plan ON public.strategy_inputs(strategic_plan_id);
CREATE INDEX idx_baselines_strategic_plan ON public.strategy_baselines(strategic_plan_id);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_swot_analyses_updated_at BEFORE UPDATE ON public.swot_analyses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stakeholder_analyses_updated_at BEFORE UPDATE ON public.stakeholder_analyses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_strategy_risks_updated_at BEFORE UPDATE ON public.strategy_risks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_environmental_factors_updated_at BEFORE UPDATE ON public.environmental_factors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_strategy_baselines_updated_at BEFORE UPDATE ON public.strategy_baselines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();