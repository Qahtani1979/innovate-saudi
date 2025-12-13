-- Add strategic alignment fields to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS strategic_plan_ids uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS strategic_objective_ids uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS strategic_pillar_id uuid,
ADD COLUMN IF NOT EXISTS strategic_alignment_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_strategy_derived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS strategy_derivation_date timestamptz;

-- Add index for strategic queries
CREATE INDEX IF NOT EXISTS idx_events_strategic_plan_ids ON public.events USING GIN (strategic_plan_ids);
CREATE INDEX IF NOT EXISTS idx_events_strategic_objective_ids ON public.events USING GIN (strategic_objective_ids);

COMMENT ON COLUMN public.events.strategic_plan_ids IS 'Array of linked strategic plan IDs';
COMMENT ON COLUMN public.events.strategic_objective_ids IS 'Array of linked strategic objective IDs';
COMMENT ON COLUMN public.events.strategic_alignment_score IS 'Calculated alignment score 0-100';