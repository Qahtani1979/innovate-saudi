-- Create scaling_rollouts table for rollout tracking
CREATE TABLE IF NOT EXISTS public.scaling_rollouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scaling_plan_id UUID REFERENCES public.scaling_plans(id) ON DELETE CASCADE,
  municipality_id UUID REFERENCES public.municipalities(id),
  phase TEXT NOT NULL DEFAULT 'planning',
  status TEXT NOT NULL DEFAULT 'pending',
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  progress_percentage INTEGER DEFAULT 0,
  rollout_lead_email TEXT,
  notes TEXT,
  blockers JSONB DEFAULT '[]',
  success_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create scaling_municipalities table for municipal scaling status
CREATE TABLE IF NOT EXISTS public.scaling_municipalities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scaling_plan_id UUID REFERENCES public.scaling_plans(id) ON DELETE CASCADE,
  municipality_id UUID REFERENCES public.municipalities(id),
  readiness_score INTEGER DEFAULT 0,
  readiness_status TEXT DEFAULT 'not_assessed',
  onboarding_status TEXT DEFAULT 'pending',
  onboarding_started_at TIMESTAMPTZ,
  onboarding_completed_at TIMESTAMPTZ,
  training_status TEXT DEFAULT 'not_started',
  infrastructure_ready BOOLEAN DEFAULT false,
  budget_allocated BOOLEAN DEFAULT false,
  staff_assigned BOOLEAN DEFAULT false,
  local_champion_email TEXT,
  barriers JSONB DEFAULT '[]',
  support_requests JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(scaling_plan_id, municipality_id)
);

-- Enable RLS
ALTER TABLE public.scaling_rollouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scaling_municipalities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scaling_rollouts
CREATE POLICY "Authenticated users can view scaling rollouts"
ON public.scaling_rollouts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Staff can manage scaling rollouts"
ON public.scaling_rollouts FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policies for scaling_municipalities
CREATE POLICY "Authenticated users can view scaling municipalities"
ON public.scaling_municipalities FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Staff can manage scaling municipalities"
ON public.scaling_municipalities FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_scaling_rollouts_plan ON public.scaling_rollouts(scaling_plan_id);
CREATE INDEX idx_scaling_rollouts_municipality ON public.scaling_rollouts(municipality_id);
CREATE INDEX idx_scaling_rollouts_status ON public.scaling_rollouts(status);
CREATE INDEX idx_scaling_municipalities_plan ON public.scaling_municipalities(scaling_plan_id);
CREATE INDEX idx_scaling_municipalities_municipality ON public.scaling_municipalities(municipality_id);
CREATE INDEX idx_scaling_municipalities_readiness ON public.scaling_municipalities(readiness_status);