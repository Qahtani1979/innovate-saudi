-- Add template-specific columns to strategic_plans
ALTER TABLE public.strategic_plans
ADD COLUMN IF NOT EXISTS template_type TEXT,
ADD COLUMN IF NOT EXISTS template_category TEXT DEFAULT 'personal',
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS template_rating NUMERIC(2,1),
ADD COLUMN IF NOT EXISTS template_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS source_plan_id UUID REFERENCES public.strategic_plans(id),
ADD COLUMN IF NOT EXISTS template_tags TEXT[];

-- Create index for template queries
CREATE INDEX IF NOT EXISTS idx_strategic_plans_templates 
ON public.strategic_plans(is_template, is_public, template_type) 
WHERE is_template = true;

-- Create index for usage count sorting
CREATE INDEX IF NOT EXISTS idx_strategic_plans_usage 
ON public.strategic_plans(usage_count DESC) 
WHERE is_template = true;