-- Add missing lifecycle and soft-delete columns to strategic_plans
ALTER TABLE public.strategic_plans 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by TEXT,
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS activated_by TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_by TEXT,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by TEXT,
ADD COLUMN IF NOT EXISTS code TEXT;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_strategic_plans_status ON public.strategic_plans(status);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_approval ON public.strategic_plans(approval_status);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_deleted ON public.strategic_plans(is_deleted);