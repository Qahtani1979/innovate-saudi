-- Add missing columns to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP WITH TIME ZONE;