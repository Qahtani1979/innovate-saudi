-- P0 CRITICAL: Add strategic fields to sandboxes table
ALTER TABLE public.sandboxes
ADD COLUMN IF NOT EXISTS strategic_plan_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS strategic_objective_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_strategy_derived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS strategy_derivation_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS strategic_gaps_addressed TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS strategic_taxonomy_codes TEXT[] DEFAULT '{}';

-- P0 CRITICAL: Add strategic fields to living_labs table
ALTER TABLE public.living_labs
ADD COLUMN IF NOT EXISTS strategic_plan_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS strategic_objective_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_strategy_derived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS strategy_derivation_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS research_priorities TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS strategic_taxonomy_codes TEXT[] DEFAULT '{}';

-- P0 CRITICAL: Add missing columns to programs table
ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS is_strategy_derived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS strategy_derivation_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS lessons_learned JSONB DEFAULT '[]';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_sandboxes_strategic_plan_ids ON public.sandboxes USING GIN(strategic_plan_ids);
CREATE INDEX IF NOT EXISTS idx_living_labs_strategic_plan_ids ON public.living_labs USING GIN(strategic_plan_ids);
CREATE INDEX IF NOT EXISTS idx_programs_is_strategy_derived ON public.programs(is_strategy_derived) WHERE is_strategy_derived = true;