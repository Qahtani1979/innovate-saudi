-- Add version control, draft management, and extended data columns to strategic_plans

-- Version control columns
ALTER TABLE public.strategic_plans 
ADD COLUMN IF NOT EXISTS version_number integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS previous_version_id uuid REFERENCES public.strategic_plans(id),
ADD COLUMN IF NOT EXISTS version_notes text;

-- Draft management columns
ALTER TABLE public.strategic_plans 
ADD COLUMN IF NOT EXISTS last_saved_step integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS draft_data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false;

-- Extended wizard data storage
ALTER TABLE public.strategic_plans 
ADD COLUMN IF NOT EXISTS mission_en text,
ADD COLUMN IF NOT EXISTS mission_ar text,
ADD COLUMN IF NOT EXISTS stakeholders jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS pestel jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS swot jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS scenarios jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS risks jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS dependencies jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS constraints jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS national_alignments jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS action_plans jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS resource_plan jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS milestones jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS phases jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS governance jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS communication_plan jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS change_management jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_sectors text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_regions text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS strategic_themes text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS focus_technologies text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS vision_2030_programs text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS budget_range text,
ADD COLUMN IF NOT EXISTS core_values text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS strategic_pillars text[] DEFAULT '{}';

-- Approval workflow columns
ALTER TABLE public.strategic_plans 
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS submitted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS submitted_by text,
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approved_by text,
ADD COLUMN IF NOT EXISTS approval_notes text,
ADD COLUMN IF NOT EXISTS owner_email text;

-- Create index for version tracking
CREATE INDEX IF NOT EXISTS idx_strategic_plans_version ON public.strategic_plans(previous_version_id);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_status ON public.strategic_plans(status);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_approval_status ON public.strategic_plans(approval_status);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_owner ON public.strategic_plans(owner_email);