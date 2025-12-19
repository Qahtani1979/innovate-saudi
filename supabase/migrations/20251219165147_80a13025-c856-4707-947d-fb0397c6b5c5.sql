
-- Add status column to system_validations for tracking applicable/not_applicable
ALTER TABLE public.system_validations 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'checked', 'not_applicable', 'skipped'));

-- Update existing rows: set status based on is_checked
UPDATE public.system_validations SET status = CASE WHEN is_checked = true THEN 'checked' ELSE 'pending' END WHERE status IS NULL OR status = 'pending';
