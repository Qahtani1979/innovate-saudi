-- Add missing columns to user_roles table for edge function compatibility
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS user_email text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON public.user_roles(user_email);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON public.user_roles(is_active);