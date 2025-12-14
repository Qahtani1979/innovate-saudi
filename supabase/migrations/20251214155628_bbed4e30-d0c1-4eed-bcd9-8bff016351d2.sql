-- Gap 2: Add strategic_plan_id to budgets table for strategic budget allocation
-- Per Phase 2 Action Plans and Integration Matrix A.2 (INDIRECT)

ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS strategic_plan_id uuid REFERENCES public.strategic_plans(id),
ADD COLUMN IF NOT EXISTS strategic_objective_id uuid,
ADD COLUMN IF NOT EXISTS is_strategy_allocated boolean DEFAULT false;

-- Create index for better performance on strategy-related queries
CREATE INDEX IF NOT EXISTS idx_budgets_strategic_plan_id ON public.budgets(strategic_plan_id);

COMMENT ON COLUMN public.budgets.strategic_plan_id IS 'Links budget to a strategic plan for strategic budget allocation';
COMMENT ON COLUMN public.budgets.strategic_objective_id IS 'Links budget to a specific strategic objective';
COMMENT ON COLUMN public.budgets.is_strategy_allocated IS 'Whether this budget was allocated from strategic planning';